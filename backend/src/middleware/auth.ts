import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/api';
import authService from '../services/authService';
import { User } from '../models';
import { MembershipTier } from '../types/models';
import logger from '../utils/logger';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user information to request
 */

/**
 * Authenticates user using JWT token
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided or invalid format.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token using authService
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
      return;
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      membership_tier: user.membership_tier
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired.'
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user information to request if token is provided, but doesn't require it
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token using authService
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (user) {
      // Attach user information to request
      req.user = {
        id: user.id,
        email: user.email,
        membership_tier: user.membership_tier
      };
    }

    next();
  } catch (error) {
    // Log error but continue without authentication
    logger.warn('Optional authentication failed:', error);
    next();
  }
};

/**
 * Middleware to check if user has premium membership
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requirePremium = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
    return;
  }

  if (req.user.membership_tier === MembershipTier.FREE) {
    res.status(403).json({
      success: false,
      error: 'Paid membership required for this feature.'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has specific membership tier or higher
 * @param requiredTier - Required membership tier
 * @returns Middleware function
 */
export const requireMembershipTier = (requiredTier: MembershipTier) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
      return;
    }

    const tierHierarchy = {
      [MembershipTier.FREE]: 0,
      [MembershipTier.BASIC]: 1,
      [MembershipTier.PREMIUM]: 2,
      [MembershipTier.ELITE]: 3
    };

    const userTierLevel = tierHierarchy[req.user.membership_tier as MembershipTier];
    const requiredTierLevel = tierHierarchy[requiredTier as MembershipTier];

    if (userTierLevel < requiredTierLevel) {
      res.status(403).json({
        success: false,
        error: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} membership or higher required for this feature.`
      });
      return;
    }

    next();
  };
};