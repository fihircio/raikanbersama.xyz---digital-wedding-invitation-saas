import { Request, Response, NextFunction } from 'express';
import fileSecurityService from '../services/fileSecurityService';
import logger from '../utils/logger';
import config from '../config';

/**
 * Enhanced File Security Validation Middleware
 * Provides comprehensive file upload validation and scanning
 */

/**
 * Validate file upload with security checks
 * @param options - Validation options
 */
export const validateFileUpload = (options: {
  allowedTypes?: string[];
  maxSize?: number;
  scanForMalware?: boolean;
  requireAuth?: boolean;
} = {}) => {
  const {
    allowedTypes = config.allowedImageTypes,
    maxSize = config.maxFileSize,
    scanForMalware = true,
    requireAuth = true
  } = options;
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check authentication if required
      if (requireAuth && !(req as any).user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required for file upload'
        });
        return;
      }
      
      // Check if file exists
      if (!req.file && !req.files) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }
      
      const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : 
                   req.file ? [req.file] : [];
      
      for (const file of files) {
        const fileBuffer = file.buffer;
        const originalName = file.originalname;
        
        // Basic file validation
        const validationResult = fileSecurityService.validateFileSize(fileBuffer.length, 'image');
        if (!validationResult.isValid) {
          logger.warn('File upload validation failed', {
            error: validationResult.error,
            fileName: originalName,
            fileSize: fileBuffer.length,
            ip: req.ip,
            userId: (req as any).user?.id
          });
          
          res.status(400).json({
            success: false,
            error: validationResult.error
          });
          return;
        }
        
        // Check file type
        const detectedType = await getFileType(fileBuffer);
        if (!allowedTypes.includes(detectedType)) {
          logger.warn('File type not allowed', {
            detectedType,
            allowedTypes,
            fileName: originalName,
            ip: req.ip,
            userId: (req as any).user?.id
          });
          
          res.status(400).json({
            success: false,
            error: `File type ${detectedType} is not allowed`
          });
          return;
        }
        
        // Security scan
        if (scanForMalware) {
          const scanResult = await fileSecurityService.scanFile(fileBuffer, originalName);
          
          if (!scanResult.isSafe) {
            logger.warn('Security scan detected threats', {
              threats: scanResult.threats,
              confidence: scanResult.confidence,
              fileName: originalName,
              ip: req.ip,
              userId: (req as any).user?.id
            });
            
            res.status(400).json({
              success: false,
              error: 'File upload failed security scan',
              details: scanResult.threats
            });
            return;
          }
          
          // Check against blacklist
          const fileHash = fileSecurityService.generateFileHash(fileBuffer);
          const isBlacklisted = await fileSecurityService.isBlacklisted(fileHash);
          
          if (isBlacklisted) {
            logger.warn('Blacklisted file detected', {
              fileHash,
              fileName: originalName,
              ip: req.ip,
              userId: (req as any).user?.id
            });
            
            res.status(400).json({
              success: false,
              error: 'File is not allowed'
            });
            return;
          }
        }
        
        // Validate filename
        const sanitizedFilename = fileSecurityService.sanitizeFilename(originalName);
        if (sanitizedFilename !== originalName) {
          logger.info('Filename sanitized', {
            original: originalName,
            sanitized: sanitizedFilename,
            ip: req.ip,
            userId: (req as any).user?.id
          });
        }
        
        // Attach security metadata to file object
        file.securityMetadata = {
          originalName,
          sanitizedFilename,
          detectedType,
          size: fileBuffer.length,
          hash: fileSecurityService.generateFileHash(fileBuffer),
          scanResult: scanForMalware ? await fileSecurityService.scanFile(fileBuffer, originalName) : null,
          uploadedAt: new Date(),
          uploadedBy: (req as any).user?.id,
          ip: req.ip
        };
      }
      
      next();
    } catch (error) {
      logger.error('File validation error:', error);
      res.status(500).json({
        success: false,
        error: 'File validation failed'
      });
    }
  };
};

/**
 * Get file type from buffer
 * @param buffer - File buffer
 * @returns File MIME type
 */
async function getFileType(buffer: Buffer): Promise<string> {
  try {
    // Use file-type library to detect file type
    const fileTypeModule = await import('file-type');
    const type = await fileTypeModule.default.fromBuffer(buffer);
    return type?.mime || 'application/octet-stream';
  } catch (error) {
    logger.error('Error detecting file type:', error);
    return 'application/octet-stream';
  }
}

/**
 * Validate image file specifically
 * @param options - Image validation options
 */
