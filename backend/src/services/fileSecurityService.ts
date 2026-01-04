import crypto from 'crypto';
import logger from '../utils/logger';
import config from '../config';

/**
 * File Security Service
 * Handles security checks and validation for uploaded files
 */

// Security scan result
export interface SecurityScanResult {
  isSafe: boolean;
  threats: string[];
  confidence: number;
}

// File metadata
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  hash: string;
}

/**
 * File Security Service Class
 */
class FileSecurityService {
  /**
   * Generate a secure hash for a file
   * @param buffer - File buffer
   * @returns SHA-256 hash of the file
   */
  generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Extract file metadata
   * @param buffer - File buffer
   * @param originalName - Original filename
   * @returns File metadata
   */
  extractFileMetadata(buffer: Buffer, originalName: string): FileMetadata {
    return {
      name: originalName,
      size: buffer.length,
      type: 'application/octet-stream', // Default, will be updated by file-type detection
      hash: this.generateFileHash(buffer),
    };
  }

  /**
   * Basic security scan for uploaded files
   * @param buffer - File buffer
   * @param filename - Original filename
   * @returns Security scan result
   */
  async scanFile(buffer: Buffer, filename: string): Promise<SecurityScanResult> {
    const threats: string[] = [];
    let confidence = 100; // Start with 100% confidence, reduce if threats found

    try {
      // Check for executable file signatures
      const executableSignatures = [
        Buffer.from([0x4D, 0x5A]), // PE/Windows executable
        Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF/Linux executable
        Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Java class file
        Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), // Mach-O binary
      ];

      for (const signature of executableSignatures) {
        if (buffer.subarray(0, signature.length).equals(signature)) {
          threats.push('Executable file detected');
          confidence -= 50;
        }
      }

      // Check for script content in images (potential XSS)
      if (this.isImageFile(filename)) {
        const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
        if (content.includes('<script') || content.includes('javascript:')) {
          threats.push('Potential script content in image');
          confidence -= 40;
        }
      }

      // Check for suspicious file extensions
      const suspiciousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.aspx', '.jsp', '.sh', '.ps1', '.py', '.rb', '.pl'
      ];

      const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      if (suspiciousExtensions.includes(fileExtension)) {
        threats.push(`Suspicious file extension: ${fileExtension}`);
        confidence -= 30;
      }

      // Check for zip bombs (very small compressed files that expand to huge sizes)
      if (filename.toLowerCase().endsWith('.zip') && buffer.length < 1024) {
        threats.push('Potential zip bomb detected');
        confidence -= 25;
      }

      // Check for null bytes in filename (potential path traversal)
      if (filename.includes('\0')) {
        threats.push('Null bytes in filename');
        confidence -= 20;
      }

      // Check for path traversal patterns in filename
      const pathTraversalPatterns = ['../', '..\\', '~/', '/etc/', '/var/', '/sys/'];
      for (const pattern of pathTraversalPatterns) {
        if (filename.includes(pattern)) {
          threats.push(`Path traversal pattern detected: ${pattern}`);
          confidence -= 15;
        }
      }

      return {
        isSafe: threats.length === 0,
        threats,
        confidence: Math.max(0, confidence),
      };
    } catch (error) {
      logger.error('Error during file security scan:', error);
      return {
        isSafe: false,
        threats: ['Security scan failed'],
        confidence: 0,
      };
    }
  }

  /**
   * Check if file is an image based on extension
   * @param filename - Filename
   * @returns True if file is an image
   */
  isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  /**
   * Sanitize filename to prevent directory traversal and other attacks
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  sanitizeFilename(filename: string): string {
    // Remove path traversal patterns
    let sanitized = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '_');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove special characters that could cause issues
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

    // Limit filename length
    if (sanitized.length > 255) {
      const extension = sanitized.substring(sanitized.lastIndexOf('.'));
      const nameWithoutExtension = sanitized.substring(0, sanitized.lastIndexOf('.'));
      sanitized = nameWithoutExtension.substring(0, 255 - extension.length) + extension;
    }

    // Ensure filename is not empty
    if (sanitized.trim() === '') {
      sanitized = 'file_' + Date.now();
    }

    return sanitized;
  }

  /**
   * Generate a secure filename with timestamp and random string
   * @param originalName - Original filename
   * @returns Secure filename
   */
  generateSecureFilename(originalName: string): string {
    const sanitized = this.sanitizeFilename(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    
    const extension = sanitized.includes('.') 
      ? sanitized.substring(sanitized.lastIndexOf('.'))
      : '';
    
    const nameWithoutExtension = sanitized.includes('.')
      ? sanitized.substring(0, sanitized.lastIndexOf('.'))
      : sanitized;
    
    return `${nameWithoutExtension}_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Validate file size against configured limits
   * @param size - File size in bytes
   * @param fileType - Type of file being uploaded
   * @returns Validation result
   */
  validateFileSize(size: number, fileType: string): { isValid: boolean; error?: string } {
    // Check against global maximum
    if (size > config.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Additional checks based on file type could be added here
    // For example, QR codes might have different size limits than gallery images

    return { isValid: true };
  }

  /**
   * Check if a file hash is in a blacklist (for known malicious files)
   * @param hash - SHA-256 hash of the file
   * @returns True if file is blacklisted
   */
  async isBlacklisted(hash: string): Promise<boolean> {
    // In a real implementation, this would check against a database of known malicious file hashes
    // For now, we'll just return false
    // This could be integrated with services like VirusTotal in the future
    
    // Example implementation would be:
    // const blacklistedHashes = await this.getBlacklistedHashes();
    // return blacklistedHashes.includes(hash);
    
    return false;
  }

  /**
   * Log security events for monitoring
   * @param event - Security event description
   * @param details - Additional details about the event
   * @param userId - User ID if available
   */
  logSecurityEvent(event: string, details: any, userId?: string): void {
    const logData = {
      event,
      details,
      userId,
      timestamp: new Date().toISOString(),
    };

    logger.warn('Security event:', logData);
    
    // In a production environment, you might want to:
    // 1. Send alerts to security team
    // 2. Store in a dedicated security log
    // 3. Integrate with SIEM systems
  }
}

export default new FileSecurityService();