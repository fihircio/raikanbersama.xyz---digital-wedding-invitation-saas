import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User as ApiUserType } from '../types/api';
import { User } from '../models';
import { userRepository } from '../repositories';
import config from '../config';
import databaseService from './databaseService';
import logger from '../utils/logger';
import { convertUserToApi } from '../utils/typeConversion';
import { GoogleProfile } from '../config/googleOAuth';

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

  /**
   * Handle Google OAuth login/registration
   * Finds existing user or creates a new one based on Google profile
   * @param profile Google profile from OAuth
   * @returns User object
   */
  async handleGoogleLogin(profile: GoogleProfile): Promise<any> {
    try {
      const googleId = profile.id;
      const email = profile.emails[0]?.value;
      const name = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
      const profilePicture = profile.photos[0]?.value;

      if (!email) {
        throw new Error('Email is required from Google profile');
      }

      // Check if user exists by Google ID
      let user = await userRepository.findByGoogleId(googleId);

      if (user) {
        // User exists, update profile info if needed
        if (user.profile_picture !== profilePicture || user.name !== name) {
          await databaseService.updateUser(user.id, {
            name,
            profile_picture: profilePicture,
          });
          // Refresh user data
          user = await userRepository.findById(user.id);
        }
        logger.info(`Google OAuth login: Existing user ${email}`);
        return user;
      }

      // Check if user exists by email
      user = await userRepository.findByEmail(email);

      if (user) {
        // User exists with email but not linked to Google
        // Link Google account to existing user
        await databaseService.updateUser(user.id, {
          google_id: googleId,
          provider: 'google',
          profile_picture: profilePicture || user.profile_picture,
          email_verified: true, // Google emails are verified
        });
        logger.info(`Google OAuth login: Linked Google to existing user ${email}`);
        return await userRepository.findById(user.id);
      }

      // Create new user using repository directly to support OAuth fields
      const newUser = await userRepository.createUser({
        email,
        name,
        google_id: googleId,
        provider: 'google',
        profile_picture: profilePicture,
        is_oauth_user: true,
        password: '', // OAuth users don't have passwords
        membership_tier: 'free' as any,
        email_verified: true, // Google emails are verified
      });

      logger.info(`Google OAuth registration: New user ${email}`);
      return newUser;
    } catch (error) {
      logger.error('Error handling Google login:', error);
      throw new Error('Failed to process Google login');
    }
  }

  /**
   * Generate JWT tokens for OAuth user
   * @param user User object
   * @returns Object containing access and refresh tokens
   */
  generateOAuthToken(user: any): { accessToken: string; refreshToken: string } {
    // Convert user to ApiUserType format
    const apiUser: ApiUserType = {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password || 'dummy', // OAuth users might not have password
      membership_tier: user.membership_tier,
      membership_expires_at: user.membership_expires_at?.toISOString(),
      email_verified: user.email_verified,
      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString()
    };

    return this.generateTokenPair(apiUser);
  }
}

export default new AuthService();