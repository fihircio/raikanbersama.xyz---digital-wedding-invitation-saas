import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import { 
  getContactPersonsByInvitationId, 
  getContactPersonById, 
  createContactPerson, 
  updateContactPerson, 
  deleteContactPerson 
} from '../controllers/contactPersonController';

const router = Router();

// Validation schemas
const createContactPersonSchema = {
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
  relation: {
    type: 'string',
    required: true,
    min: 2,
    max: 50
  },
  phone: {
    type: 'string',
    required: true,
    pattern: /^(\+?6?01)[0-46-9]*$/,
    custom: (value: string) => {
      if (!value) return true;
      return value.length >= 10 && value.length <= 15 || 'Phone number must be between 10 and 15 digits';
    }
  }
};

const updateContactPersonSchema = {
  name: {
    type: 'string',
    min: 2,
    max: 100
  },
  relation: {
    type: 'string',
    min: 2,
    max: 50
  },
  phone: {
    type: 'string',
    pattern: /^(\+?6?01)[0-46-9]*$/,
    custom: (value: string) => {
      if (!value) return true;
      return value.length >= 10 && value.length <= 15 || 'Phone number must be between 10 and 15 digits';
    }
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
 * @route GET /api/contact-persons/invitation/:invitationId
 * @access Private
 */
router.get('/invitation/:invitationId', createSecureRoute('profile', { params: invitationIdParamSchema }), getContactPersonsByInvitationId);

/**
 * @route GET /api/contact-persons/:id
 * @access Private
 */
router.get('/:id', createSecureRoute('profile', { params: idParamSchema }), getContactPersonById);

/**
 * @route POST /api/contact-persons
 * @access Private
 */
router.post('/', createSecureRoute('profile', { body: createContactPersonSchema }), createContactPerson);

/**
 * @route PUT /api/contact-persons/:id
 * @access Private
 */
router.put('/:id', createSecureRoute('profile', { params: idParamSchema, body: updateContactPersonSchema }), updateContactPerson);

/**
 * @route DELETE /api/contact-persons/:id
 * @access Private
 */
router.delete('/:id', createSecureRoute('profile', { params: idParamSchema }), deleteContactPerson);

export default router;