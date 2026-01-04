import { GuestWish } from '../models';
import BaseRepository from './BaseRepository';

export class GuestWishRepository extends BaseRepository<GuestWish> {
  constructor() {
    super(GuestWish);
  }

  /**
   * Find guest wishes by invitation ID
   */
  async findByInvitationId(invitationId: string): Promise<GuestWish[]> {
    try {
      return await this.findAll({
        where: { invitation_id: invitationId },
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new guest wish
   */
  async createGuestWish(wishData: {
    invitation_id: string;
    name: string;
    message: string;
  }): Promise<GuestWish> {
    try {
      return await this.create(wishData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get guest wishes with pagination
   */
  async getGuestWishesWithPagination(
    page: number,
    limit: number,
    invitationId?: string
  ): Promise<{ rows: GuestWish[]; count: number }> {
    try {
      const whereCondition = invitationId ? { invitation_id: invitationId } : {};

      return await this.findAndCountAll({
        where: whereCondition,
        limit,
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent guest wishes for an invitation
   */
  async getRecentWishes(invitationId: string, limit: number = 5): Promise<GuestWish[]> {
    try {
      return await this.findAll({
        where: { invitation_id: invitationId },
        limit,
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count guest wishes for an invitation
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
}

export default new GuestWishRepository();