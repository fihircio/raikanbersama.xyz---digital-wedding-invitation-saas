import { Router } from 'express';
import { createSecureRoute } from '../middleware/securityMiddleware';
import {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite
} from '../controllers/favoriteController';

const router = Router();

// Validation schemas
const addFavoriteSchema = {
    background_image_id: {
        type: 'string',
        required: true
    }
};

const backgroundIdParamSchema = {
    backgroundId: {
        type: 'string',
        required: true
    }
};

/**
 * @route GET /api/favorites
 * @access Private
 */
router.get('/', createSecureRoute('profile'), getFavorites);

/**
 * @route POST /api/favorites
 * @access Private
 */
router.post('/', createSecureRoute('profile', { body: addFavoriteSchema }), addFavorite);

/**
 * @route DELETE /api/favorites/:backgroundId
 * @access Private
 */
router.delete('/:backgroundId', createSecureRoute('profile', { params: backgroundIdParamSchema }), removeFavorite);

/**
 * @route GET /api/favorites/check/:backgroundId
 * @access Private
 */
router.get('/check/:backgroundId', createSecureRoute('profile', { params: backgroundIdParamSchema }), isFavorite);

export default router;
