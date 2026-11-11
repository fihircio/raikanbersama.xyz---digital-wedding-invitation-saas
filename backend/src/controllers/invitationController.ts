import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types/api';
import { Invitation, MembershipTier } from '../types/models';
import databaseService from '../services/databaseService';
import { getPaginationParams, getFilterParams, calculatePagination, paginateArray, sortArray, searchArray } from '../utils/pagination';
import { convertInvitationToApi, convertInvitationsToApi } from '../utils/typeConversion';
import { sanitizeInvitationPayload } from '../utils/invitationUpdatePolicy';
import logger from '../utils/logger';

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Lower rank = shorter edit window. A card's paid plan and the account tier can
// disagree (payment writes the card plan only), so the effective plan is the
// higher of the two: never downgrade access that the account already has.
const PLAN_RANK: Record<string, number> = { free: 0, lite: 1, pro: 2, elite: 3 };
const EDIT_WINDOW_DAYS: Record<string, number> = {
  free: 30,
  lite: 60,
  pro: 120,
  elite: 99999 // Practically lifetime
};

function normalizePlan(plan: unknown): string | undefined {
  return typeof plan === 'string' && PLAN_RANK[plan] !== undefined ? plan : undefined;
}

function resolveEffectivePlan(userTier: unknown, paidCardPlan: unknown): string {
  const tier = normalizePlan(userTier) ?? 'free';
  const cardPlan = normalizePlan(paidCardPlan);
  if (!cardPlan) return tier;
  return PLAN_RANK[cardPlan] > PLAN_RANK[tier] ? cardPlan : tier;
}

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
      data: convertInvitationsToApi(paginatedInvitations),
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
      data: convertInvitationToApi(invitation)
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

    if (!invitation.settings?.is_published) {
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
      data: convertInvitationToApi(invitation)
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

    // Whitelist-sanitize creation too: `settings.is_paid` is server-owned and new
    // invitations always start as Draft, so a crafted payload cannot create an
    // already-published or already-paid card.
    const sanitized = sanitizeInvitationPayload(req.body, {});

    if (sanitized.rejected.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: sanitized.rejected.map(item => `${item.field}: ${item.reason}`)
      } as ApiResponse);
      return;
    }

    const invitationData = {
      ...sanitized.fields,
      user_id: userId,
      settings: { ...sanitized.settings, is_published: false }
    } as unknown as Omit<Invitation, 'id' | 'views' | 'wishes'>;

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
      data: convertInvitationToApi(newInvitation)
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

    // 1. Resolve the effective entitlement for this card.
    // The card's purchased plan is what grants the edit window; the account tier is
    // only a fallback/floor (admin-granted accounts may hold a higher tier than the
    // plan they bought per card). Payment only writes `settings`, so relying on the
    // account tier alone gave paid customers the Free 30-day window.
    const user = await databaseService.getUserById(userId);
    const userTier = (user?.membership_tier || MembershipTier.FREE) as string;
    const existingSettings = (existingInvitation.settings || {}) as Record<string, any>;
    const paidCardPlan = existingSettings.is_paid === true ? existingSettings.package_plan : undefined;
    const effectivePlan = resolveEffectivePlan(userTier, paidCardPlan);

    // 2. Enforce Edit Window
    const createdAt = new Date(existingInvitation.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const editWindow = EDIT_WINDOW_DAYS[effectivePlan];

    if (daysSinceCreation > editWindow) {
      res.status(403).json({
        success: false,
        error: `Edit window closed. ${effectivePlan.toUpperCase()} plans can only edit for ${editWindow === 99999 ? 'unlimited' : editWindow} days after creation.`
      } as ApiResponse);
      return;
    }

    // 3. Whitelist-sanitize the payload. Unknown fields are dropped, `settings`
    // is merged over the existing row (never replaced), and server-owned keys
    // such as `is_paid` cannot be written by the client.
    const sanitized = sanitizeInvitationPayload(req.body, existingSettings);
    const updateData = sanitized.fields;

    if (sanitized.rejected.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: sanitized.rejected.map(item => `${item.field}: ${item.reason}`)
      } as ApiResponse);
      return;
    }

    // Publish requires paid entitlement. Unpaid cards cannot be made live, and a
    // legacy published-but-unpaid card is forced back to Draft on its next save
    // instead of leaking paid content.
    const incomingSettings = isRecord(req.body?.settings) ? req.body.settings : {};

    const mergedSettings: Record<string, any> = sanitized.settings;

    if (incomingSettings.is_published === true && existingSettings.is_paid !== true) {
      mergedSettings.is_published = false;
      logger.warn(
        `Blocked publish without paid entitlement for invitation ${id} (user ${userId}); forced is_published=false`
      );
    }

    if (isRecord(req.body?.settings)) {
      updateData.settings = mergedSettings as any;
    }

    const requestedSlug = typeof updateData.slug === 'string' ? updateData.slug : undefined;

    if (requestedSlug && requestedSlug !== existingInvitation.slug) {
      const isPaidEliteInvitation = existingSettings.package_plan === 'elite' && existingSettings.is_paid === true;

      if (!isPaidEliteInvitation) {
        res.status(403).json({
          success: false,
          error: 'Custom URL is available only for paid Elite invitations.'
        } as ApiResponse);
        return;
      }

      const slugExists = await databaseService.getInvitationBySlug(requestedSlug);
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
      data: convertInvitationToApi(updatedInvitation!)
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
