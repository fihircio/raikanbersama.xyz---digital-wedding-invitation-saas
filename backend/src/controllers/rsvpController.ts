import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { RSVP } from '../types/models';
import { rsvpRepository, invitationRepository } from '../repositories';
import { getPaginationParams, getFilterParams, calculatePagination } from '../utils/pagination';
import logger from '../utils/logger';

/**
 * RSVP Controller
 * Handles all RSVP-related operations
 */

/**
 * Get all RSVPs with pagination and filtering
 * @route GET /api/rsvps
 * @access Private
 */
export const getAllRSVPs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const { page = 1, limit = 10 } = getPaginationParams(req);
    const { search, sortBy = 'created_at', sortOrder = 'desc' } = getFilterParams(req);
    const { invitation_id, is_attending } = req.query;

    // Get user's invitations to ensure user can only see RSVPs for their own invitations
    const userInvitations = await invitationRepository.findByUserId(userId);
    const userInvitationIds = userInvitations.map(inv => inv.id);

    // Build where conditions
    const whereCondition: any = {
      invitation_id: userInvitationIds.length > 0 ? { $in: userInvitationIds } : null,
    };

    // Apply additional filters
    if (invitation_id) {
      whereCondition.invitation_id = invitation_id;
    }

    if (is_attending !== undefined) {
      whereCondition.is_attending = is_attending === 'true';
    }

    // Apply search filter if provided
    if (search) {
      whereCondition.$or = [
        { guest_name: { $iLike: `%${search}%` } },
        { phone_number: { $iLike: `%${search}%` } },
        { message: { $iLike: `%${search}%` } }
      ];
    }

    // Get RSVPs with pagination
    const result = await rsvpRepository.getRSVPsWithPagination(
      Number(page),
      Number(limit),
      whereCondition
    );

    const pagination = calculatePagination(Number(page), Number(limit), result.count);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting all RSVPs:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching RSVPs'
    } as ApiResponse);
  }
};

/**
 * Get RSVP by ID
 * @route GET /api/rsvps/:id
 * @access Private
 */
export const getRSVPById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const rsvp = await rsvpRepository.findById(id);
    if (!rsvp) {
      res.status(404).json({
        success: false,
        error: 'RSVP not found'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation for this RSVP
    const invitation = await invitationRepository.findById(rsvp.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: rsvp
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting RSVP by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching RSVP'
    } as ApiResponse);
  }
};

/**
 * Get RSVPs by invitation ID
 * @route GET /api/rsvps/invitation/:invitationId
 * @access Private
 */
export const getRSVPsByInvitationId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const invitation = await invitationRepository.findById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const rsvps = await rsvpRepository.findByInvitationId(invitationId);

    res.status(200).json({
      success: true,
      data: rsvps
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting RSVPs by invitation ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching RSVPs'
    } as ApiResponse);
  }
};

/**
 * Create new RSVP
 * @route POST /api/rsvps
 * @access Public
 */
export const createRSVP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rsvpData = req.body as Omit<RSVP, 'id' | 'created_at'>;

    // Check if invitation exists and is published
    const invitation = await invitationRepository.findById(rsvpData.invitation_id);
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

    // Check if guest has already RSVP'd (only prevent exact duplicates, not similar names)
    const existingRSVPs = await rsvpRepository.findByInvitationId(rsvpData.invitation_id);
    const existingRSVP = existingRSVPs.find(r =>
      r.guest_name.toLowerCase() === rsvpData.guest_name.toLowerCase() &&
      r.phone_number === rsvpData.phone_number
    );

    // Allow RSVP from unregistered guests but prevent exact duplicates
    // This allows magic links to work while still preventing spam
    if (existingRSVP) {
      res.status(400).json({
        success: false,
        error: 'You have already RSVPd for this invitation with this exact name and phone number'
      } as ApiResponse);
      return;
    }

    const newRSVP = await rsvpRepository.createRSVP(rsvpData);

    logger.info(`New RSVP created: ${newRSVP.id} for invitation: ${rsvpData.invitation_id}`);

    res.status(201).json({
      success: true,
      data: newRSVP
    } as ApiResponse);
  } catch (error) {
    logger.error('Error creating RSVP:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating RSVP'
    } as ApiResponse);
  }
};

/**
 * Update RSVP
 * @route PUT /api/rsvps/:id
 * @access Private
 */
export const updateRSVP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if RSVP exists
    const existingRSVP = await rsvpRepository.findById(id);
    if (!existingRSVP) {
      res.status(404).json({
        success: false,
        error: 'RSVP not found'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation for this RSVP
    const invitation = await invitationRepository.findById(existingRSVP.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const updateData = req.body as Partial<RSVP>;
    // Convert to proper format for repository
    const repositoryUpdateData: any = { ...updateData };
    if (repositoryUpdateData.created_at && typeof repositoryUpdateData.created_at === 'string') {
      repositoryUpdateData.created_at = new Date(repositoryUpdateData.created_at);
    }
    const updatedRSVP = await rsvpRepository.updateRSVP(id, repositoryUpdateData);

    logger.info(`RSVP updated: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      data: updatedRSVP
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating RSVP:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating RSVP'
    } as ApiResponse);
  }
};

/**
 * Delete RSVP
 * @route DELETE /api/rsvps/:id
 * @access Private
 */
export const deleteRSVP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if RSVP exists
    const existingRSVP = await rsvpRepository.findById(id);
    if (!existingRSVP) {
      res.status(404).json({
        success: false,
        error: 'RSVP not found'
      } as ApiResponse);
      return;
    }

    // Check if user owns the invitation for this RSVP
    const invitation = await invitationRepository.findById(existingRSVP.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const deleted = await rsvpRepository.deleteById(id);

    if (deleted) {
      logger.info(`RSVP deleted: ${id} by user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'RSVP deleted successfully'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete RSVP'
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('Error deleting RSVP:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting RSVP'
    } as ApiResponse);
  }
};

/**
 * Get RSVP statistics for an invitation
 * @route GET /api/rsvps/stats/:invitationId
 * @access Private
 */
export const getRSVPStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const invitation = await invitationRepository.findById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const stats = await rsvpRepository.getRSVPStats(invitationId);

    res.status(200).json({
      success: true,
      data: stats
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting RSVP stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching RSVP statistics'
    } as ApiResponse);
  }
};

/**
 * Export RSVPs for an invitation
 * @route GET /api/rsvps/export/:invitationId
 * @access Private
 */
export const exportRSVPs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const invitation = await invitationRepository.findById(invitationId);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this invitation.'
      } as ApiResponse);
      return;
    }

    const rsvps = await rsvpRepository.findByInvitationId(invitationId);

    // Format data for CSV export
    const csvData = rsvps.map(rsvp => ({
      'Guest Name': rsvp.guest_name,
      'Phone Number': rsvp.phone_number,
      'Number of Guests (PAX)': rsvp.pax,
      'Slot / Category': rsvp.slot || '-',
      'Attending': rsvp.is_attending ? 'Yes' : 'No',
      'Message': rsvp.message || '',
      'RSVP Date': rsvp.created_at.toISOString().split('T')[0]
    }));

    res.status(200).json({
      success: true,
      data: csvData
    } as ApiResponse);
  } catch (error) {
    logger.error('Error exporting RSVPs:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while exporting RSVPs'
    } as ApiResponse);
  }
};