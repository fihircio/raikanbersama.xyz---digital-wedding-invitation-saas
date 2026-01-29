import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import fileStorageService from '../services/fileStorageService';
import databaseService from '../services/databaseService';
import logger from '../utils/logger';

/**
 * File Controller
 * Handles all file upload and management operations
 */

/**
 * Upload a single gallery image
 * @route POST /api/files/gallery
 * @access Private
 */
export const uploadGalleryImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitation_id } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    if (!req.uploadResult) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Add image to gallery using real database service
    await databaseService.addGalleryImage({
      invitation_id,
      image_url: req.uploadResult.url
    });

    logger.info(`Gallery image uploaded: ${req.uploadResult.url} to invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: {
        url: req.uploadResult.url,
        key: req.uploadResult.key,
        thumbnails: req.uploadResult.thumbnails
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error uploading gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading gallery image'
    } as ApiResponse);
  }
};

/**
 * Upload multiple gallery images
 * @route POST /api/files/gallery/multiple
 * @access Private
 */
export const uploadMultipleGalleryImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitation_id } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    if (!req.uploadResults || req.uploadResults.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Add images to gallery
    const newImageUrls = req.uploadResults.map(result => result.url);
    for (const url of newImageUrls) {
      await databaseService.addGalleryImage({
        invitation_id,
        image_url: url
      });
    }

    logger.info(`Multiple gallery images uploaded to invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: req.uploadResults.map(result => ({
        url: result.url,
        key: result.key,
        thumbnails: result.thumbnails
      }))
    } as ApiResponse);
  } catch (error) {
    logger.error('Error uploading multiple gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading gallery images'
    } as ApiResponse);
  }
};

/**
 * Upload QR code for money gifts
 * @route POST /api/files/qr-code
 * @access Private
 */
export const uploadQrCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitation_id } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    if (!req.uploadResult) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Update QR code URL in money gift details
    const money_gift_details = { ...invitation.money_gift_details, qr_url: req.uploadResult.url };
    await databaseService.updateInvitation(invitation_id, {
      money_gift_details
    });

    logger.info(`QR code uploaded: ${req.uploadResult.url} to invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: {
        url: req.uploadResult.url,
        key: req.uploadResult.key
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error uploading QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading QR code'
    } as ApiResponse);
  }
};

/**
 * Upload background image for invitation
 * @route POST /api/files/background
 * @access Private
 */
export const uploadBackgroundImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { invitation_id } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    if (!req.uploadResult) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation
    const invitation = await databaseService.getInvitationById(invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    // Update background image in settings
    const settings = { ...invitation.settings, background_image: req.uploadResult.url };
    await databaseService.updateInvitation(invitation_id, {
      settings
    });

    logger.info(`Background image uploaded: ${req.uploadResult.url} to invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: {
        url: req.uploadResult.url,
        key: req.uploadResult.key,
        thumbnails: req.uploadResult.thumbnails
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error uploading background image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading background image'
    } as ApiResponse);
  }
};

/**
 * Delete a file from storage
 * @route DELETE /api/files/:key
 * @access Private
 */
export const deleteFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { key } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Delete the file from S3
    const success = await fileStorageService.deleteFile(key);

    if (!success) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete file'
      } as ApiResponse);
      return;
    }

    logger.info(`File deleted: ${key} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting file'
    } as ApiResponse);
  }
};

/**
 * Get a signed URL for secure file access
 * @route GET /api/files/signed-url/:key
 * @access Private
 */
export const getSignedUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { key } = req.params;
    const { expiresIn = '3600' } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Generate signed URL
    const signedUrl = await fileStorageService.getSignedUrl(
      key,
      parseInt(expiresIn as string, 10)
    );

    logger.info(`Signed URL generated for key: ${key} by user: ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        url: signedUrl,
        expiresIn: parseInt(expiresIn as string, 10)
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while generating signed URL'
    } as ApiResponse);
  }
};