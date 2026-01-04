import { Response } from 'express';
import { AuthenticatedRequest, LoginRequest, RegisterRequest, ApiResponse, ApiUser, User as ApiUserType } from '../types/api';
import { User } from '../models';
import databaseService from '../services/databaseService';
import authService from '../services/authService';
import { userRepository } from '../repositories';
import logger from '../utils/logger';

/**
 * User Controller
 * Handles user authentication and profile management
 */

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, name, password }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse);
      return;
    }

    // Hash password using authService
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const newUser = await databaseService.createUser({
      email,
      name,
      password: hashedPassword,
      membership_tier: 'free' as any,
      email_verified: false
    });

    // Convert to API User type for authService
    const apiUser: ApiUserType = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      password: hashedPassword, // Include password for authService
      membership_tier: newUser.membership_tier,
      membership_expires_at: newUser.membership_expires_at,
      email_verified: newUser.email_verified,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    };

    // Generate JWT token pair using authService
    const { accessToken, refreshToken } = authService.generateTokenPair(apiUser);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token: accessToken,
        refreshToken
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    } as ApiResponse);
  }
};

/**
 * Login user
 * @route POST /api/users/login
 * @access Public
 */
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email (using repository to get the full User model with password)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Check password using authService
    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Convert User model to API User type for authService
    const apiUser: ApiUserType = {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password, // Include password for authService
      membership_tier: user.membership_tier,
      membership_expires_at: user.membership_expires_at?.toISOString() || undefined,
      email_verified: user.email_verified,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString()
    };

    // Generate JWT token pair using authService
    const { accessToken, refreshToken } = authService.generateTokenPair(apiUser);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      data: {
        user: apiUser,
        token: accessToken,
        refreshToken
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    } as ApiResponse);
  }
};

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const user = await databaseService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // User is already in ApiUser format from databaseService
    const userWithoutPassword = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    } as ApiResponse);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await databaseService.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        res.status(400).json({
          success: false,
          error: 'Email is already taken by another user'
        } as ApiResponse);
        return;
      }
    }

    const updatedUser = await databaseService.updateUser(userId, { name, email });
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // User is already in ApiUser format from databaseService
    const userWithoutPassword = updatedUser;

    logger.info(`User profile updated: ${userId}`);

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    } as ApiResponse);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    } as ApiResponse);
  }
};

/**
 * Change user password
 * @route PUT /api/users/password
 * @access Private
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user (using repository to get the full User model with password)
    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // Verify current password using authService
    const isCurrentPasswordValid = await authService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      } as ApiResponse);
      return;
    }

    // Hash new password using authService
    const hashedNewPassword = await authService.hashPassword(newPassword);

    // Update password
    await databaseService.updateUser(userId, { password: hashedNewPassword });

    logger.info(`Password changed for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while changing password'
    } as ApiResponse);
  }
};

/**
 * Refresh access token
 * @route POST /api/users/refresh
 * @access Public
 */
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      } as ApiResponse);
      return;
    }

    // Generate new access token
    const newAccessToken = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    } as ApiResponse);
  }
};

/**
 * Logout user (revoke refresh token)
 * @route POST /api/users/logout
 * @access Private
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (refreshToken) {
      // Revoke the specific refresh token
      authService.revokeRefreshToken(refreshToken);
    }

    if (userId) {
      // Optionally revoke all tokens for this user
      // authService.revokeAllUserTokens(userId);
    }

    logger.info(`User logged out: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    } as ApiResponse);
  }
};

/**
 * Request password reset
 * @route POST /api/users/forgot-password
 * @access Public
 */
export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required'
      } as ApiResponse);
      return;
    }

    // Find user by email (using repository to get the full User model with password)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      } as ApiResponse);
      return;
    }

    // Convert User model to API User type for authService
    const apiUser: ApiUserType = {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password, // Include password for authService
      membership_tier: user.membership_tier,
      membership_expires_at: user.membership_expires_at?.toISOString() || undefined,
      email_verified: user.email_verified,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString()
    };

    // Generate password reset token
    const resetToken = authService.generatePasswordResetToken(apiUser);

    // In a real implementation, you would send an email with the reset token
    // For now, we'll just log it (in production, use a proper email service)
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing password reset request'
    } as ApiResponse);
  }
};

/**
 * Reset password with token
 * @route POST /api/users/reset-password
 * @access Public
 */
export const resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Reset token and new password are required'
      } as ApiResponse);
      return;
    }

    // Verify password reset token
    const userId = await authService.verifyPasswordResetToken(token);
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      } as ApiResponse);
      return;
    }

    // Hash new password
    const hashedPassword = await authService.hashPassword(newPassword);

    // Update user password
    const updatedUser = await databaseService.updateUser(userId, { password: hashedPassword });
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // Consume the reset token (remove it)
    authService.consumePasswordResetToken(token);

    // Revoke all refresh tokens for this user to force re-login
    authService.revokeAllUserTokens(userId);

    logger.info(`Password reset completed for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error in reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while resetting password'
    } as ApiResponse);
  }
};

/**
 * Send email verification
 * @route POST /api/users/send-verification
 * @access Private
 */
export const sendEmailVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // Convert User model to API User type for authService
    const apiUser: ApiUserType = {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password, // Include password for authService
      membership_tier: user.membership_tier,
      membership_expires_at: user.membership_expires_at?.toISOString() || undefined,
      email_verified: user.email_verified,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString()
    };

    // Generate email verification token
    const verificationToken = authService.generateEmailVerificationToken(apiUser);

    // In a real implementation, you would send an email with the verification token
    // For now, we'll just log it (in production, use a proper email service)
    logger.info(`Email verification token for ${user.email}: ${verificationToken}`);

    res.status(200).json({
      success: true,
      message: 'Verification email has been sent'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error sending email verification:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while sending verification email'
    } as ApiResponse);
  }
};

/**
 * Verify email with token
 * @route POST /api/users/verify-email
 * @access Public
 */
export const verifyEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Verification token is required'
      } as ApiResponse);
      return;
    }

    // Verify email token
    const userId = await authService.verifyEmailToken(token);
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      } as ApiResponse);
      return;
    }

    // Mark user as verified
    await databaseService.updateUser(userId, { email_verified: true });
    logger.info(`Email verified for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Email has been verified successfully'
    } as ApiResponse);
  } catch (error) {
    logger.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while verifying email'
    } as ApiResponse);
  }
};