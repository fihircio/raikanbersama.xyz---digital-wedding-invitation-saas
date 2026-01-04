import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import { 
  getItineraryItemsByInvitationId, 
  getItineraryItemById, 
  createItineraryItem, 
  updateItineraryItem, 
  deleteItineraryItem 
} from '../controllers/itineraryController';

const router = Router();

// Validation schemas
const createItineraryItemSchema = {
  invitation_id: {
    type: 'string',
    required: true
  },
  time: {
    type: 'string',
    required: true,
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  activity: {
    type: 'string',
    required: true,
    min: 5,
    max: 200
  }
};

const updateItineraryItemSchema = {
  time: {
    type: 'string',
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  activity: {
    type: 'string',
    min: 5,
    max: 200
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

/**
 * @route GET /api/itinerary/invitation/:invitationId
 * @access Private
 */
router.get('/invitation/:invitationId', createSecureRoute('profile', { params: invitationIdParamSchema }), getItineraryItemsByInvitationId);

/**
 * @route GET /api/itinerary/:id
 * @access Private
 */
router.get('/:id', createSecureRoute('profile', { params: idParamSchema }), getItineraryItemById);

/**
 * @route POST /api/itinerary
 * @access Private
 */
router.post('/', createSecureRoute('profile', { body: createItineraryItemSchema }), createItineraryItem);

/**
 * @route PUT /api/itinerary/:id
 * @access Private
 */
router.put('/:id', createSecureRoute('profile', { params: idParamSchema, body: updateItineraryItemSchema }), updateItineraryItem);

/**
 * @route DELETE /api/itinerary/:id
 * @access Private
 */
router.delete('/:id', createSecureRoute('profile', { params: idParamSchema }), deleteItineraryItem);

export default router;