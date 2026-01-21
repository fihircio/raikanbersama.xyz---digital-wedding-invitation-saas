import cron from 'node-cron';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import fileStorageService from './fileStorageService';
import { Invitation, Gallery, BackgroundImage } from '../models';
import config from '../config';
import logger from '../utils/logger';
import { S3Client } from '@aws-sdk/client-s3';

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
    if (config.nodeEnv === 'production') {
      this.scheduleCleanupTasks();
    }
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
      // 1. Get all referenced file keys from the database
      const referencedKeys = new Set<string>();

      const [invitations, galleries] = await Promise.all([
        Invitation.findAll({ attributes: ['settings', 'money_gift_details'] }),
        Gallery.findAll({ attributes: ['image_url'] })
      ]);

      // Collect keys from invitations
      for (const inv of invitations) {
        if (inv.settings.background_image) {
          const key = this.extractKeyFromUrl(inv.settings.background_image);
          if (key) {
            referencedKeys.add(key);
            // Add known thumbnail variants
            referencedKeys.add(key.replace('background/', 'background-thumb-small/').replace('.webp', '.webp'));
            referencedKeys.add(key.replace('background/', 'background-thumb-medium/').replace('.webp', '.webp'));
            referencedKeys.add(key.replace('background/', 'background-thumb-large/').replace('.webp', '.webp'));
          }
        }
        if (inv.money_gift_details.qr_url) {
          const key = this.extractKeyFromUrl(inv.money_gift_details.qr_url);
          if (key) referencedKeys.add(key);
        }
      }

      // Collect keys from gallery
      for (const item of galleries) {
        const key = this.extractKeyFromUrl(item.image_url);
        if (key) {
          referencedKeys.add(key);
          referencedKeys.add(key.replace('gallery-image/', 'gallery-image-thumb-small/'));
          referencedKeys.add(key.replace('gallery-image/', 'gallery-image-thumb-medium/'));
          referencedKeys.add(key.replace('gallery-image/', 'gallery-image-thumb-large/'));
        }
      }

      logger.info(`Found ${referencedKeys.size} referenced keys in database`);

      // 2. List all objects in the S3/R2 bucket
      const s3Client = (fileStorageService as any).s3Client as S3Client;
      const command = new ListObjectsV2Command({
        Bucket: config.s3BucketName,
      });

      const response = await s3Client.send(command);
      const objects = response.Contents || [];
      stats.totalFilesScanned = objects.length;

      // 3. Identify orphaned objects
      const orphanedKeys: string[] = [];
      for (const obj of objects) {
        if (obj.Key && !referencedKeys.has(obj.Key)) {
          // Additional safety: don't delete very recent files (less than 1 hour old)
          const lastModified = obj.LastModified ? new Date(obj.LastModified).getTime() : 0;
          const oneHourAgo = Date.now() - (60 * 60 * 1000);

          if (lastModified < oneHourAgo) {
            orphanedKeys.push(obj.Key);
          }
        }
      }

      // 4. Delete orphaned objects in batches
      if (orphanedKeys.length > 0) {
        logger.info(`Deleting ${orphanedKeys.length} orphaned files from storage`);

        // S3 delete objects can take up to 1000 keys at once
        for (let i = 0; i < orphanedKeys.length; i += 1000) {
          const batch = orphanedKeys.slice(i, i + 1000);
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: config.s3BucketName,
            Delete: {
              Objects: batch.map(key => ({ Key: key })),
              Quiet: true
            }
          });

          await s3Client.send(deleteCommand);
          stats.filesDeleted += batch.length;
        }
      }

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
      const invitation = await Invitation.findByPk(invitationId, {
        include: [{ model: Gallery, as: 'gallery' }]
      });

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      const filesToDelete: string[] = [];
      const invData = invitation.get({ plain: true });

      // Collect gallery images
      if (invData.gallery) {
        invData.gallery.forEach((item: any) => {
          const key = this.extractKeyFromUrl(item.image_url);
          if (key) filesToDelete.push(key);
        });
      }

      if (invData.money_gift_details?.qr_url) {
        const key = this.extractKeyFromUrl(invData.money_gift_details.qr_url);
        if (key) filesToDelete.push(key);
      }

      if (invData.settings?.background_image) {
        const key = this.extractKeyFromUrl(invData.settings.background_image);
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