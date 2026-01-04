import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import mockDataService from '../services/mockDataService';
import logger from '../utils/logger';

/**
 * Gallery Controller
 * Handles all gallery image-related operations
 */

/**
 * Get gallery images by invitation ID
 * @route GET /api/gallery/invitation/:invitationId
 * @access Private
 */
export const getGalleryImagesByInvitationId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const invitation = await mockDataService.getInvitationById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: invitation.gallery
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching gallery images'
    } as ApiResponse);
  }
};

/**
 * Add image to gallery
 * @route POST /api/gallery
 * @access Private
 */
export const addGalleryImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { invitation_id, url } = req.body;
    
    // Check if user owns the invitation
    const invitation = await mockDataService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Validate input
    if (!url) {
      res.status(400).json({
        success: false,
        error: 'Image URL is required'
      } as ApiResponse);
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'Invalid image URL format'
      } as ApiResponse);
      return;
    }

    // Check if image already exists in gallery
    if (invitation.gallery.includes(url)) {
      res.status(400).json({
        success: false,
        error: 'Image already exists in gallery'
      } as ApiResponse);
      return;
    }

    // Add image to gallery
    invitation.gallery.push(url);
    await mockDataService.updateInvitation(invitation_id, { gallery: invitation.gallery });
    
    logger.info(`Gallery image added: ${url} to invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: { url }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error adding gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding gallery image'
    } as ApiResponse);
  }
};

/**
 * Remove image from gallery
 * @route DELETE /api/gallery/:invitationId/:imageIndex
 * @access Private
 */
export const removeGalleryImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitationId, imageIndex } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await mockDataService.getInvitationById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const index = parseInt(imageIndex, 10);
    
    // Validate index
    if (isNaN(index) || index < 0 || index >= invitation.gallery.length) {
      res.status(404).json({
        success: false,
        error: 'Image not found'
      } as ApiResponse);
      return;
    }

    // Remove image from gallery
    const removedImage = invitation.gallery[index];
    invitation.gallery.splice(index, 1);
    
    await mockDataService.updateInvitation(invitationId, { gallery: invitation.gallery });
    
    logger.info(`Gallery image removed: ${removedImage} from invitation: ${invitationId}`);

    res.status(200).json({
      success: true,
      message: 'Gallery image removed successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error removing gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing gallery image'
    } as ApiResponse);
  }
};

/**
 * Update gallery images (replace entire gallery)
 * @route PUT /api/gallery/:invitationId
 * @access Private
 */
export const updateGalleryImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitationId } = req.params;
    const { gallery } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await mockDataService.getInvitationById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Validate input
    if (!Array.isArray(gallery)) {
      res.status(400).json({
        success: false,
        error: 'Gallery must be an array of image URLs'
      } as ApiResponse);
      return;
    }

    // Validate each URL
    for (const url of gallery) {
      try {
        new URL(url);
      } catch (e) {
        res.status(400).json({
          success: false,
          error: `Invalid image URL format: ${url}`
        } as ApiResponse);
        return;
      }
    }

    // Update gallery
    await mockDataService.updateInvitation(invitationId, { gallery });
    
    logger.info(`Gallery updated for invitation: ${invitationId}`);

    res.status(200).json({
      success: true,
      data: { gallery }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating gallery images'
    } as ApiResponse);
  }
};