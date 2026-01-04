import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import {
  getAllInvitations,
  getInvitationById,
  getInvitationBySlug,
  createInvitation,
  updateInvitation,
  deleteInvitation
} from '../controllers/invitationController';

const router = Router();

// Validation schemas
const createInvitationSchema = {
  slug: {
    type: 'string',
    required: true,
    min: 3,
    max: 50,
    pattern: /^[a-z0-9-]+$/,
    custom: (value: string) => {
      if (!value) return true;
      // Check for reserved words
      const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp'];
      if (reservedWords.includes(value.toLowerCase())) {
        return 'Slug cannot be a reserved word';
      }
      return true;
    }
  },
  template_id: {
    type: 'string',
    required: true
  },
  event_type: {
    type: 'string',
    required: true,
    enum: ['Walimatulurus', 'Majlis Tunang', 'Majlis Persandingan', 'Others']
  },
  bride_name: {
    type: 'string',
    required: true,
    min: 2,
    max: 100
  },
  groom_name: {
    type: 'string',
    required: true,
    min: 2,
    max: 100
  },
  host_names: {
    type: 'string',
    required: true,
    min: 5,
    max: 200
  },
  event_date: {
    type: 'string',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },
  start_time: {
    type: 'string',
    required: true,
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  end_time: {
    type: 'string',
    required: true,
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  location_name: {
    type: 'string',
    required: true,
    min: 5,
    max: 200
  },
  address: {
    type: 'string',
    required: true,
    min: 10,
    max: 500
  },
  google_maps_url: {
    type: 'string',
    required: true,
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return value.startsWith('https://maps.google.com') || value.startsWith('https://www.google.com/maps');
      } catch {
        return 'Invalid Google Maps URL';
      }
    }
  },
  waze_url: {
    type: 'string',
    required: true,
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return value.startsWith('https://waze.com') || value.startsWith('https://www.waze.com');
      } catch {
        return 'Invalid Waze URL';
      }
    }
  }
};

const updateInvitationSchema = {
  slug: {
    type: 'string',
    min: 3,
    max: 50,
    pattern: /^[a-z0-9-]+$/,
    custom: (value: string) => {
      if (!value) return true;
      // Check for reserved words
      const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp'];
      if (reservedWords.includes(value.toLowerCase())) {
        return 'Slug cannot be a reserved word';
      }
      return true;
    }
  },
  template_id: {
    type: 'string'
  },
  event_type: {
    type: 'string',
    enum: ['Walimatulurus', 'Majlis Tunang', 'Majlis Persandingan', 'Others']
  },
  bride_name: {
    type: 'string',
    min: 2,
    max: 100
  },
  groom_name: {
    type: 'string',
    min: 2,
    max: 100
  },
  host_names: {
    type: 'string',
    min: 5,
    max: 200
  },
  event_date: {
    type: 'string',
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },
  start_time: {
    type: 'string',
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  end_time: {
    type: 'string',
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  location_name: {
    type: 'string',
    min: 5,
    max: 200
  },
  address: {
    type: 'string',
    min: 10,
    max: 500
  },
  google_maps_url: {
    type: 'string',
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return value.startsWith('https://maps.google.com') || value.startsWith('https://www.google.com/maps');
      } catch {
        return 'Invalid Google Maps URL';
      }
    }
  },
  waze_url: {
    type: 'string',
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return value.startsWith('https://waze.com') || value.startsWith('https://www.waze.com');
      } catch {
        return 'Invalid Waze URL';
      }
    }
  },
  'settings.music_url': {
    type: 'string',
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return 'Invalid music URL';
      }
    }
  },
  'settings.primary_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.show_countdown': {
    type: 'boolean'
  },
  'settings.show_gallery': {
    type: 'boolean'
  },
  'settings.is_published': {
    type: 'boolean'
  },
  'settings.background_image': {
    type: 'string',
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return 'Invalid background image URL';
      }
    }
  },
  'settings.pantun': {
    type: 'string',
    max: 1000
  },
  'settings.our_story': {
    type: 'string',
    max: 5000
  },
  'settings.hero_title': {
    type: 'string',
    max: 100
  },
  'settings.greeting_text': {
    type: 'string',
    max: 200
  },
  'settings.invitation_text': {
    type: 'string',
    max: 1000
  },
  'settings.story_title': {
    type: 'string',
    max: 100
  },
  'settings.groom_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.bride_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.host_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.date_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.greeting_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.greeting_size': {
    type: 'string',
    pattern: /^\d+(px|em|rem|%)$/
  },
  'settings.hero_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.hero_size': {
    type: 'string',
    pattern: /^\d+(px|em|rem|%)$/
  },
  'settings.invitation_color': {
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  'settings.invitation_size': {
    type: 'string',
    pattern: /^\d+(px|em|rem|%)$/
  },
  'money_gift_details.enabled': {
    type: 'boolean'
  },
  'money_gift_details.bank_name': {
    type: 'string',
    max: 100
  },
  'money_gift_details.account_no': {
    type: 'string',
    pattern: /^\d{10,20}$/
  },
  'money_gift_details.account_holder': {
    type: 'string',
    max: 200
  },
  'money_gift_details.qr_url': {
    type: 'string',
    custom: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return 'Invalid QR code URL';
      }
    }
  }
};

const idParamSchema = {
  id: {
    type: 'string',
    required: true
  }
};

const slugParamSchema = {
  slug: {
    type: 'string',
    required: true,
    pattern: /^[a-z0-9-]+$/
  }
};

const querySchema = {
  search: {
    type: 'string'
  },
  sortBy: {
    type: 'string',
    enum: ['created_at', 'updated_at', 'event_date', 'bride_name', 'groom_name', 'slug', 'event_type']
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
  event_type: {
    type: 'string',
    enum: ['Walimatulurus', 'Majlis Tunang', 'Majlis Persandingan', 'Others']
  },
  is_published: {
    type: 'boolean'
  }
};

/**
 * @route GET /api/invitations
 * @access Private
 */
router.get('/', createSecureRoute('profile', { query: querySchema }), getAllInvitations);

/**
 * @route GET /api/invitations/:id
 * @access Private
 */
router.get('/:id', createSecureRoute('profile', { params: idParamSchema }), getInvitationById);

/**
 * @route GET /api/invitations/slug/:slug
 * @access Public
 */
router.get('/slug/:slug', createSecureRoute('auth', { params: slugParamSchema }), getInvitationBySlug);

/**
 * @route POST /api/invitations
 * @access Private
 */
router.post('/', createSecureRoute('profile', { body: createInvitationSchema }), createInvitation);

/**
 * @route PUT /api/invitations/:id
 * @access Private
 */
router.put('/:id', createSecureRoute('profile', { params: idParamSchema, body: updateInvitationSchema }), updateInvitation);

/**
 * @route DELETE /api/invitations/:id
 * @access Private
 */
router.delete('/:id', createSecureRoute('profile', { params: idParamSchema }), deleteInvitation);

export default router;