import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import {
  getAllRSVPs,
  getRSVPById,
  getRSVPsByInvitationId,
  createRSVP,
  updateRSVP,
  deleteRSVP
} from '../controllers/rsvpController';

const router = Router();

// Validation schemas
const createRSVPSchema = {
  invitation_id: {
    type: 'string',
    required: true
  },
  guest_name: {
    type: 'string',
    required: true,
    min: 2,
    max: 100
  },
  pax: {
    type: 'number',
    required: true,
    min: 0,
    max: 20
  },
  is_attending: {
    type: 'boolean',
    required: true
  },
  phone_number: {
    type: 'string',
    required: true,
    pattern: /^(\+?6?01)[0-46-9]*$/,
    custom: (value: string) => {
      if (!value) return true;
      return value.length >= 10 && value.length <= 15 || 'Phone number must be between 10 and 15 digits';
    }
  },
  message: {
    type: 'string',
    max: 500
  }
};

const updateRSVPSchema = {
  guest_name: {
    type: 'string',
    min: 2,
    max: 100
  },
  pax: {
    type: 'number',
    min: 0,
    max: 20
  },
  is_attending: {
    type: 'boolean'
  },
  phone_number: {
    type: 'string',
    pattern: /^(\+?6?01)[0-46-9]*$/,
    custom: (value: string) => {
      if (!value) return true;
      return value.length >= 10 && value.length <= 15 || 'Phone number must be between 10 and 15 digits';
    }
  },
  message: {
    type: 'string',
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
  search: {
    type: 'string'
  },
  sortBy: {
    type: 'string',
    enum: ['created_at', 'guest_name', 'phone_number', 'is_attending', 'pax']
  },
  sortOrder: {
    type: 'string',
    enum: ['asc', 'desc']
  },
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
  },
  is_attending: {
    type: 'boolean'
  }
};

/**
 * @route GET /api/rsvps
 * @access Private
 */
router.get('/', createSecureRoute('profile', { query: querySchema }), getAllRSVPs);

/**
 * @route GET /api/rsvps/:id
 * @access Private
 */
router.get('/:id', createSecureRoute('profile', { params: idParamSchema }), getRSVPById);

/**
 * @route GET /api/rsvps/invitation/:invitationId
 * @access Private
 */
router.get('/invitation/:invitationId', createSecureRoute('profile', { params: invitationIdParamSchema }), getRSVPsByInvitationId);

/**
 * @route POST /api/rsvps
 * @access Public
 */
router.post('/', createSecureRoute('rsvp', { body: createRSVPSchema }), createRSVP);

/**
 * @route PUT /api/rsvps/:id
 * @access Private
 */
router.put('/:id', createSecureRoute('profile', { params: idParamSchema, body: updateRSVPSchema }), updateRSVP);

/**
 * @route DELETE /api/rsvps/:id
 * @access Private
 */
router.delete('/:id', createSecureRoute('profile', { params: idParamSchema }), deleteRSVP);

export default router;