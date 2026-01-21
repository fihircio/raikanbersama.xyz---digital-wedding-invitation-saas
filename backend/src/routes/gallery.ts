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

const invitationIdParamSchema = {
  invitationId: {
    type: 'string',
    required: true
  }
};

const idParamSchema = {
  id: {
    type: 'string',
    required: true
  }
};

const updateGalleryImagesSchema = {
  itemIds: {
    type: 'array',
    required: true,
    custom: (value: string[]) => {
      if (!Array.isArray(value)) return 'itemIds must be an array';
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
 * @route DELETE /api/gallery/:id
 * @access Private
 */
router.delete('/:id', createSecureRoute('profile', { params: idParamSchema }), removeGalleryImage);

/**
 * @route PUT /api/gallery/reorder/:invitationId
 * @access Private
 */
router.put('/reorder/:invitationId', createSecureRoute('profile', { params: invitationIdParamSchema, body: updateGalleryImagesSchema }), updateGalleryImages);

export default router;