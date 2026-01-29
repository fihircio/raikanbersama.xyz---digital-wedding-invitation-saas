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
   * Find an invitation by ID with all associations
   */
  async findById(id: string): Promise<Invitation | null> {
    try {
      return await this.findOne({
        where: { id },
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
   * Update an invitation with association synchronization
   */
  async updateInvitation(id: string, invitationData: any): Promise<Invitation | null> {
    const transaction = await this.model.sequelize!.transaction();

    try {
      // 1. Extract associations from update data
      const { gallery, itinerary, contacts, ...invitationFields } = invitationData;

      // 2. Update the main invitation record
      await this.model.update(invitationFields, {
        where: { id },
        transaction
      });

      // 3. Sync Gallery (expecting string[] of URLs)
      if (gallery && Array.isArray(gallery)) {
        // Delete items from DB that are not in the provided gallery array
        await Gallery.destroy({
          where: {
            invitation_id: id,
            image_url: { [Op.notIn]: gallery }
          },
          transaction
        });

        // Upsert items and update display order
        for (let i = 0; i < gallery.length; i++) {
          const imageUrl = gallery[i];
          const [item, created] = await Gallery.findOrCreate({
            where: { invitation_id: id, image_url: imageUrl },
            defaults: { invitation_id: id, image_url: imageUrl, display_order: i },
            transaction
          });

          if (!created) {
            await item.update({ display_order: i }, { transaction });
          }
        }
      }

      // 4. Sync Itinerary
      if (itinerary && Array.isArray(itinerary)) {
        const providedIds = itinerary.filter(item => item.id && item.id.length > 20).map(item => item.id);

        // Delete items not in provided list
        await ItineraryItem.destroy({
          where: {
            invitation_id: id,
            id: { [Op.notIn]: providedIds }
          },
          transaction
        });

        // Add or Update items
        for (const item of itinerary) {
          const isNew = !item.id || item.id.length < 20 || !item.id.includes('-');

          if (isNew) {
            await ItineraryItem.create({
              invitation_id: id,
              time: item.time,
              activity: item.activity
            }, { transaction });
          } else {
            await ItineraryItem.update({
              time: item.time,
              activity: item.activity
            }, {
              where: { id: item.id, invitation_id: id },
              transaction
            });
          }
        }
      }

      // 5. Sync Contacts
      if (contacts && Array.isArray(contacts)) {
        const providedIds = contacts.filter(person => person.id && person.id.length > 20).map(person => person.id);

        // Delete items not in provided list
        await ContactPerson.destroy({
          where: {
            invitation_id: id,
            id: { [Op.notIn]: providedIds }
          },
          transaction
        });

        // Add or Update items
        for (const person of contacts) {
          const isNew = !person.id || person.id.length < 20 || !person.id.includes('-');

          if (isNew) {
            await ContactPerson.create({
              invitation_id: id,
              name: person.name,
              relation: person.relation,
              phone: person.phone
            }, { transaction });
          } else {
            await ContactPerson.update({
              name: person.name,
              relation: person.relation,
              phone: person.phone
            }, {
              where: { id: person.id, invitation_id: id },
              transaction
            });
          }
        }
      }

      await transaction.commit();

      // Return refreshed invitation with all associations
      return await this.findById(id);
    } catch (error) {
      await transaction.rollback();
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