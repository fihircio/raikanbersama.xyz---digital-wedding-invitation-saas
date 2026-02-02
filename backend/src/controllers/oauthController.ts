import { Request, Response } from 'express';
import { ApiResponse } from '../types/api';
import authService from '../services/authService';
import databaseService from '../services/databaseService';
import { GoogleProfile } from '../config/googleOAuth';
import logger from '../utils/logger';

/**
 * OAuth Controller
 * Handles Google OAuth authentication flow
 */

/**
 * Initiate Google OAuth
 * @route GET /api/users/auth/google
 * @access Public
 */
export const googleAuth = (req: Request, res: Response): void => {
  // Passport will handle the redirect to Google
  // This is handled by middleware
  logger.info('Google OAuth initiated');
};

/**
 * Handle Google OAuth callback
 * @route GET /api/users/auth/google/callback
 * @access Public
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // Passport attaches the user to req.user after successful authentication
    const user = req.user as any;

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/login?error=oauth_failed`);
      return;
    }

    // Generate JWT tokens for the user
    const { accessToken, refreshToken } = authService.generateOAuthToken(user);

    // Redirect to frontend with tokens
    // Use hash routing because frontend uses HashRouter
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/#/oauth/callback?token=${accessToken}&refreshToken=${refreshToken}`;

    logger.info(`Google OAuth successful for user: ${user.email}`);
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/#/login?error=oauth_error`);
  }
};

/**
 * OAuth callback handler for frontend
 * This endpoint is called by the frontend after receiving the OAuth callback
 * @route POST /api/users/oauth/callback
 * @access Public
 */
export const handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, refreshToken } = req.body;

    if (!token || !refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Token and refreshToken are required'
      } as ApiResponse);
      return;
    }

    // Verify the access token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await databaseService.getUserById(decoded.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    logger.info(`OAuth callback processed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error handling OAuth callback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process OAuth callback'
    } as ApiResponse);
  }
};
