import { ItineraryItem } from '../models';
import BaseRepository from './BaseRepository';

export class ItineraryRepository extends BaseRepository<ItineraryItem> {
  constructor() {
    super(ItineraryItem);
  }

  /**
   * Find itinerary items by invitation ID
   */
  async findByInvitationId(invitationId: string): Promise<ItineraryItem[]> {
    try {
      return await this.findAll({
        where: { invitation_id: invitationId },
        order: [['time', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new itinerary item
   */
  async createItineraryItem(itemData: {
    invitation_id: string;
    time: string;
    activity: string;
  }): Promise<ItineraryItem> {
    try {
      return await this.create(itemData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an itinerary item
   */
  async updateItineraryItem(id: string, itemData: Partial<ItineraryItem>): Promise<ItineraryItem | null> {
    try {
      return await this.updateById(id, itemData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete an itinerary item
   */
  async deleteItineraryItem(id: string): Promise<boolean> {
    try {
      return await this.deleteById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reorder itinerary items
   */
  async reorderItems(invitationId: string, itemIds: string[]): Promise<boolean> {
    try {
      const transaction = await ItineraryItem.sequelize!.transaction();
      
      try {
        for (let i = 0; i < itemIds.length; i++) {
          await this.update(
            { time: `order_${i}` }, // Temporary value to maintain order
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
}

export default new ItineraryRepository();