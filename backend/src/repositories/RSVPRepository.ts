import { RSVP } from '../models';
import BaseRepository from './BaseRepository';

export class RSVPRepository extends BaseRepository<RSVP> {
  constructor() {
    super(RSVP);
  }

  /**
   * Find RSVPs by invitation ID
   */
  async findByInvitationId(invitationId: string): Promise<RSVP[]> {
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
   * Create a new RSVP
   */
  async createRSVP(rsvpData: {
    invitation_id: string;
    guest_name: string;
    pax: number;
    is_attending: boolean;
    phone_number: string;
    message?: string;
  }): Promise<RSVP> {
    try {
      return await this.create(rsvpData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an RSVP
   */
  async updateRSVP(id: string, rsvpData: Partial<RSVP>): Promise<RSVP | null> {
    try {
      return await this.updateById(id, rsvpData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get RSVP statistics for an invitation
   */
  async getRSVPStats(invitationId: string): Promise<{
    total: number;
    attending: number;
    notAttending: number;
    totalPax: number;
  }> {
    try {
      const rsvps = await this.findByInvitationId(invitationId);
      
      const total = rsvps.length;
      const attending = rsvps.filter(r => r.is_attending).length;
      const notAttending = rsvps.filter(r => !r.is_attending).length;
      const totalPax = rsvps
        .filter(r => r.is_attending)
        .reduce((sum, r) => sum + r.pax, 0);

      return {
        total,
        attending,
        notAttending,
        totalPax,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get RSVPs by attendance status
   */
  async getByAttendanceStatus(
    invitationId: string,
    isAttending: boolean
  ): Promise<RSVP[]> {
    try {
      return await this.findAll({
        where: {
          invitation_id: invitationId,
          is_attending: isAttending,
        },
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get RSVPs with pagination
   */
  async getRSVPsWithPagination(
    page: number,
    limit: number,
    invitationId?: string
  ): Promise<{ rows: RSVP[]; count: number }> {
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
}

export default new RSVPRepository();