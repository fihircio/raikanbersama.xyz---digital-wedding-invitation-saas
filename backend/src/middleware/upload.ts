import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api';
import fileStorageService, { FileType } from '../services/fileStorageService';
import logger from '../utils/logger';
import config from '../config';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize, // 5MB default
    files: 10, // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // We'll do more detailed validation in the service
    // Just do a basic check here
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Middleware to handle single file upload
 * @param fileType - Type of file being uploaded
 * @returns Middleware function
 */
export const uploadSingle = (fileType: FileType) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const singleUpload = upload.single('file');
    
    singleUpload(req, res, async (err) => {
      if (err) {
        logger.error('File upload error:', err);
        
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              res.status(400).json({
                success: false,
                error: `File size exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`,
              });
              return;
            case 'LIMIT_FILE_COUNT':
              res.status(400).json({
                success: false,
                error: 'Too many files uploaded',
              });
              return;
            case 'LIMIT_UNEXPECTED_FILE':
              res.status(400).json({
                success: false,
                error: 'Unexpected field name for file upload',
              });
              return;
            default:
              res.status(400).json({
                success: false,
                error: 'File upload error',
              });
              return;
          }
        }
        
        res.status(400).json({
          success: false,
          error: err.message || 'File upload failed',
        });
        return;
      }
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }
      
      try {
        const userId = req.user?.id;
        if (!userId) {
          res.status(401).json({
            success: false,
            error: 'User not authenticated',
          });
          return;
        }
        
        // Upload the file to S3
        const uploadResult = await fileStorageService.uploadFile(
          req.file.buffer,
          fileType,
          userId,
          req.file.originalname
        );
        
        // Attach the upload result to the request object
        req.uploadResult = uploadResult;
        
        next();
      } catch (error) {
        logger.error('Error processing uploaded file:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process uploaded file',
        });
      }
    });
  };
};

/**
 * Middleware to handle multiple file uploads
 * @param fileType - Type of files being uploaded
 * @param maxCount - Maximum number of files (default: 5)
 * @returns Middleware function
 */
export const uploadMultiple = (fileType: FileType, maxCount: number = 5) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const multipleUpload = upload.array('files', maxCount);
    
    multipleUpload(req, res, async (err) => {
      if (err) {
        logger.error('Multiple file upload error:', err);
        
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              res.status(400).json({
                success: false,
                error: `One or more files exceed maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`,
              });
              return;
            case 'LIMIT_FILE_COUNT':
              res.status(400).json({
                success: false,
                error: `Too many files uploaded. Maximum allowed is ${maxCount}`,
              });
              return;
            case 'LIMIT_UNEXPECTED_FILE':
              res.status(400).json({
                success: false,
                error: 'Unexpected field name for file upload',
              });
              return;
            default:
              res.status(400).json({
                success: false,
                error: 'File upload error',
              });
              return;
          }
        }
        
        res.status(400).json({
          success: false,
          error: err.message || 'File upload failed',
        });
        return;
      }
      
      if (!req.files || req.files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
        return;
      }
      
      try {
        const userId = req.user?.id;
        if (!userId) {
          res.status(401).json({
            success: false,
            error: 'User not authenticated',
          });
          return;
        }
        
        // Extract buffers from uploaded files
        const fileBuffers = (req.files as Express.Multer.File[]).map(file => file.buffer);
        
        // Upload the files to S3
        const uploadResults = await fileStorageService.uploadMultipleFiles(
          fileBuffers,
          fileType,
          userId
        );
        
        // Attach the upload results to the request object
        req.uploadResults = uploadResults;
        
        next();
      } catch (error) {
        logger.error('Error processing uploaded files:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process uploaded files',
        });
      }
    });
  };
};

// Extend the Express Request type to include upload results
declare module 'express' {
  interface Request {
    uploadResult?: {
      url: string;
      key: string;
      contentType: string;
      size: number;
      thumbnails?: {
        small: string;
        medium: string;
        large: string;
      };
    };
    uploadResults?: {
      url: string;
      key: string;
      contentType: string;
      size: number;
      thumbnails?: {
        small: string;
        medium: string;
        large: string;
      };
    }[];
  }
}

export default {
  uploadSingle,
  uploadMultiple,
};