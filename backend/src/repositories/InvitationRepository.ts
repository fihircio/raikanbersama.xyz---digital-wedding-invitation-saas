import { Op, WhereOptions } from 'sequelize';
import { Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery } from '../models';
import BaseRepository from './BaseRepository';

export class InvitationRepository extends BaseRepository<Invitation> {
  constructor() {
    super(Invitation);
  }

  /**
   * Find an invitation by slug
   */
  async findBySlug(slug: string): Promise<Invitation | null> {
    try {
      return await this.findOne({
        where: { slug },
        include: [
          {
            model: RSVP,
            as: 'rsvps',
          },
          {
            model: GuestWish,
            as: 'guestWishes',
            order: [['created_at', 'DESC']],
          },
          {
            model: ItineraryItem,
            as: 'itinerary',
            order: [['time', 'ASC']],
          },
          {
            model: ContactPerson,
            as: 'contacts',
          },
          {
            model: Gallery,
            as: 'gallery',
            order: [['display_order', 'ASC']],
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find invitations by user ID
   */
  async findByUserId(userId: string): Promise<Invitation[]> {
    try {
      return await this.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new invitation
   */
  async createInvitation(invitationData: {
    user_id: string;
    slug: string;
    template_id: string;
    event_type: string;
    bride_name: string;
    groom_name: string;
    host_names: string;
    event_date: Date;
    start_time: string;
    end_time: string;
    location_name: string;
    address: string;
    google_maps_url: string;
    waze_url: string;
    settings?: any;
    money_gift_details?: any;
  }): Promise<Invitation> {
    try {
      return await this.create({
        ...invitationData,
        views: 0,
        settings: invitationData.settings || {},
        money_gift_details: invitationData.money_gift_details || {
          enabled: false,
          bank_name: '',
          account_no: '',
          account_holder: '',
          qr_url: ''
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an invitation
   */
  async updateInvitation(id: string, invitationData: Partial<Invitation>): Promise<Invitation | null> {
    try {
      return await this.updateById(id, invitationData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<boolean> {
    try {
      const [affectedCount] = await this.update(
        { views: Invitation.sequelize!.literal('views + 1') },
        { where: { id } }
      );
      return affectedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const whereCondition: WhereOptions = { slug };
      if (excludeId) {
        whereCondition.id = { [Op.ne]: excludeId };
      }
      
      return await this.exists({
        where: whereCondition,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get published invitations
   */
  async getPublishedInvitations(): Promise<Invitation[]> {
    try {
      return await this.findAll({
        where: {
          settings: {
            is_published: true,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get invitations by event date range
   */
  async getByEventDateRange(startDate: Date, endDate: Date): Promise<Invitation[]> {
    try {
      return await this.findAll({
        where: {
          event_date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['event_date', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search invitations
   */
  async searchInvitations(query: string, userId?: string): Promise<Invitation[]> {
    try {
      const whereCondition: any = {
        [Op.or]: [
          { bride_name: { [Op.iLike]: `%${query}%` } },
          { groom_name: { [Op.iLike]: `%${query}%` } },
          { slug: { [Op.iLike]: `%${query}%` } },
          { event_type: { [Op.iLike]: `%${query}%` } },
        ],
      };

      if (userId) {
        whereCondition.user_id = userId;
      }

      return await this.findAll({
        where: whereCondition,
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get invitations with pagination
   */
  async getInvitationsWithPagination(
    page: number,
    limit: number,
    userId?: string
  ): Promise<{ rows: Invitation[]; count: number }> {
    try {
      const whereCondition = userId ? { user_id: userId } : {};

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
}

export default new InvitationRepository();