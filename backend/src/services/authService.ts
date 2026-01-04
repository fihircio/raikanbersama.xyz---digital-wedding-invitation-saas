import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User as ApiUserType } from '../types/api';
import { User } from '../models';
import config from '../config';
import databaseService from './databaseService';
import logger from '../utils/logger';
import { convertUserToApi } from '../utils/typeConversion';

// Token interface for JWT payload
interface TokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  membership_tier: string;
  type: 'access' | 'refresh' | 'email' | 'password';
}

// Refresh token storage (in production, this would be in Redis or database)
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Email verification tokens storage
const emailVerificationTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Password reset tokens storage
const passwordResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

/**
 * Authentication Service
 * Handles all authentication-related operations including JWT tokens,
 * password hashing, email verification, and password reset
 */
class AuthService {
  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password Plain text password
   * @param hashedPassword Hashed password
   * @returns True if passwords match
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a JWT token
   * @param user User object
   * @param type Token type (access, refresh, email, password)
   * @param expiresIn Token expiration time (optional)
   * @returns JWT token
   */
  generateToken(user: ApiUserType, type: 'access' | 'refresh' | 'email' | 'password' = 'access', expiresIn?: string): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      membership_tier: user.membership_tier,
      type
    };

    let tokenExpiresIn = expiresIn;
    if (!tokenExpiresIn) {
      switch (type) {
        case 'access':
          tokenExpiresIn = config.jwtExpiresIn;
          break;
        case 'refresh':
          tokenExpiresIn = '30d';
          break;
        case 'email':
          tokenExpiresIn = '24h';
          break;
        case 'password':
          tokenExpiresIn = '1h';
          break;
        default:
          tokenExpiresIn = config.jwtExpiresIn;
      }
    }

    return jwt.sign(payload, config.jwtSecret, { expiresIn: tokenExpiresIn } as jwt.SignOptions);
  }

  /**
   * Verify a JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  }

  /**
   * Generate both access and refresh tokens for a user
   * @param user User object
   * @returns Object containing access and refresh tokens
   */
  generateTokenPair(user: ApiUserType): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateToken(user, 'access');
    const refreshToken = this.generateToken(user, 'refresh');

    // Store refresh token with expiration
    const decodedRefresh = this.verifyToken(refreshToken);
    const expiresAt = new Date((decodedRefresh.exp || 0) * 1000);
    refreshTokens.set(refreshToken, { userId: user.id, expiresAt });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh an access token using a refresh token
   * @param refreshToken Refresh token
   * @returns New access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists and is not expired
      const tokenData = refreshTokens.get(refreshToken);
      if (!tokenData || tokenData.expiresAt < new Date()) {
        refreshTokens.delete(refreshToken);
        throw new Error('Refresh token expired or invalid');
      }

      // Get user from database
      const apiUser = await databaseService.getUserById(decoded.id);
      if (!apiUser) {
        throw new Error('User not found');
      }

      // Convert to ApiUserType with a dummy password (not needed for token generation)
      const userForToken: ApiUserType = {
        ...apiUser,
        password: 'dummy' // Password not needed for token generation
      };

      // Generate new access token
      return this.generateToken(userForToken, 'access');
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Revoke a refresh token
   * @param refreshToken Refresh token to revoke
   */
  revokeRefreshToken(refreshToken: string): void {
    refreshTokens.delete(refreshToken);
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userId User ID
   */
  revokeAllUserTokens(userId: string): void {
    for (const [token, data] of refreshTokens.entries()) {
      if (data.userId === userId) {
        refreshTokens.delete(token);
      }
    }
  }

  /**
   * Generate an email verification token
   * @param user User object
   * @returns Email verification token
   */
  generateEmailVerificationToken(user: ApiUserType): string {
    const token = this.generateToken(user, 'email');
    
    // Store token with expiration
    const decoded = this.verifyToken(token);
    const expiresAt = new Date((decoded.exp || 0) * 1000);
    emailVerificationTokens.set(token, { userId: user.id, expiresAt });

    return token;
  }

  /**
   * Verify an email verification token
   * @param token Email verification token
   * @returns User ID if valid
   */
  async verifyEmailToken(token: string): Promise<string | null> {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type !== 'email') {
        throw new Error('Invalid token type');
      }

      // Check if token exists and is not expired
      const tokenData = emailVerificationTokens.get(token);
      if (!tokenData || tokenData.expiresAt < new Date()) {
        emailVerificationTokens.delete(token);
        throw new Error('Email verification token expired or invalid');
      }

      // Get user from database
      const user = await databaseService.getUserById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove the token after successful verification
      emailVerificationTokens.delete(token);

      return user.id;
    } catch (error) {
      logger.error('Error verifying email token:', error);
      return null;
    }
  }

  /**
   * Generate a password reset token
   * @param user User object
   * @returns Password reset token
   */
  generatePasswordResetToken(user: ApiUserType): string {
    const token = this.generateToken(user, 'password');
    
    // Store token with expiration
    const decoded = this.verifyToken(token);
    const expiresAt = new Date((decoded.exp || 0) * 1000);
    passwordResetTokens.set(token, { userId: user.id, expiresAt });

    return token;
  }

  /**
   * Verify a password reset token
   * @param token Password reset token
   * @returns User ID if valid
   */
  async verifyPasswordResetToken(token: string): Promise<string | null> {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type !== 'password') {
        throw new Error('Invalid token type');
      }

      // Check if token exists and is not expired
      const tokenData = passwordResetTokens.get(token);
      if (!tokenData || tokenData.expiresAt < new Date()) {
        passwordResetTokens.delete(token);
        throw new Error('Password reset token expired or invalid');
      }

      // Get user from database
      const apiUser = await databaseService.getUserById(decoded.id);
      if (!apiUser) {
        throw new Error('User not found');
      }

      return apiUser.id;
    } catch (error) {
      logger.error('Error verifying password reset token:', error);
      return null;
    }
  }

  /**
   * Consume a password reset token (remove it after use)
   * @param token Password reset token
   */
  consumePasswordResetToken(token: string): void {
    passwordResetTokens.delete(token);
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens(): void {
    const now = new Date();

    // Clean up expired refresh tokens
    for (const [token, data] of refreshTokens.entries()) {
      if (data.expiresAt < now) {
        refreshTokens.delete(token);
      }
    }

    // Clean up expired email verification tokens
    for (const [token, data] of emailVerificationTokens.entries()) {
      if (data.expiresAt < now) {
        emailVerificationTokens.delete(token);
      }
    }

    // Clean up expired password reset tokens
    for (const [token, data] of passwordResetTokens.entries()) {
      if (data.expiresAt < now) {
        passwordResetTokens.delete(token);
      }
    }
  }

  /**
   * Generate a random token for additional security
   * @param length Token length
   * @returns Random token
   */
  generateRandomToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

export default new AuthService();