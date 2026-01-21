import { User, Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery } from '../models';
import { MembershipTier } from '../types/models';
import {
  userRepository,
  invitationRepository,
  rsvpRepository,
  guestWishRepository,
  itineraryRepository,
  contactPersonRepository,
  galleryRepository
} from '../repositories';
import { convertUserToApi } from '../utils/typeConversion';

/**
 * Database Service
 * Replaces the mock data service with real database operations
 */
class DatabaseService {
  // User operations
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) return null;

    // Convert to API format
    return convertUserToApi(user);
  }

  async getUserByEmail(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) return null;

    // Convert to API format
    return convertUserToApi(user);
  }

  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    membership_tier?: MembershipTier;
    email_verified?: boolean;
  }) {
    const user = await userRepository.createUser(userData);

    // Convert to API format
    return convertUserToApi(user);
  }

  async updateUser(id: string, userData: Partial<User>) {
    const user = await userRepository.updateProfile(id, userData);
    if (!user) return null;

    // Convert to API format
    return convertUserToApi(user);
  }

  // Invitation operations
  async getAllInvitations() {
    return await invitationRepository.findAll();
  }

  async getInvitationById(id: string) {
    return await invitationRepository.findById(id);
  }

  async getInvitationBySlug(slug: string) {
    return await invitationRepository.findBySlug(slug);
  }

  async getInvitationsByUserId(userId: string) {
    return await invitationRepository.findByUserId(userId);
  }

  async createInvitation(invitationData: any) {
    return await invitationRepository.createInvitation(invitationData);
  }

  async updateInvitation(id: string, invitationData: Partial<Invitation>) {
    return await invitationRepository.updateInvitation(id, invitationData);
  }

  async deleteInvitation(id: string) {
    return await invitationRepository.deleteById(id);
  }

  async incrementInvitationViews(id: string) {
    return await invitationRepository.incrementViews(id);
  }

  // RSVP operations
  async getAllRSVPs() {
    return await rsvpRepository.findAll();
  }

  async getRSVPById(id: string) {
    return await rsvpRepository.findById(id);
  }

  async getRSVPsByInvitationId(invitationId: string) {
    return await rsvpRepository.findByInvitationId(invitationId);
  }

  async createRSVP(rsvpData: any) {
    return await rsvpRepository.createRSVP(rsvpData);
  }

  async updateRSVP(id: string, rsvpData: Partial<RSVP>) {
    return await rsvpRepository.updateRSVP(id, rsvpData);
  }

  async deleteRSVP(id: string) {
    return await rsvpRepository.deleteById(id);
  }

  // Guest Wish operations
  async getAllGuestWishes() {
    return await guestWishRepository.findAll();
  }

  async getGuestWishById(id: string) {
    return await guestWishRepository.findById(id);
  }

  async getGuestWishesByInvitationId(invitationId: string) {
    return await guestWishRepository.findByInvitationId(invitationId);
  }

  async createGuestWish(wishData: {
    invitation_id: string;
    name: string;
    message: string;
  }) {
    return await guestWishRepository.createGuestWish(wishData);
  }

  async deleteGuestWish(id: string) {
    return await guestWishRepository.deleteById(id);
  }

  // Itinerary Item operations
  async getItineraryItemsByInvitationId(invitationId: string) {
    return await itineraryRepository.findByInvitationId(invitationId);
  }

  async createItineraryItem(itemData: {
    invitation_id: string;
    time: string;
    activity: string;
  }) {
    return await itineraryRepository.createItineraryItem(itemData);
  }

  async updateItineraryItem(id: string, itemData: Partial<ItineraryItem>) {
    return await itineraryRepository.updateItineraryItem(id, itemData);
  }

  async deleteItineraryItem(id: string) {
    return await itineraryRepository.deleteItineraryItem(id);
  }

  // Contact Person operations
  async getContactPersonsByInvitationId(invitationId: string) {
    return await contactPersonRepository.findByInvitationId(invitationId);
  }

  async createContactPerson(personData: {
    invitation_id: string;
    name: string;
    relation: string;
    phone: string;
  }) {
    return await contactPersonRepository.createContactPerson(personData);
  }

  async updateContactPerson(id: string, personData: Partial<ContactPerson>) {
    return await contactPersonRepository.updateContactPerson(id, personData);
  }

  async deleteContactPerson(id: string) {
    return await contactPersonRepository.deleteContactPerson(id);
  }

  // Gallery operations
  async getGalleryByInvitationId(invitationId: string) {
    return await galleryRepository.findByInvitationId(invitationId);
  }

  async addGalleryImage(galleryData: { invitation_id: string; image_url: string; caption?: string; display_order?: number }) {
    return await galleryRepository.createGalleryItem(galleryData);
  }

  async deleteGalleryImage(id: string) {
    return await galleryRepository.deleteById(id);
  }

  async getGalleryCount(invitationId: string) {
    return await galleryRepository.countByInvitationId(invitationId);
  }

  async updateGallery(invitationId: string, itemIds: string[]) {
    return await galleryRepository.reorderItems(invitationId, itemIds);
  }
}

export default new DatabaseService();