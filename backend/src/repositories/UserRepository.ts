import { Op } from 'sequelize';
import { User } from '../models';
import { MembershipTier, UserRole } from '../types/models';
import BaseRepository from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.findOne({
        where: { email },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await this.findOne({
        where: { google_id: googleId },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    email: string;
    name: string;
    password?: string | null;
    membership_tier?: MembershipTier;
    email_verified?: boolean;
    google_id?: string | null;
    provider?: 'email' | 'google' | null;
    profile_picture?: string | null;
    is_oauth_user?: boolean;
    role?: UserRole;
  }): Promise<User> {
    try {
      return await this.create({
        ...userData,
        membership_tier: userData.membership_tier || MembershipTier.FREE,
        email_verified: userData.email_verified || false,
        role: userData.role || UserRole.USER,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, userData: {
    name?: string;
    email?: string;
  }): Promise<User | null> {
    try {
      return await this.updateById(id, userData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    try {
      const [affectedCount] = await this.update(
        { password: hashedPassword },
        { where: { id } }
      );
      return affectedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<boolean> {
    try {
      const [affectedCount] = await this.update(
        { email_verified: true },
        { where: { id } }
      );
      return affectedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update membership tier
   */
  async updateMembershipTier(
    id: string,
    tier: MembershipTier,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      const updateData: any = { membership_tier: tier };
      if (expiresAt) {
        updateData.membership_expires_at = expiresAt;
      }

      const [affectedCount] = await this.update(updateData, { where: { id } });
      return affectedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      return await this.exists({
        where: { email },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users by membership tier
   */
  async getByMembershipTier(tier: MembershipTier): Promise<User[]> {
    try {
      return await this.findAll({
        where: { membership_tier: tier },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users with expired memberships
   */
  async getWithExpiredMemberships(): Promise<User[]> {
    try {
      return await this.findAll({
        where: {
          membership_tier: {
            [Op.ne]: MembershipTier.FREE,
          },
          membership_expires_at: {
            [Op.lt]: new Date(),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new UserRepository();