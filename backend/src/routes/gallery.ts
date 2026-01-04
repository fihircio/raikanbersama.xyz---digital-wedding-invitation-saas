import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import { 
  getGalleryImagesByInvitationId, 
  addGalleryImage, 
  removeGalleryImage, 
  updateGalleryImages 
} from '../controllers/galleryController';

const router = Router();

// Validation schemas
const addGalleryImageSchema = {
  invitation_id: {
    type: 'string',
    required: true
  },
  url: {
    type: 'string',
    required: true,
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return 'Invalid image URL format';
      }
    }
  }
};

const updateGalleryImagesSchema = {
  gallery: {
    type: 'array',
    required: true,
    custom: (value: string[]) => {
      if (!Array.isArray(value)) return 'Gallery must be an array';
      if (value.length === 0) return 'Gallery cannot be empty';
      if (value.length > 20) return 'Gallery cannot have more than 20 images';
      
      // Validate each URL
      for (const url of value) {
        try {
          new URL(url);
        } catch {
          return `Invalid image URL format: ${url}`;
        }
      }
      return true;
    }
  }
};

const invitationIdParamSchema = {
  invitationId: {
    type: 'string',
    required: true
  }
};

const imageIndexParamSchema = {
  imageIndex: {
    type: 'string',
    required: true,
    custom: (value: string) => {
      const index = parseInt(value, 10);
      if (isNaN(index) || index < 0) {
        return 'Image index must be a non-negative integer';
      }
      return true;
    }
  }
};

/**
 * @route GET /api/gallery/invitation/:invitationId
 * @access Private
 */
router.get('/invitation/:invitationId', createSecureRoute('profile', { params: invitationIdParamSchema }), getGalleryImagesByInvitationId);

/**
 * @route POST /api/gallery
 * @access Private
 */
router.post('/', createSecureRoute('profile', { body: addGalleryImageSchema }), addGalleryImage);

/**
 * @route DELETE /api/gallery/:invitationId/:imageIndex
 * @access Private
 */
router.delete('/:invitationId/:imageIndex', createSecureRoute('profile', { params: invitationIdParamSchema }), removeGalleryImage);

/**
 * @route PUT /api/gallery/:invitationId
 * @access Private
 */
router.put('/:invitationId', createSecureRoute('profile', { params: invitationIdParamSchema, body: updateGalleryImagesSchema }), updateGalleryImages);

export default router;