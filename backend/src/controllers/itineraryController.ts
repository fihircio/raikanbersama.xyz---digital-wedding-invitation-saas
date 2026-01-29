import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import databaseService from '../services/databaseService';
import { sortArray } from '../utils/pagination';
import logger from '../utils/logger';

/**
 * Itinerary Controller
 * Handles all itinerary item-related operations
 */

/**
 * Get itinerary items by invitation ID
 * @route GET /api/itinerary/invitation/:invitationId
 * @access Private
 */
export const getItineraryItemsByInvitationId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const itineraryItems = await databaseService.getItineraryItemsByInvitationId(invitationId);

    // Sort by time
    const sortedItems = sortArray(itineraryItems, 'time', 'asc');

    res.status(200).json({
      success: true,
      data: sortedItems
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting itinerary items:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching itinerary items'
    } as ApiResponse);
  }
};

/**
 * Get itinerary item by ID
 * @route GET /api/itinerary/:id
 * @access Private
 */
export const getItineraryItemById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const foundItem = await databaseService.getItineraryItemById(id);
    if (!foundItem) {
      res.status(404).json({
        success: false,
        error: 'Itinerary item not found'
      } as ApiResponse);
      return;
    }

    // Check ownership via invitation
    const invitation = await databaseService.getInvitationById(foundItem.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this itinerary item.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: foundItem
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting itinerary item by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching itinerary item'
    } as ApiResponse);
  }
};

/**
 * Create new itinerary item
 * @route POST /api/itinerary
 * @access Private
 */
export const createItineraryItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { invitation_id, time, activity } = req.body;

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Validate input
    if (!time || !activity) {
      res.status(400).json({
        success: false,
        error: 'Time and activity are required'
      } as ApiResponse);
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      res.status(400).json({
        success: false,
        error: 'Invalid time format. Please use HH:MM format.'
      } as ApiResponse);
      return;
    }

    const newItem = await databaseService.createItineraryItem({
      invitation_id,
      time,
      activity
    });

    logger.info(`New itinerary item created: ${newItem.id} for invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: newItem
    } as ApiResponse);
  } catch (error) {
    logger.error('Error creating itinerary item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating itinerary item'
    } as ApiResponse);
  }
};

/**
 * Update itinerary item
 * @route PUT /api/itinerary/:id
 * @access Private
 */
export const updateItineraryItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const existingItem = await databaseService.getItineraryItemById(id);
    if (!existingItem) {
      res.status(404).json({
        success: false,
        error: 'Itinerary item not found'
      } as ApiResponse);
      return;
    }

    // Check ownership via invitation
    const invitation = await databaseService.getInvitationById(existingItem.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this itinerary item.'
      } as ApiResponse);
      return;
    }

    const updateData = req.body;

    // Validate time format if provided
    if (updateData.time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updateData.time)) {
        res.status(400).json({
          success: false,
          error: 'Invalid time format. Please use HH:MM format.'
        } as ApiResponse);
        return;
      }
    }

    const updatedItem = await databaseService.updateItineraryItem(id, updateData);

    logger.info(`Itinerary item updated: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      data: updatedItem
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating itinerary item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating itinerary item'
    } as ApiResponse);
  }
};

/**
 * Delete itinerary item
 * @route DELETE /api/itinerary/:id
 * @access Private
 */
export const deleteItineraryItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const existingItem = await databaseService.getItineraryItemById(id);
    if (!existingItem) {
      res.status(404).json({
        success: false,
        error: 'Itinerary item not found'
      } as ApiResponse);
      return;
    }

    // Check ownership via invitation
    const invitation = await databaseService.getInvitationById(existingItem.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this itinerary item.'
      } as ApiResponse);
      return;
    }

    const deleted = await databaseService.deleteItineraryItem(id);

    if (deleted) {
      logger.info(`Itinerary item deleted: ${id} by user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Itinerary item deleted successfully'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete itinerary item'
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('Error deleting itinerary item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting itinerary item'
    } as ApiResponse);
  }
};