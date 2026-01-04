import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { BackgroundImage } from '../types/models';
import mockDataService from '../services/mockDataService';
import { getPaginationParams, calculatePagination, paginateArray, sortArray, searchArray } from '../utils/pagination';
import logger from '../utils/logger';

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
    // Get pagination and filter parameters
    const { page, limit } = getPaginationParams(req);
    const { search, sortBy, sortOrder } = req.query;
    const { category, isPremium } = req.query;
    
    // Get all backgrounds
    let backgrounds = await mockDataService.getAllBackgrounds();
    
    // Apply category filter
    if (category) {
      backgrounds = await mockDataService.getBackgroundsByCategory(category as string);
    }
    
    // Apply premium filter
    if (isPremium !== undefined) {
      const premium = isPremium === 'true';
      if (premium) {
        backgrounds = await mockDataService.getPremiumBackgrounds();
      } else {
        backgrounds = await mockDataService.getFreeBackgrounds();
      }
    }
    
    // Apply search filter
    if (search) {
      backgrounds = searchArray(backgrounds, search as string, ['name', 'category', 'tags']);
    }
    
    // Apply sorting
    backgrounds = sortArray(backgrounds, (sortBy as string) || 'name', (sortOrder as 'asc' | 'desc') || 'asc');
    
    // Calculate pagination
    const total = backgrounds.length;
    const pagination = calculatePagination(page || 1, limit || 10, total);
    
    // Apply pagination
    const paginatedBackgrounds = paginateArray(backgrounds, page || 1, limit || 10);
    
    res.status(200).json({
      success: true,
      data: paginatedBackgrounds,
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
    
    const background = await mockDataService.getBackgroundById(id);
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
    
    // Get backgrounds by category
    let backgrounds = await mockDataService.getBackgroundsByCategory(category);
    
    // Apply search filter
    if (search) {
      backgrounds = searchArray(backgrounds, search as string, ['name', 'tags']);
    }
    
    // Apply sorting
    backgrounds = sortArray(backgrounds, (sortBy as string) || 'name', (sortOrder as 'asc' | 'desc') || 'asc');
    
    // Calculate pagination
    const total = backgrounds.length;
    const pagination = calculatePagination(page || 1, limit || 10, total);
    
    // Apply pagination
    const paginatedBackgrounds = paginateArray(backgrounds, page || 1, limit || 10);
    
    res.status(200).json({
      success: true,
      data: paginatedBackgrounds,
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
    
    // Get premium backgrounds
    let backgrounds = await mockDataService.getPremiumBackgrounds();
    
    // Apply search filter
    if (search) {
      backgrounds = searchArray(backgrounds, search as string, ['name', 'tags']);
    }
    
    // Apply sorting
    backgrounds = sortArray(backgrounds, (sortBy as string) || 'name', (sortOrder as 'asc' | 'desc') || 'asc');
    
    // Calculate pagination
    const total = backgrounds.length;
    const pagination = calculatePagination(page || 1, limit || 10, total);
    
    // Apply pagination
    const paginatedBackgrounds = paginateArray(backgrounds, page || 1, limit || 10);
    
    res.status(200).json({
      success: true,
      data: paginatedBackgrounds,
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
    
    // Get free backgrounds
    let backgrounds = await mockDataService.getFreeBackgrounds();
    
    // Apply search filter
    if (search) {
      backgrounds = searchArray(backgrounds, search as string, ['name', 'tags']);
    }
    
    // Apply sorting
    backgrounds = sortArray(backgrounds, (sortBy as string) || 'name', (sortOrder as 'asc' | 'desc') || 'asc');
    
    // Calculate pagination
    const total = backgrounds.length;
    const pagination = calculatePagination(page || 1, limit || 10, total);
    
    // Apply pagination
    const paginatedBackgrounds = paginateArray(backgrounds, page || 1, limit || 10);
    
    res.status(200).json({
      success: true,
      data: paginatedBackgrounds,
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