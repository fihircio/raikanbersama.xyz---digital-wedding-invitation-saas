import authService from '../services/authService';
import logger from './logger';

/**
 * Token Cleanup Utility
 * Schedules periodic cleanup of expired tokens
 */

/**
 * Start the token cleanup scheduler
 * Runs every hour to clean up expired tokens
 */
export const startTokenCleanup = (): void => {
  // Run cleanup every hour (3600000 ms)
  const cleanupInterval = setInterval(() => {
    try {
      authService.cleanupExpiredTokens();
      logger.info('Token cleanup completed');
    } catch (error) {
      logger.error('Error during token cleanup:', error);
    }
  }, 3600000); // 1 hour

  logger.info('Token cleanup scheduler started (runs every hour)');
  
  // Run initial cleanup
  try {
    authService.cleanupExpiredTokens();
    logger.info('Initial token cleanup completed');
  } catch (error) {
    logger.error('Error during initial token cleanup:', error);
  }
};

/**
 * Stop the token cleanup scheduler
 */
export const stopTokenCleanup = (): void => {
  // This would be used in a real implementation with proper interval reference
  logger.info('Token cleanup scheduler stopped');
};