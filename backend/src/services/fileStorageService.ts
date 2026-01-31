import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { fromBuffer } from 'file-type';
import crypto from 'crypto';
import config from '../config';
import logger from '../utils/logger';
import fileSecurityService from './fileSecurityService';

// File types
export enum FileType {
  GALLERY_IMAGE = 'gallery-image',
  QR_CODE = 'qr-code',
  BACKGROUND = 'background'
}

// Upload result interface
export interface UploadResult {
  url: string;
  key: string;
  contentType: string;
  size: number;
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
}

// File validation result
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: string;
  size?: number;
}

/**
 * File Storage Service
 * Handles all file operations with AWS S3 including upload, deletion, and URL generation
 */
class FileStorageService {
  private s3Client: S3Client;

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: config.awsRegion,
      endpoint: config.s3Endpoint, // Support for R2/S3 compatible services
      forcePathStyle: !!config.s3Endpoint, // Only use path style for custom endpoints (MinIO/LocalStack), AWS uses virtual hosted
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
    });

    logger.info('S3 Service Initialized', {
      region: config.awsRegion,
      bucket: config.s3BucketName,
      endpoint: config.s3Endpoint || 'standard-aws',
      forcePathStyle: !!config.s3Endpoint
    });
  }

  /**
   * Validate file before upload
   * @param buffer - File buffer
   * @param fileType - Type of file being uploaded
   * @returns Validation result
   */
  private async validateFile(buffer: Buffer, fileType: FileType, filename?: string): Promise<ValidationResult> {
    try {
      // Check file size
      if (buffer.length > config.maxFileSize) {
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`,
        };
      }

      // Determine file type from buffer
      const fileTypeResult = await fromBuffer(buffer);
      if (!fileTypeResult) {
        return {
          isValid: false,
          error: 'Unable to determine file type',
        };
      }

      const { mime } = fileTypeResult;

      // Check if file type is allowed based on the file category
      let allowedTypes: string[];
      switch (fileType) {
        case FileType.GALLERY_IMAGE:
        case FileType.BACKGROUND:
          allowedTypes = config.allowedImageTypes;
          break;
        case FileType.QR_CODE:
          allowedTypes = config.allowedQrCodeTypes;
          break;
        default:
          return {
            isValid: false,
            error: 'Invalid file type category',
          };
      }

      if (!allowedTypes.includes(mime)) {
        return {
          isValid: false,
          error: `File type ${mime} is not allowed for ${fileType}`,
        };
      }

      return {
        isValid: true,
        fileType: mime,
        size: buffer.length,
      };
    } catch (error) {
      logger.error('Error validating file:', error);
      return {
        isValid: false,
        error: 'Error validating file',
      };
    }
  }

  /**
   * Generate thumbnails for an image
   * @param buffer - Original image buffer
   * @returns Object with thumbnail buffers
   */
  private async generateThumbnails(buffer: Buffer): Promise<{ [key: string]: Buffer }> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Don't generate thumbnails for SVG files
      if (metadata.format === 'svg') {
        return {};
      }

      const thumbnails: { [key: string]: Buffer } = {};

      // Generate different sized thumbnails
      for (const size of config.thumbnailSizes) {
        const { width, height } = size;
        const sizeName = width === 150 ? 'small' : width === 300 ? 'medium' : 'large';

        thumbnails[sizeName] = await image
          .resize(width, height, {
            fit: 'cover',
            position: 'center',
          })
          .rotate() // Auto-rotate based on EXIF
          .webp({ quality: 70, effort: 6 }) // Aggressive optimization for thumbnails
          .toBuffer();
      }

      return thumbnails;
    } catch (error) {
      logger.error('Error generating thumbnails:', error);
      throw new Error('Failed to generate thumbnails');
    }
  }

  /**
   * Generate a unique key for S3 storage
   * @param fileType - Type of file
   * @param userId - User ID
   * @param extension - File extension
   * @returns Unique S3 key
   */
  private generateS3Key(fileType: FileType, userId: string, extension: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${fileType}/${userId}/${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Upload a file to S3
   * @param buffer - File buffer
   * @param key - S3 key
   * @param contentType - MIME type
   * @returns Upload result
   */
  private async uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<{ url: string; key: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: config.s3BucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // ACL: 'private' removed to support 'Bucket owner enforced' policy
      });

      await this.s3Client.send(command);

      // Generate the URL for the uploaded file
      // Use custom public domain if configured (e.g., Cloudflare R2), otherwise fallback to standard S3 URL
      const url = config.s3PublicDomain
        ? `${config.s3PublicDomain}/${key}`
        : `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error: any) {
      logger.error('Error uploading to S3:', {
        error: error.message,
        code: error.code,
        bucket: config.s3BucketName,
        region: config.awsRegion,
        endpoint: config.s3Endpoint || 'aws-standard',
        key: key,
        name: error.name,
        '$metadata': error.$metadata
      });
      
      // Provide helpful error message for common S3 errors
      if (error.message?.includes('endpoint')) {
        throw new Error(
          `S3 bucket region mismatch. The bucket "${config.s3BucketName}" is not in ${config.awsRegion}. ` +
          `AWS returned: "${error.message}". ` +
          `Please check your bucket's actual region in AWS Console and update AWS_REGION environment variable.`
        );
      }
      
      // Expose the specific error from AWS (e.g. AccessDenied, InvalidRegion)
      throw new Error(`Failed to upload file to S3: ${error.message || error.code || 'Unknown error'}`);
    }
  }

  /**
   * Upload a file with validation and thumbnail generation
   * @param buffer - File buffer
   * @param fileType - Type of file
   * @param userId - User ID
   * @returns Upload result
   */
  async uploadFile(buffer: Buffer, fileType: FileType, userId: string, filename?: string): Promise<UploadResult> {
    try {
      // Validate the file
      const validation = await this.validateFile(buffer, fileType);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Extract file extension from MIME type
      const mimeToExtension: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
      };

      const extension = mimeToExtension[validation.fileType!] || 'bin';

      // Convert original image to WebP if it's an image (except SVG)
      let finalBuffer = buffer;
      let finalMimeType = validation.fileType!;
      let finalExtension = extension;

      if ((fileType === FileType.GALLERY_IMAGE || fileType === FileType.BACKGROUND) && extension !== 'svg') {
        // Aggressive optimization for main images:
        // 1. Resize to max 1200px (width or height)
        // 2. Auto-rotate based on EXIF
        // 3. Convert to WebP with 75% quality
        // 4. Strip metadata (automatic by sharp)
        finalBuffer = await sharp(buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .rotate()
          .webp({ quality: 75, effort: 6 })
          .toBuffer();
        finalMimeType = 'image/webp';
        finalExtension = 'webp';
      }

      // Generate S3 key
      const key = this.generateS3Key(fileType, userId, finalExtension);

      // Upload the file
      const uploadResult = await this.uploadToS3(finalBuffer, key, finalMimeType);

      // Generate thumbnails for images (except SVG)
      let thumbnails: UploadResult['thumbnails'];
      if ((fileType === FileType.GALLERY_IMAGE || fileType === FileType.BACKGROUND) && finalExtension === 'webp') {
        const thumbnailBuffers = await this.generateThumbnails(buffer);
        thumbnails = {
          small: '',
          medium: '',
          large: ''
        };

        for (const [sizeName, thumbBuffer] of Object.entries(thumbnailBuffers)) {
          const thumbnailKey = this.generateS3Key(`${fileType}-thumb-${sizeName}` as FileType, userId, 'webp');
          const thumbnailUpload = await this.uploadToS3(thumbBuffer, thumbnailKey, 'image/webp');
          if (sizeName === 'small') {
            thumbnails.small = thumbnailUpload.url;
          } else if (sizeName === 'medium') {
            thumbnails.medium = thumbnailUpload.url;
          } else if (sizeName === 'large') {
            thumbnails.large = thumbnailUpload.url;
          }
        }
      }

      logger.info(`File uploaded successfully: ${key} for user: ${userId}`);

      return {
        url: uploadResult.url,
        key: uploadResult.key,
        contentType: validation.fileType!,
        size: validation.size!,
        thumbnails,
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param key - S3 key of the file to delete
   * @returns Success status
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.s3BucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      logger.info(`File deleted successfully: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Generate a signed URL for secure file access
   * @param key - S3 key
   * @param expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns Signed URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: config.s3BucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Upload multiple files
   * @param files - Array of file buffers
   * @param fileType - Type of files
   * @param userId - User ID
   * @returns Array of upload results
   */
  async uploadMultipleFiles(files: Buffer[], fileType: FileType, userId: string, filenames?: string[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const filename = filenames ? filenames[i] : undefined;
        const result = await this.uploadFile(files[i], fileType, userId, filename);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`File ${i + 1}: ${errorMessage}`);
        logger.error(`Error uploading file ${i + 1}:`, error);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`All uploads failed: ${errors.join(', ')}`);
    }

    if (errors.length > 0) {
      logger.warn(`Some uploads failed: ${errors.join(', ')}`);
    }

    return results;
  }

  /**
   * Delete multiple files
   * @param keys - Array of S3 keys to delete
   * @returns Object with success and failure counts
   */
  async deleteMultipleFiles(keys: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const key of keys) {
      const result = await this.deleteFile(key);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}

export default new FileStorageService();