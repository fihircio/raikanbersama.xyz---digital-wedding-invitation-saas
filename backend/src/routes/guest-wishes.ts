import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import { 
  getAllGuestWishes, 
  getGuestWishById, 
  getGuestWishesByInvitationId, 
  createGuestWish, 
  deleteGuestWish 
} from '../controllers/guestWishController';

const router = Router();

// Validation schemas
const createGuestWishSchema = {
  invitation_id: {
    type: 'string',
    required: true
  },
  name: {
    type: 'string',
    required: true,
    min: 2,
    max: 100
  },
  message: {
    type: 'string',
    required: true,
    min: 5,
    max: 500
  }
};

const idParamSchema = {
  id: {
    type: 'string',
    required: true
  }
};

const invitationIdParamSchema = {
  invitationId: {
    type: 'string',
    required: true
  }
};

const querySchema = {
  page: {
    type: 'number',
    min: 1
  },
  limit: {
    type: 'number',
    min: 1,
    max: 100
  },
  invitation_id: {
    type: 'string'
  }
};

/**
 * @route GET /api/guest-wishes
 * @access Private
 */
router.get('/', createSecureRoute('profile', { query: querySchema }), getAllGuestWishes);

/**
 * @route GET /api/guest-wishes/:id
 * @access Private
 */
router.get('/:id', createSecureRoute('profile', { params: idParamSchema }), getGuestWishById);

/**
 * @route GET /api/guest-wishes/invitation/:invitationId
 * @access Public
 */
router.get('/invitation/:invitationId', createSecureRoute('auth', { params: invitationIdParamSchema }), getGuestWishesByInvitationId);

/**
 * @route POST /api/guest-wishes
 * @access Public
 */
router.post('/', createSecureRoute('guestWish', { body: createGuestWishSchema }), createGuestWish);

/**
 * @route DELETE /api/guest-wishes/:id
 * @access Private
 */
router.delete('/:id', createSecureRoute('profile', { params: idParamSchema }), deleteGuestWish);

export default router;