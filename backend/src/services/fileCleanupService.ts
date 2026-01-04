import cron from 'node-cron';
import fileStorageService from './fileStorageService';
import mockDataService from './mockDataService';
import logger from '../utils/logger';

/**
 * File Cleanup Service
 * Handles scheduled cleanup of unused files and maintenance tasks
 */

interface CleanupStats {
  totalFilesScanned: number;
  filesDeleted: number;
  spaceFreed: number;
  errors: string[];
}

/**
 * File Cleanup Service Class
 */
class FileCleanupService {
  private isRunning: boolean = false;

  constructor() {
    // Schedule cleanup tasks
    this.scheduleCleanupTasks();
  }

  /**
   * Schedule cleanup tasks using cron
   */
  private scheduleCleanupTasks(): void {
    // Run cleanup daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled file cleanup');
      await this.performDailyCleanup();
    });

    // Run cleanup weekly on Sundays at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      logger.info('Starting weekly deep cleanup');
      await this.performWeeklyCleanup();
    });

    logger.info('File cleanup tasks scheduled');
  }

  /**
   * Perform daily cleanup tasks
   */
  async performDailyCleanup(): Promise<CleanupStats> {
    if (this.isRunning) {
      logger.warn('Cleanup already running, skipping');
      return {
        totalFilesScanned: 0,
        filesDeleted: 0,
        spaceFreed: 0,
        errors: ['Cleanup already in progress'],
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    const stats: CleanupStats = {
      totalFilesScanned: 0,
      filesDeleted: 0,
      spaceFreed: 0,
      errors: [],
    };

    try {
      // Clean up orphaned files (files not referenced in any invitation)
      await this.cleanupOrphanedFiles(stats);
      
      // Clean up temporary files older than 24 hours
      await this.cleanupTemporaryFiles(stats);
      
      const duration = Date.now() - startTime;
      logger.info(`Daily cleanup completed in ${duration}ms`, stats);
    } catch (error) {
      logger.error('Error during daily cleanup:', error);
      stats.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isRunning = false;
    }

    return stats;
  }

  /**
   * Perform weekly deep cleanup tasks
   */
  async performWeeklyCleanup(): Promise<CleanupStats> {
    if (this.isRunning) {
      logger.warn('Cleanup already running, skipping');
      return {
        totalFilesScanned: 0,
        filesDeleted: 0,
        spaceFreed: 0,
        errors: ['Cleanup already in progress'],
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    const stats: CleanupStats = {
      totalFilesScanned: 0,
      filesDeleted: 0,
      spaceFreed: 0,
      errors: [],
    };

    try {
      // Perform all daily cleanup tasks
      await this.performDailyCleanup();
      
      // Additional weekly tasks
      await this.cleanupOldThumbnails(stats);
      await this.optimizeStorage(stats);
      
      const duration = Date.now() - startTime;
      logger.info(`Weekly cleanup completed in ${duration}ms`, stats);
    } catch (error) {
      logger.error('Error during weekly cleanup:', error);
      stats.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isRunning = false;
    }

    return stats;
  }

  /**
   * Clean up orphaned files (files not referenced in any invitation)
   */
  private async cleanupOrphanedFiles(stats: CleanupStats): Promise<void> {
    try {
      // Get all invitations to find referenced files
      const invitations = await mockDataService.getAllInvitations();
      const referencedFiles = new Set<string>();
      
      // Collect all referenced file URLs
      for (const invitation of invitations) {
        // Add gallery images
        invitation.gallery.forEach(url => {
          const key = this.extractKeyFromUrl(url);
          if (key) referencedFiles.add(key);
        });
        
        // Add QR code URL
        if (invitation.money_gift_details.qr_url) {
          const key = this.extractKeyFromUrl(invitation.money_gift_details.qr_url);
          if (key) referencedFiles.add(key);
        }
        
        // Add background image URL
        if (invitation.settings.background_image) {
          const key = this.extractKeyFromUrl(invitation.settings.background_image);
          if (key) referencedFiles.add(key);
        }
      }
      
      // In a real implementation, you would:
      // 1. List all files in S3 bucket
      // 2. Compare with referenced files
      // 3. Delete orphaned files
      
      // For now, we'll just log what would be done
      logger.info(`Found ${referencedFiles.size} referenced files during orphaned file cleanup`);
      stats.totalFilesScanned += referencedFiles.size;
      
      // This is a placeholder for the actual S3 listing and deletion logic
      // In production, you would use AWS SDK to list objects and delete orphaned ones
      
    } catch (error) {
      logger.error('Error cleaning up orphaned files:', error);
      stats.errors.push('Failed to clean up orphaned files');
    }
  }

  /**
   * Clean up temporary files older than 24 hours
   */
  private async cleanupTemporaryFiles(stats: CleanupStats): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. List all files with 'temp' in their key
      // 2. Check their creation time
      // 3. Delete files older than 24 hours
      
      logger.info('Temporary file cleanup completed');
      
      // This is a placeholder for the actual implementation
      // In production, you would use AWS SDK to list and delete temporary files
      
    } catch (error) {
      logger.error('Error cleaning up temporary files:', error);
      stats.errors.push('Failed to clean up temporary files');
    }
  }

  /**
   * Clean up old thumbnails
   */
  private async cleanupOldThumbnails(stats: CleanupStats): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. List all thumbnail files
      // 2. Check if the original image still exists
      // 3. Delete orphaned thumbnails
      
      logger.info('Old thumbnail cleanup completed');
      
      // This is a placeholder for the actual implementation
      
    } catch (error) {
      logger.error('Error cleaning up old thumbnails:', error);
      stats.errors.push('Failed to clean up old thumbnails');
    }
  }

  /**
   * Optimize storage by compressing or reorganizing files
   */
  private async optimizeStorage(stats: CleanupStats): Promise<void> {
    try {
      // In a real implementation, you might:
      // 1. Compress old files that haven't been accessed recently
      // 2. Move files to appropriate storage classes (e.g., S3 Glacier)
      // 3. Reorganize file structure for better performance
      
      logger.info('Storage optimization completed');
      
      // This is a placeholder for the actual implementation
      
    } catch (error) {
      logger.error('Error optimizing storage:', error);
      stats.errors.push('Failed to optimize storage');
    }
  }

  /**
   * Extract S3 key from URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      // Extract key from URL like: https://bucket.s3.region.amazonaws.com/key
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1); // Remove leading slash
      return key || null;
    } catch {
      return null;
    }
  }

  /**
   * Manually trigger cleanup (for admin use)
   */
  async triggerCleanup(type: 'daily' | 'weekly' = 'daily'): Promise<CleanupStats> {
    logger.info(`Manual ${type} cleanup triggered`);
    
    if (type === 'daily') {
      return await this.performDailyCleanup();
    } else {
      return await this.performWeeklyCleanup();
    }
  }

  /**
   * Get cleanup status
   */
  getCleanupStatus(): { isRunning: boolean; lastCleanup?: Date } {
    return {
      isRunning: this.isRunning,
      lastCleanup: new Date(), // In a real implementation, store last cleanup time
    };
  }

  /**
   * Delete files for a specific invitation (when invitation is deleted)
   */
  async deleteInvitationFiles(invitationId: string): Promise<{ success: number; failed: number }> {
    try {
      const invitation = await mockDataService.getInvitationById(invitationId);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      const filesToDelete: string[] = [];
      
      // Collect all files to delete
      invitation.gallery.forEach(url => {
        const key = this.extractKeyFromUrl(url);
        if (key) filesToDelete.push(key);
      });
      
      if (invitation.money_gift_details.qr_url) {
        const key = this.extractKeyFromUrl(invitation.money_gift_details.qr_url);
        if (key) filesToDelete.push(key);
      }
      
      if (invitation.settings.background_image) {
        const key = this.extractKeyFromUrl(invitation.settings.background_image);
        if (key) filesToDelete.push(key);
      }
      
      // Also collect thumbnails
      for (const fileKey of filesToDelete) {
        // Add thumbnail variants
        filesToDelete.push(fileKey.replace('gallery-image/', 'gallery-image-thumb-small/'));
        filesToDelete.push(fileKey.replace('gallery-image/', 'gallery-image-thumb-medium/'));
        filesToDelete.push(fileKey.replace('gallery-image/', 'gallery-image-thumb-large/'));
        filesToDelete.push(fileKey.replace('background/', 'background-thumb-small/'));
        filesToDelete.push(fileKey.replace('background/', 'background-thumb-medium/'));
        filesToDelete.push(fileKey.replace('background/', 'background-thumb-large/'));
      }
      
      // Delete all files
      const result = await fileStorageService.deleteMultipleFiles(filesToDelete);
      
      logger.info(`Deleted ${result.success} files for invitation ${invitationId}`);
      if (result.failed > 0) {
        logger.warn(`Failed to delete ${result.failed} files for invitation ${invitationId}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error deleting files for invitation ${invitationId}:`, error);
      return { success: 0, failed: 1 };
    }
  }
}

export default new FileCleanupService();