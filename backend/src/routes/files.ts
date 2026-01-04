import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createSecureRoute } from '../middleware/securityMiddleware';
import upload, { uploadSingle, uploadMultiple } from '../middleware/upload';
import { FileType } from '../services/fileStorageService';
import {
  uploadGalleryImage,
  uploadMultipleGalleryImages,
  uploadQrCode,
  uploadBackgroundImage,
  deleteFile,
  getSignedUrl
} from '../controllers/fileController';

const router = Router();

// Validation schemas
const uploadGalleryImageSchema = {
  invitation_id: {
    type: 'string',
    required: true
  }
};

const uploadQrCodeSchema = {
  invitation_id: {
    type: 'string',
    required: true
  }
};

const uploadBackgroundImageSchema = {
  invitation_id: {
    type: 'string',
    required: true
  }
};

const fileKeyParamSchema = {
  key: {
    type: 'string',
    required: true
  }
};

const signedUrlQuerySchema = {
  expiresIn: {
    type: 'string',
    required: false,
    custom: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0 || num > 86400) { // Max 24 hours
        return 'Expiration time must be a positive number up to 86400 seconds (24 hours)';
      }
      return true;
    }
  }
};

/**
 * @route POST /api/files/gallery
 * @access Private
 * @description Upload a single gallery image
 */
router.post(
  '/gallery',
  authenticate,
  uploadSingle(FileType.GALLERY_IMAGE),
  createSecureRoute('fileUpload', { body: uploadGalleryImageSchema }),
  uploadGalleryImage
);

/**
 * @route POST /api/files/gallery/multiple
 * @access Private
 * @description Upload multiple gallery images
 */
router.post(
  '/gallery/multiple',
  authenticate,
  uploadMultiple(FileType.GALLERY_IMAGE, 10), // Max 10 images
  createSecureRoute('fileUpload', { body: uploadGalleryImageSchema }),
  uploadMultipleGalleryImages
);

/**
 * @route POST /api/files/qr-code
 * @access Private
 * @description Upload QR code for money gifts
 */
router.post(
  '/qr-code',
  authenticate,
  uploadSingle(FileType.QR_CODE),
  createSecureRoute('fileUpload', { body: uploadQrCodeSchema }),
  uploadQrCode
);

/**
 * @route POST /api/files/background
 * @access Private
 * @description Upload background image for invitation
 */
router.post(
  '/background',
  authenticate,
  uploadSingle(FileType.BACKGROUND),
  createSecureRoute('fileUpload', { body: uploadBackgroundImageSchema }),
  uploadBackgroundImage
);

/**
 * @route DELETE /api/files/:key
 * @access Private
 * @description Delete a file from storage
 */
router.delete(
  '/:key',
  authenticate,
  createSecureRoute('profile', { params: fileKeyParamSchema }),
  deleteFile
);

/**
 * @route GET /api/files/signed-url/:key
 * @access Private
 * @description Get a signed URL for secure file access
 */
router.get(
  '/signed-url/:key',
  authenticate,
  createSecureRoute('profile', { params: fileKeyParamSchema, query: signedUrlQuerySchema }),
  getSignedUrl
);

export default router;