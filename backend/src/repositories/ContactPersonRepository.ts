import { ContactPerson } from '../models';
import BaseRepository from './BaseRepository';

export class ContactPersonRepository extends BaseRepository<ContactPerson> {
  constructor() {
    super(ContactPerson);
  }

  /**
   * Find contact persons by invitation ID
   */
  async findByInvitationId(invitationId: string): Promise<ContactPerson[]> {
    try {
      return await this.findAll({
        where: { invitation_id: invitationId },
        order: [['id', 'ASC']],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new contact person
   */
  async createContactPerson(personData: {
    invitation_id: string;
    name: string;
    relation: string;
    phone: string;
  }): Promise<ContactPerson> {
    try {
      return await this.create(personData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a contact person
   */
  async updateContactPerson(id: string, personData: Partial<ContactPerson>): Promise<ContactPerson | null> {
    try {
      return await this.updateById(id, personData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a contact person
   */
  async deleteContactPerson(id: string): Promise<boolean> {
    try {
      return await this.deleteById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count contact persons for an invitation
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

export default new ContactPersonRepository();