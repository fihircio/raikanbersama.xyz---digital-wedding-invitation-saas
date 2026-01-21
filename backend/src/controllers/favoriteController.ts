import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { Favorite, BackgroundImage } from '../models';
import logger from '../utils/logger';

/**
 * Favorite Controller
 * Handles user favorite background images
 */

/**
 * Get all favorites for current user
 * @route GET /api/favorites
 * @access Private
 */
export const getFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            } as ApiResponse);
            return;
        }

        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: BackgroundImage,
                    as: 'backgroundImage',
                    attributes: ['id', 'name', 'url', 'thumbnail', 'category', 'isPremium', 'tags']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: favorites
        } as ApiResponse);
    } catch (error) {
        logger.error('Error getting favorites:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while fetching favorites'
        } as ApiResponse);
    }
};

/**
 * Add background to favorites
 * @route POST /api/favorites
 * @access Private
 */
export const addFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { background_image_id } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            } as ApiResponse);
            return;
        }

        if (!background_image_id) {
            res.status(400).json({
                success: false,
                error: 'background_image_id is required'
            } as ApiResponse);
            return;
        }

        // Check if background image exists
        const backgroundImage = await BackgroundImage.findByPk(background_image_id);
        if (!backgroundImage) {
            res.status(404).json({
                success: false,
                error: 'Background image not found'
            } as ApiResponse);
            return;
        }

        // Check if already favorited
        const existing = await Favorite.findOne({
            where: {
                user_id: userId,
                background_image_id
            }
        });

        if (existing) {
            res.status(200).json({
                success: true,
                data: existing,
                message: 'Already in favorites'
            } as ApiResponse);
            return;
        }

        // Create favorite
        const favorite = await Favorite.create({
            user_id: userId,
            background_image_id
        });

        logger.info(`User ${userId} favorited background ${background_image_id}`);

        res.status(201).json({
            success: true,
            data: favorite
        } as ApiResponse);
    } catch (error) {
        logger.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while adding favorite'
        } as ApiResponse);
    }
};

/**
 * Remove background from favorites
 * @route DELETE /api/favorites/:backgroundId
 * @access Private
 */
export const removeFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { backgroundId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            } as ApiResponse);
            return;
        }

        const favorite = await Favorite.findOne({
            where: {
                user_id: userId,
                background_image_id: backgroundId
            }
        });

        if (!favorite) {
            res.status(404).json({
                success: false,
                error: 'Favorite not found'
            } as ApiResponse);
            return;
        }

        await favorite.destroy();

        logger.info(`User ${userId} removed favorite background ${backgroundId}`);

        res.status(200).json({
            success: true,
            message: 'Favorite removed successfully'
        } as ApiResponse);
    } catch (error) {
        logger.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while removing favorite'
        } as ApiResponse);
    }
};

/**
 * Check if background is favorited
 * @route GET /api/favorites/check/:backgroundId
 * @access Private
 */
export const isFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { backgroundId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            } as ApiResponse);
            return;
        }

        const favorite = await Favorite.findOne({
            where: {
                user_id: userId,
                background_image_id: backgroundId
            }
        });

        res.status(200).json({
            success: true,
            data: {
                isFavorite: !!favorite
            }
        } as ApiResponse);
    } catch (error) {
        logger.error('Error checking favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while checking favorite'
        } as ApiResponse);
    }
};
