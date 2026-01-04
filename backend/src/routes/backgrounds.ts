import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import { 
  getAllBackgrounds, 
  getBackgroundById, 
  getBackgroundsByCategory, 
  getPremiumBackgrounds, 
  getFreeBackgrounds 
} from '../controllers/backgroundController';

const router = Router();

// Validation schemas
const idParamSchema = {
  id: {
    type: 'string',
    required: true
  }
};

const categoryParamSchema = {
  category: {
    type: 'string',
    required: true,
    enum: ['popular', 'minimalist', 'elegant', 'floral']
  }
};

const querySchema = {
  search: {
    type: 'string'
  },
  sortBy: {
    type: 'string',
    enum: ['name', 'category', 'isPremium']
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
  category: {
    type: 'string',
    enum: ['popular', 'minimalist', 'elegant', 'floral']
  },
  isPremium: {
    type: 'boolean'
  }
};

/**
 * @route GET /api/backgrounds
 * @access Public
 */
router.get('/', createSecureRoute('auth', { query: querySchema }), getAllBackgrounds);

/**
 * @route GET /api/backgrounds/:id
 * @access Public
 */
router.get('/:id', createSecureRoute('auth', { params: idParamSchema }), getBackgroundById);

/**
 * @route GET /api/backgrounds/category/:category
 * @access Public
 */
router.get('/category/:category', createSecureRoute('auth', { params: categoryParamSchema, query: querySchema }), getBackgroundsByCategory);

/**
 * @route GET /api/backgrounds/premium
 * @access Public
 */
router.get('/premium', createSecureRoute('auth', { query: querySchema }), getPremiumBackgrounds);

/**
 * @route GET /api/backgrounds/free
 * @access Public
 */
router.get('/free', createSecureRoute('auth', { query: querySchema }), getFreeBackgrounds);

export default router;