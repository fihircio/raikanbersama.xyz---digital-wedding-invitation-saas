import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { GuestWish } from '../types/models';
import mockDataService from '../services/mockDataService';
import { getPaginationParams, calculatePagination, paginateArray, sortArray } from '../utils/pagination';
import logger from '../utils/logger';

/**
 * Guest Wish Controller
 * Handles all guest wish-related operations
 */

/**
 * Get all guest wishes with pagination
 * @route GET /api/guest-wishes
 * @access Private
 */
export const getAllGuestWishes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Get pagination parameters
    const { page, limit } = getPaginationParams(req);
    const { invitation_id } = req.query;
    
    // Get all guest wishes
    let wishes: GuestWish[] = [];
    
    if (invitation_id) {
      // Get wishes for specific invitation
      wishes = await mockDataService.getGuestWishesByInvitationId(invitation_id as string);
      
      // Check if user owns the invitation
      const invitation = await mockDataService.getInvitationById(invitation_id as string);
      if (!invitation || invitation.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You do not own this invitation.'
        } as ApiResponse);
        return;
      }
    } else {
      // Get all wishes for user's invitations
      const userInvitations = await mockDataService.getInvitationsByUserId(userId);
      const userInvitationIds = userInvitations.map(inv => inv.id);
      
      for (const invId of userInvitationIds) {
        const invWishes = await mockDataService.getGuestWishesByInvitationId(invId);
        wishes.push(...invWishes);
      }
    }
    
    // Apply sorting
    wishes = sortArray(wishes, 'created_at', 'desc');
    
    // Calculate pagination
    const total = wishes.length;
    const pagination = calculatePagination(page || 1, limit || 10, total);
    
    // Apply pagination
    const paginatedWishes = paginateArray(wishes, page || 1, limit || 10);
    
    res.status(200).json({
      success: true,
      data: paginatedWishes,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting all guest wishes:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching guest wishes'
    } as ApiResponse);
  }
};

/**
 * Get guest wish by ID
 * @route GET /api/guest-wishes/:id
 * @access Private
 */
export const getGuestWishById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const wish = await mockDataService.getGuestWishById(id);
    if (!wish) {
      res.status(404).json({
        success: false,
        error: 'Guest wish not found'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation for this wish
    // We need to find which invitation this wish belongs to
    const userInvitations = await mockDataService.getInvitationsByUserId(userId);
    let userOwnsWish = false;
    
    for (const invitation of userInvitations) {
      const invitationWishes = await mockDataService.getGuestWishesByInvitationId(invitation.id);
      if (invitationWishes.some(w => w.id === wish.id)) {
        userOwnsWish = true;
        break;
      }
    }
    
    if (!userOwnsWish) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this guest wish.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: wish
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting guest wish by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching guest wish'
    } as ApiResponse);
  }
};

/**
 * Get guest wishes by invitation ID
 * @route GET /api/guest-wishes/invitation/:invitationId
 * @access Public
 */
export const getGuestWishesByInvitationId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { invitationId } = req.params;
    
    // Check if invitation exists and is published
    const invitation = await mockDataService.getInvitationById(invitationId);
    if (!invitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found'
      } as ApiResponse);
      return;
    }

    // Get wishes for the invitation
    const wishes = await mockDataService.getGuestWishesByInvitationId(invitationId);
    
    res.status(200).json({
      success: true,
      data: wishes
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting guest wishes by invitation ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching guest wishes'
    } as ApiResponse);
  }
};

/**
 * Create new guest wish
 * @route POST /api/guest-wishes
 * @access Public
 */
export const createGuestWish = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { invitation_id, name, message } = req.body;
    
    // Check if invitation exists and is published
    const invitation = await mockDataService.getInvitationById(invitation_id);
    if (!invitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found'
      } as ApiResponse);
      return;
    }

    if (!invitation.settings.is_published) {
      res.status(400).json({
        success: false,
        error: 'Invitation is not published yet'
      } as ApiResponse);
      return;
    }

    // Validate input
    if (!name || !message) {
      res.status(400).json({
        success: false,
        error: 'Name and message are required'
      } as ApiResponse);
      return;
    }

    const newWish = await mockDataService.createGuestWish({
      invitation_id,
      name,
      message
    });
    
    logger.info(`New guest wish created: ${newWish.id} for invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: newWish
    } as ApiResponse);
  } catch (error) {
    logger.error('Error creating guest wish:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating guest wish'
    } as ApiResponse);
  }
};

/**
 * Delete guest wish
 * @route DELETE /api/guest-wishes/:id
 * @access Private
 */
export const deleteGuestWish = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Check if guest wish exists
    const existingWish = await mockDataService.getGuestWishById(id);
    if (!existingWish) {
      res.status(404).json({
        success: false,
        error: 'Guest wish not found'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation for this wish
    const userInvitations = await mockDataService.getInvitationsByUserId(userId);
    let userOwnsWish = false;
    
    for (const invitation of userInvitations) {
      const invitationWishes = await mockDataService.getGuestWishesByInvitationId(invitation.id);
      if (invitationWishes.some(w => w.id === existingWish.id)) {
        userOwnsWish = true;
        break;
      }
    }
    
    if (!userOwnsWish) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this guest wish.'
      } as ApiResponse);
      return;
    }

    const deleted = await mockDataService.deleteGuestWish(id);
    
    if (deleted) {
      logger.info(`Guest wish deleted: ${id} by user: ${userId}`);
      
      res.status(200).json({
        success: true,
        message: 'Guest wish deleted successfully'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete guest wish'
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('Error deleting guest wish:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting guest wish'
    } as ApiResponse);
  }
};