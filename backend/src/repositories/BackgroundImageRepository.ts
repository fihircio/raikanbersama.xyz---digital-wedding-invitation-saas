import { Op } from 'sequelize';
import { BackgroundImage } from '../models';
import BaseRepository from './BaseRepository';

export class BackgroundImageRepository extends BaseRepository<BackgroundImage> {
  constructor() {
    super(BackgroundImage);
  }

  /**
   * Find background images by category
   */
  async findByCategory(category: string): Promise<BackgroundImage[]> {
    try {
      return await this.findAll({
        where: { category },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get premium background images
   */
  async getPremiumBackgrounds(): Promise<BackgroundImage[]> {
    try {
      return await this.findAll({
        where: { isPremium: true },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get free background images
   */
  async getFreeBackgrounds(): Promise<BackgroundImage[]> {
    try {
      return await this.findAll({
        where: { isPremium: false },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search background images by tags
   */
  async findByTags(tags: string[]): Promise<BackgroundImage[]> {
    try {
      return await this.findAll({
        where: {
          tags: {
            [Op.overlap]: tags,
          },
        },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get background images with pagination
   */
  async getBackgroundsWithPagination(
    page: number,
    limit: number,
    category?: string,
    isPremium?: boolean
  ): Promise<{ rows: BackgroundImage[]; count: number }> {
    try {
      const whereCondition: any = {};
      
      if (category) {
        whereCondition.category = category;
      }
      
      if (isPremium !== undefined) {
        whereCondition.isPremium = isPremium;
      }

      return await this.findAndCountAll({
        where: whereCondition,
        limit,
        offset: (page - 1) * limit,
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get popular background images
   */
  async getPopularBackgrounds(limit: number = 10): Promise<BackgroundImage[]> {
    try {
      return await this.findAll({
        where: { category: 'popular' },
        limit,
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const backgrounds = await this.findAll({
        attributes: ['category'],
        group: ['category'],
      });
      
      return backgrounds.map(bg => bg.category);
    } catch (error) {
      throw error;
    }
  }
}

export default new BackgroundImageRepository();