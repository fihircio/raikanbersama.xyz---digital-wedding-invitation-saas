import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { BackgroundImage } from '../models';
import { getPaginationParams, calculatePagination } from '../utils/pagination';
import logger from '../utils/logger';
import { Op, WhereOptions } from 'sequelize';

/**
 * Background Controller
 * Handles all background image-related operations
 */

/**
 * Get all background images with pagination and filtering
 * @route GET /api/backgrounds
 * @access Public
 */
export const getAllBackgrounds = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get pagination parameters
    const { page, limit } = getPaginationParams(req);
    const { search, sortBy, sortOrder, category, isPremium, sort } = req.query;

    const where: any = {};

    // Apply category filter (handle multiple categories comma separated)
    if (category) {
      const categoryList = (category as string).split(',');
      if (categoryList.length > 1) {
        where.category = { [Op.in]: categoryList };
      } else {
        where.category = categoryList[0];
      }
    }

    // Apply premium filter
    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    // Apply search filter
    if (search) {
      where[Op.or as any] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        // tags is JSONB, search within it if needed, but simple name/category is usually enough
      ];
    }

    // Determine sorting
    let order: any[] = [[(sortBy as string) || 'name', (sortOrder as string) || 'ASC']];

    if (sort === 'latest') {
      order = [['created_at', 'DESC']];
    } else if (sort === 'popular') {
      // For now we don't have popularity index, so let's just use name or id
      order = [['name', 'ASC']];
    } else if (sort === 'a-z') {
      order = [['name', 'ASC']];
    }

    // Get backgrounds with pagination
    const { count, rows: backgrounds } = await BackgroundImage.findAndCountAll({
      where,
      order,
      limit: limit || 10,
      offset: ((page || 1) - 1) * (limit || 10)
    });

    // Calculate pagination
    const pagination = calculatePagination(page || 1, limit || 10, count);

    res.status(200).json({
      success: true,
      data: backgrounds,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting all backgrounds:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching backgrounds'
    } as ApiResponse);
  }
};

/**
 * Get background image by ID
 * @route GET /api/backgrounds/:id
 * @access Public
 */
export const getBackgroundById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const background = await BackgroundImage.findByPk(id);
    if (!background) {
      res.status(404).json({
        success: false,
        error: 'Background image not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: background
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting background by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching background'
    } as ApiResponse);
  }
};

/**
 * Get backgrounds by category
 * @route GET /api/backgrounds/category/:category
 * @access Public
 */
export const getBackgroundsByCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { page, limit } = getPaginationParams(req);
    const { search, sortBy, sortOrder } = req.query;

    const where: WhereOptions = { category };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: backgrounds } = await BackgroundImage.findAndCountAll({
      where,
      order: [[(sortBy as string) || 'name', (sortOrder as string) || 'ASC']],
      limit: limit || 10,
      offset: ((page || 1) - 1) * (limit || 10)
    });

    const pagination = calculatePagination(page || 1, limit || 10, count);

    res.status(200).json({
      success: true,
      data: backgrounds,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting backgrounds by category:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching backgrounds'
    } as ApiResponse);
  }
};

/**
 * Get premium backgrounds
 * @route GET /api/backgrounds/premium
 * @access Public
 */
export const getPremiumBackgrounds = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = getPaginationParams(req);
    const { search, sortBy, sortOrder } = req.query;

    const where: WhereOptions = { isPremium: true };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: backgrounds } = await BackgroundImage.findAndCountAll({
      where,
      order: [[(sortBy as string) || 'name', (sortOrder as string) || 'ASC']],
      limit: limit || 10,
      offset: ((page || 1) - 1) * (limit || 10)
    });

    const pagination = calculatePagination(page || 1, limit || 10, count);

    res.status(200).json({
      success: true,
      data: backgrounds,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting premium backgrounds:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching backgrounds'
    } as ApiResponse);
  }
};

/**
 * Get free backgrounds
 * @route GET /api/backgrounds/free
 * @access Public
 */
export const getFreeBackgrounds = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = getPaginationParams(req);
    const { search, sortBy, sortOrder } = req.query;

    const where: WhereOptions = { isPremium: false };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: backgrounds } = await BackgroundImage.findAndCountAll({
      where,
      order: [[(sortBy as string) || 'name', (sortOrder as string) || 'ASC']],
      limit: limit || 10,
      offset: ((page || 1) - 1) * (limit || 10)
    });

    const pagination = calculatePagination(page || 1, limit || 10, count);

    res.status(200).json({
      success: true,
      data: backgrounds,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting free backgrounds:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching backgrounds'
    } as ApiResponse);
  }
};