export const validateImageUpload = (options: {
  maxWidth?: number;
  maxHeight?: number;
  allowAnimated?: boolean;
} = {}) => {
  const {
    maxWidth = 4096,
    maxHeight = 4096,
    allowAnimated = false
  } = options;
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : 
                   req.file ? [req.file] : [];
      
      for (const file of files) {
        const fileBuffer = file.buffer;
        
        // Check if it's actually an image
        const detectedType = await getFileType(fileBuffer);
        if (!detectedType.startsWith('image/')) {
          res.status(400).json({
            success: false,
            error: 'Only image files are allowed'
          });
          return;
        }
        
        // Image-specific validations
        const imageValidation = await validateImageProperties(fileBuffer, {
          maxWidth,
          maxHeight,
          allowAnimated
        });
        
        if (!imageValidation.isValid) {
          logger.warn('Image validation failed', {
            error: imageValidation.error,
            fileName: file.originalname,
            ip: req.ip,
            userId: (req as any).user?.id
          });
          
          res.status(400).json({
            success: false,
            error: imageValidation.error
          });
          return;
        }
        
        // Attach image metadata
        file.imageMetadata = imageValidation.metadata;
      }
      
      next();
    } catch (error) {
      logger.error('Image validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Image validation failed'
      });
    }
  };
};

/**
 * Validate image properties
 * @param buffer - Image buffer
 * @param options - Validation options
 * @returns Validation result
 */
async function validateImageProperties(buffer: Buffer, options: {
  maxWidth: number;
  maxHeight: number;
  allowAnimated: boolean;
}): Promise<{ isValid: boolean; error?: string; metadata?: any }> {
  try {
    const sharp = await import('sharp');
    const sharpInstance = sharp.default(buffer);
    const metadata = await sharpInstance.metadata();
    const { width, height, format } = metadata;
    
    // Check dimensions
    if (width > options.maxWidth || height > options.maxHeight) {
      return {
        isValid: false,
        error: `Image dimensions exceed maximum allowed size of ${options.maxWidth}x${options.maxHeight}`
      };
    }
    
    // Check for animated GIFs if not allowed
    if (!options.allowAnimated && format === 'gif') {
      const sharpInstance = sharp.default(buffer);
      const pages = await sharpInstance.metadata();
      if ((pages as any).pages > 1) {
        return {
          isValid: false,
          error: 'Animated images are not allowed'
        };
      }
    }
    
    // Check for valid image formats
    const validFormats = ['jpeg', 'jpg', 'png', 'webp'];
    if (!validFormats.includes(format as string)) {
      return {
        isValid: false,
        error: `Image format ${format} is not supported`
      };
    }
    
    return {
      isValid: true,
      metadata: {
        width,
        height,
        format,
        size: buffer.length
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate image properties'
    };
  }
}

/**
 * Rate limiting for file uploads
 */
export const fileUploadRateLimit = (maxUploads: number = 10, windowMs: number = 60 * 60 * 1000) => {
  const uploadTracker = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = `${req.ip}:${(req as any).user?.id || 'anonymous'}`;
    const now = Date.now();
    
    // Get or create client data
    let clientData = uploadTracker.get(clientId);
    
    if (!clientData || clientData.resetTime < now) {
      clientData = {
        count: 0,
        resetTime: now + windowMs
      };
      uploadTracker.set(clientId, clientData);
    }
    
    // Count files in this request
    const fileCount = req.files ? (Array.isArray(req.files) ? req.files.length : 1) : 
                     req.file ? 1 : 0;
    
    clientData.count += fileCount;
    
    // Check if limit exceeded
    if (clientData.count > maxUploads) {
      logger.warn('File upload rate limit exceeded', {
        clientId,
        count: clientData.count,
        maxUploads,
        ip: req.ip,
        userId: (req as any).user?.id
      });
      
      res.status(429).json({
        success: false,
        error: 'Too many file uploads. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
      return;
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxUploads,
      'X-RateLimit-Remaining': Math.max(0, maxUploads - clientData.count),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });
    
    next();
  };
};

// Extend Express Request type to include security metadata
declare module 'express' {
  interface Request {
    file?: any & {
      securityMetadata?: {
        originalName: string;
        sanitizedFilename: string;
        detectedType: string;
        size: number;
        hash: string;
        scanResult?: any;
        uploadedAt: Date;
        uploadedBy?: string;
        ip?: string;
      };
      imageMetadata?: {
        width: number;
        height: number;
        format: string;
        size: number;
      };
    };
    
    files?: any & {
      securityMetadata?: {
        originalName: string;
        sanitizedFilename: string;
        detectedType: string;
        size: number;
        hash: string;
        scanResult?: any;
        uploadedAt: Date;
        uploadedBy?: string;
        ip?: string;
      };
      imageMetadata?: {
        width: number;
        height: number;
        format: string;
        size: number;
      };
    }[];
  }
}