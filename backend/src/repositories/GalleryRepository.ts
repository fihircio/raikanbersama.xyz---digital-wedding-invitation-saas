import { Gallery } from '../models';
import BaseRepository from './BaseRepository';

export class GalleryRepository extends BaseRepository<Gallery> {
  constructor() {
    super(Gallery);
  }

  /**
   * Find gallery items by invitation ID
   */
  async findByInvitationId(invitationId: string): Promise<Gallery[]> {
    try {
      return await this.findAll({
        where: { invitation_id: invitationId },
        order: [['display_order', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new gallery item
   */
  async createGalleryItem(itemData: {
    invitation_id: string;
    image_url: string;
    caption?: string;
    display_order?: number;
  }): Promise<Gallery> {
    try {
      return await this.create({
        ...itemData,
        display_order: itemData.display_order || 0,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a gallery item
   */
  async updateGalleryItem(id: string, itemData: Partial<Gallery>): Promise<Gallery | null> {
    try {
      return await this.updateById(id, itemData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a gallery item
   */
  async deleteGalleryItem(id: string): Promise<boolean> {
    try {
      return await this.deleteById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reorder gallery items
   */
  async reorderItems(invitationId: string, itemIds: string[]): Promise<boolean> {
    try {
      const transaction = await Gallery.sequelize!.transaction();
      
      try {
        for (let i = 0; i < itemIds.length; i++) {
          await this.update(
            { display_order: i },
            { 
              where: { 
                id: itemIds[i],
                invitation_id: invitationId 
              },
              transaction 
            }
          );
        }
        
        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count gallery items for an invitation
   */
  async countByInvitationId(invitationId: string): Promise<number> {
    try {
      return await this.count({
        where: { invitation_id: invitationId },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get gallery items with pagination
   */
  async getGalleryWithPagination(
    page: number,
    limit: number,
    invitationId?: string
  ): Promise<{ rows: Gallery[]; count: number }> {
    try {
      const whereCondition = invitationId ? { invitation_id: invitationId } : {};

      return await this.findAndCountAll({
        where: whereCondition,
        limit,
        offset: (page - 1) * limit,
        order: [['display_order', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new GalleryRepository();