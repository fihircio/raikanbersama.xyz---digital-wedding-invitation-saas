import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { Invitation } from '../types/models';
import databaseService from '../services/databaseService';
import { getPaginationParams, getFilterParams, calculatePagination, paginateArray, sortArray, searchArray } from '../utils/pagination';
import logger from '../utils/logger';

/**
 * Invitation Controller
 * Handles all invitation-related operations
 */

/**
 * Get all invitations with pagination and filtering
 * @route GET /api/invitations
 * @access Private
 */
export const getAllInvitations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Get pagination and filter parameters
    const { page, limit } = getPaginationParams(req);
    const { search, sortBy, sortOrder } = getFilterParams(req);
    
    // Get all invitations for user
    let invitations = await databaseService.getInvitationsByUserId(userId);
    
    // Apply search filter
    if (search) {
      invitations = searchArray(invitations, search, ['bride_name', 'groom_name', 'slug', 'event_type']);
    }
    
    // Apply sorting
    invitations = sortArray(invitations, sortBy || 'created_at', sortOrder || 'desc');
    
    // Calculate pagination
    const total = invitations.length;
    const pagination = calculatePagination(page || 1, limit || 10, total);
    
    // Apply pagination
    const paginatedInvitations = paginateArray(invitations, page || 1, limit || 10);
    
    res.status(200).json({
      success: true,
      data: paginatedInvitations,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting all invitations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching invitations'
    } as ApiResponse);
  }
};

/**
 * Get invitation by ID
 * @route GET /api/invitations/:id
 * @access Private
 */
export const getInvitationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const invitation = await databaseService.getInvitationById(id);
    if (!invitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found'
      } as ApiResponse);
      return;
    }

    // Check if user owns this invitation
    if (invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: invitation
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting invitation by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching invitation'
    } as ApiResponse);
  }
};

/**
 * Get invitation by slug (public access)
 * @route GET /api/invitations/slug/:slug
 * @access Public
 */
export const getInvitationBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const invitation = await databaseService.getInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found'
      } as ApiResponse);
      return;
    }

    // Increment view count
    await databaseService.incrementInvitationViews(invitation.id);

    res.status(200).json({
      success: true,
      data: invitation
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting invitation by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching invitation'
    } as ApiResponse);
  }
};

/**
 * Create new invitation
 * @route POST /api/invitations
 * @access Private
 */
export const createInvitation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const invitationData = req.body as Omit<Invitation, 'id' | 'views' | 'wishes'>;
    
    // Set user ID
    invitationData.user_id = userId;

    // Check if slug is already taken
    const existingInvitation = await databaseService.getInvitationBySlug(invitationData.slug);
    if (existingInvitation) {
      res.status(400).json({
        success: false,
        error: 'Slug is already taken. Please choose another one.'
      } as ApiResponse);
      return;
    }

    const newInvitation = await databaseService.createInvitation(invitationData);
    
    logger.info(`New invitation created: ${newInvitation.id} by user: ${userId}`);

    res.status(201).json({
      success: true,
      data: newInvitation
    } as ApiResponse);
  } catch (error) {
    logger.error('Error creating invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating invitation'
    } as ApiResponse);
  }
};

/**
 * Update invitation
 * @route PUT /api/invitations/:id
 * @access Private
 */
export const updateInvitation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if invitation exists and user owns it
    const existingInvitation = await databaseService.getInvitationById(id);
    if (!existingInvitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found'
      } as ApiResponse);
      return;
    }

    if (existingInvitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Check if slug is being changed and if it's already taken
    const updateData = req.body as Partial<Invitation>;
    
    if (updateData.slug && updateData.slug !== existingInvitation.slug) {
      const slugExists = await databaseService.getInvitationBySlug(updateData.slug);
      if (slugExists) {
        res.status(400).json({
          success: false,
          error: 'Slug is already taken. Please choose another one.'
        } as ApiResponse);
        return;
      }
    }

    // Convert to database format for update
    const dbUpdateData: any = { ...updateData };
    
    const updatedInvitation = await databaseService.updateInvitation(id, dbUpdateData);
    
    logger.info(`Invitation updated: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      data: updatedInvitation
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating invitation'
    } as ApiResponse);
  }
};

/**
 * Delete invitation
 * @route DELETE /api/invitations/:id
 * @access Private
 */
export const deleteInvitation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if invitation exists and user owns it
    const existingInvitation = await databaseService.getInvitationById(id);
    if (!existingInvitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found'
      } as ApiResponse);
      return;
    }

    if (existingInvitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const deleted = await databaseService.deleteInvitation(id);
    
    if (deleted) {
      logger.info(`Invitation deleted: ${id} by user: ${userId}`);
      
      res.status(200).json({
        success: true,
        message: 'Invitation deleted successfully'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete invitation'
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('Error deleting invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting invitation'
    } as ApiResponse);
  }
};