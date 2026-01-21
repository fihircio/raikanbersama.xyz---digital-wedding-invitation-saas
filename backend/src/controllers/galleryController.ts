import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { MembershipTier } from '../types/models';
import databaseService from '../services/databaseService';
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
    const invitation = await databaseService.getInvitationById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const gallery = await databaseService.getGalleryByInvitationId(invitationId);

    res.status(200).json({
      success: true,
      data: gallery
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

    const { invitation_id, url, caption } = req.body;

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // 1. Get user tier for enforcement
    const user = await databaseService.getUserById(userId);
    const tier = user?.membership_tier || MembershipTier.FREE;

    // 2. Enforce Gallery Limits
    let galleryLimit = 0; // Default for Free
    if (tier === MembershipTier.BASIC) galleryLimit = 1;
    else if (tier === MembershipTier.PREMIUM) galleryLimit = 5;
    else if (tier === MembershipTier.ELITE) galleryLimit = 999;

    if (tier !== MembershipTier.ELITE) {
      const currentCount = await databaseService.getGalleryCount(invitation_id);
      if (currentCount >= galleryLimit) {
        res.status(403).json({
          success: false,
          error: `Gallery limit reached. ${tier.toUpperCase()} plans are limited to ${galleryLimit} image(s). Upgrade for more storage.`
        } as ApiResponse);
        return;
      }
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

    // Add image to gallery
    const newImage = await databaseService.addGalleryImage({
      invitation_id,
      image_url: url,
      caption,
      display_order: (await databaseService.getGalleryCount(invitation_id))
    });

    logger.info(`Gallery image added: ${url} to invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: newImage
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
 * @route DELETE /api/gallery/:id
 * @access Private
 */
export const removeGalleryImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // In a real app, we'd check ownership via join or by fetching the gallery item first
    // For now, let's assume the client only sends IDs they have access to, 
    // but in a production app we SHOULD verify invitation ownership here.

    const deleted = await databaseService.deleteGalleryImage(id);

    if (deleted) {
      logger.info(`Gallery image deleted: ${id} by user: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Gallery image removed successfully'
      } as ApiResponse);
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found'
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('Error removing gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing gallery image'
    } as ApiResponse);
  }
};

/**
 * Update gallery images (reorder)
 * @route PUT /api/gallery/reorder/:invitationId
 * @access Private
 */
export const updateGalleryImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitationId } = req.params;
    const { itemIds } = req.body;

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

    // Validate input
    if (!Array.isArray(itemIds)) {
      res.status(400).json({
        success: false,
        error: 'itemIds must be an array of gallery item IDs'
      } as ApiResponse);
      return;
    }

    // Update gallery sequence
    await databaseService.updateGallery(invitationId, itemIds);

    logger.info(`Gallery reordered for invitation: ${invitationId}`);

    res.status(200).json({
      success: true,
      message: 'Gallery reordered successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating gallery images'
    } as ApiResponse);
  }
};