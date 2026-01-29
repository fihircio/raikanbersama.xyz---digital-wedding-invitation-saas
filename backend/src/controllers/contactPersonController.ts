import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import databaseService from '../services/databaseService';
import logger from '../utils/logger';

/**
 * Contact Person Controller
 * Handles all contact person-related operations
 */

/**
 * Get contact persons by invitation ID
 * @route GET /api/contact-persons/invitation/:invitationId
 * @access Private
 */
export const getContactPersonsByInvitationId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const contactPersons = await databaseService.getContactPersonsByInvitationId(invitationId);

    res.status(200).json({
      success: true,
      data: contactPersons
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting contact persons:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching contact persons'
    } as ApiResponse);
  }
};

/**
 * Get contact person by ID
 * @route GET /api/contact-persons/:id
 * @access Private
 */
export const getContactPersonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const foundPerson = await databaseService.getContactPersonById(id);
    if (!foundPerson) {
      res.status(404).json({
        success: false,
        error: 'Contact person not found'
      } as ApiResponse);
      return;
    }

    // Check ownership via invitation
    const invitation = await databaseService.getInvitationById(foundPerson.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this contact person.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: foundPerson
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting contact person by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching contact person'
    } as ApiResponse);
  }
};

/**
 * Create new contact person
 * @route POST /api/contact-persons
 * @access Private
 */
export const createContactPerson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { invitation_id, name, relation, phone } = req.body;

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
    if (!name || !relation || !phone) {
      res.status(400).json({
        success: false,
        error: 'Name, relation, and phone are required'
      } as ApiResponse);
      return;
    }

    // Validate phone number format (basic validation for Malaysian phone numbers)
    const phoneRegex = /^(\+?6?01)[0-46-9]*$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Please use a valid Malaysian phone number.'
      } as ApiResponse);
      return;
    }

    const newPerson = await databaseService.createContactPerson({
      invitation_id,
      name,
      relation,
      phone
    });

    logger.info(`New contact person created: ${newPerson.id} for invitation: ${invitation_id}`);

    res.status(201).json({
      success: true,
      data: newPerson
    } as ApiResponse);
  } catch (error) {
    logger.error('Error creating contact person:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating contact person'
    } as ApiResponse);
  }
};

/**
 * Update contact person
 * @route PUT /api/contact-persons/:id
 * @access Private
 */
export const updateContactPerson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const existingPerson = await databaseService.getContactPersonById(id);
    if (!existingPerson) {
      res.status(404).json({
        success: false,
        error: 'Contact person not found'
      } as ApiResponse);
      return;
    }

    // Check ownership via invitation
    const invitation = await databaseService.getInvitationById(existingPerson.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this contact person.'
      } as ApiResponse);
      return;
    }

    const updateData = req.body;

    // Validate phone number format if provided
    if (updateData.phone) {
      const phoneRegex = /^(\+?6?01)[0-46-9]*$/;
      if (!phoneRegex.test(updateData.phone)) {
        res.status(400).json({
          success: false,
          error: 'Invalid phone number format. Please use a valid Malaysian phone number.'
        } as ApiResponse);
        return;
      }
    }

    const updatedPerson = await databaseService.updateContactPerson(id, updateData);

    logger.info(`Contact person updated: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      data: updatedPerson
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating contact person:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating contact person'
    } as ApiResponse);
  }
};

/**
 * Delete contact person
 * @route DELETE /api/contact-persons/:id
 * @access Private
 */
export const deleteContactPerson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const existingPerson = await databaseService.getContactPersonById(id);
    if (!existingPerson) {
      res.status(404).json({
        success: false,
        error: 'Contact person not found'
      } as ApiResponse);
      return;
    }

    // Check ownership via invitation
    const invitation = await databaseService.getInvitationById(existingPerson.invitation_id);
    if (!invitation || invitation.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this contact person.'
      } as ApiResponse);
      return;
    }

    const deleted = await databaseService.deleteContactPerson(id);

    if (deleted) {
      logger.info(`Contact person deleted: ${id} by user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Contact person deleted successfully'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete contact person'
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('Error deleting contact person:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting contact person'
    } as ApiResponse);
  }
};