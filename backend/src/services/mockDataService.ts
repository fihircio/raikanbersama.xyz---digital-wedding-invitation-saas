import { 
  Invitation, 
  RSVP, 
  GuestWish, 
  ItineraryItem, 
  ContactPerson, 
  BackgroundImage,
  MembershipTier
} from '../types/models';
import { User } from '../types/api';

// Mock constants (copied from root constants.ts)
const MOCK_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    user_id: 'user-1',
    slug: 'adam-hawa',
    template_id: 'modern-classic',
    event_type: 'Walimatulurus',
    bride_name: 'Siti Hawa',
    groom_name: 'Adam Malik',
    host_names: 'Encik Ahmad & Puan Aminah',
    event_date: '2025-12-25',
    start_time: '11:00',
    end_time: '16:00',
    location_name: 'Dewan Banquet Melati',
    address: 'No 1, Jalan Bunga Raya, 50480 Kuala Lumpur',
    google_maps_url: 'https://maps.google.com',
    waze_url: 'https://waze.com',
    views: 1240,
    wishes: [
      { id: 'w1', name: 'Zulkhairi', message: 'Selamat pengantin baru! Semoga kekal ke anak cucu.', created_at: '2024-05-14T10:00:00Z' },
      { id: 'w2', name: 'Farah & Family', message: 'Alhamdulillah, cantiknya kad! See you there!', created_at: '2024-05-15T08:00:00Z' }
    ],
    itinerary: [
      { id: '1', time: '11:00', activity: 'Ketibaan Tetamu' },
      { id: '2', time: '13:00', activity: 'Ketibaan Pengantin & Jamuan Makan' },
      { id: '3', time: '16:00', activity: 'Majlis Bersurai' }
    ],
    contacts: [
      { id: '1', name: 'Ahmad (Ayah)', relation: 'Bapa', phone: '0123456789' },
      { id: '2', name: 'Aminah (Ibu)', relation: 'Ibu', phone: '0987654321' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=800'
    ],
    settings: {
      music_url: '',
      primary_color: '#8B4513',
      show_countdown: true,
      show_gallery: true,
      is_published: true,
      background_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
      pantun: 'Bunga melati di dalam taman, Harum semerbak di pagi hari; Janji diikat menjadi teman, Ke jinjang pelamin langkah diatur rapi.',
      our_story: 'Kisah kami bermula di sebuah perpustakaan lama...',
      hero_title: 'Raikan Cinta Kami',
      greeting_text: 'Assalammualaikum W.B.T',
      invitation_text: 'Dengan penuh kesyukuran ke hadrat Ilahi, kami menjemput anda ke majlis perkahwinan anakanda kami yang tercinta:',
      story_title: 'Kisah Cinta Kami',
      groom_color: '#8B4513',
      bride_color: '#8B4513',
      host_color: '#4B5563',
      date_color: '#1F2937',
      greeting_color: '#FFFFFF',
      greeting_size: '36',
      hero_color: '#FFFFFF',
      hero_size: '12',
      invitation_color: '#6B7280',
      invitation_size: '14'
    },
    money_gift_details: {
      enabled: true,
      bank_name: 'Maybank',
      account_no: '123456789012',
      account_holder: 'Siti Hawa binti Ahmad',
      qr_url: ''
    }
  }
];

const MOCK_RSVPS: RSVP[] = [
  { id: 'r1', invitation_id: 'inv-1', guest_name: 'Zulkhairi Ali', pax: 2, is_attending: true, phone_number: '0112233445', created_at: '2024-05-10T10:00:00Z' },
  { id: 'r2', invitation_id: 'inv-1', guest_name: 'Nurul Izzah', pax: 4, is_attending: true, phone_number: '0122334455', created_at: '2024-05-11T12:30:00Z' },
  { id: 'r3', invitation_id: 'inv-1', guest_name: 'Farhan Rahman', pax: 0, is_attending: false, phone_number: '0133445566', created_at: '2024-05-12T09:15:00Z', message: 'Maaf, ada urusan kecemasan.' },
  { id: 'r4', invitation_id: 'inv-1', guest_name: 'Siti Sarah', pax: 2, is_attending: true, phone_number: '0144556677', created_at: '2024-05-13T15:45:00Z' },
  { id: 'r5', invitation_id: 'inv-1', guest_name: 'Dr. Ahmad Fauzi', pax: 1, is_attending: true, phone_number: '0155667788', created_at: '2024-05-14T08:20:00Z' },
];

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    password: '$2b$10$example_hashed_password', // This would be a bcrypt hash in production
    membership_tier: MembershipTier.PREMIUM,
    membership_expires_at: '2025-12-31T23:59:59Z',
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'free@example.com',
    name: 'Free User',
    password: '$2b$10$example_hashed_password',
    membership_tier: MembershipTier.FREE,
    email_verified: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock background images
const MOCK_BACKGROUNDS: BackgroundImage[] = [
  {
    id: 'bg-1',
    name: 'Elegant Rose',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200',
    category: 'elegant',
    isPremium: false,
    tags: ['rose', 'elegant', 'romantic']
  },
  {
    id: 'bg-2',
    name: 'Minimalist White',
    url: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=800',
    thumbnail: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=200',
    category: 'minimalist',
    isPremium: false,
    tags: ['minimalist', 'white', 'clean']
  },
  {
    id: 'bg-3',
    name: 'Floral Garden',
    url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
    thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=200',
    category: 'floral',
    isPremium: true,
    tags: ['floral', 'garden', 'nature']
  },
  {
    id: 'bg-4',
    name: 'Classic Gold',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=200',
    category: 'popular',
    isPremium: true,
    tags: ['gold', 'classic', 'luxury']
  }
];

// In-memory storage for dynamic data
let invitations = [...MOCK_INVITATIONS];
let rsvps = [...MOCK_RSVPS];
let guestWishes: GuestWish[] = [];

/**
 * Mock Data Service
 * Simulates database operations using in-memory storage
 */
class MockDataService {
  // User operations
  async getUserById(id: string): Promise<User | null> {
    return MOCK_USERS.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return MOCK_USERS.find(user => user.email === email) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    MOCK_USERS.push(newUser);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const userIndex = MOCK_USERS.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    MOCK_USERS[userIndex] = {
      ...MOCK_USERS[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };
    return MOCK_USERS[userIndex];
  }

  // Invitation operations
  async getAllInvitations(): Promise<Invitation[]> {
    return invitations;
  }

  async getInvitationById(id: string): Promise<Invitation | null> {
    return invitations.find(inv => inv.id === id) || null;
  }

  async getInvitationBySlug(slug: string): Promise<Invitation | null> {
    return invitations.find(inv => inv.slug === slug) || null;
  }

  async getInvitationsByUserId(userId: string): Promise<Invitation[]> {
    return invitations.filter(inv => inv.user_id === userId);
  }

  async createInvitation(invitationData: Omit<Invitation, 'id' | 'views' | 'wishes'>): Promise<Invitation> {
    const newInvitation: Invitation = {
      id: `inv-${Date.now()}`,
      ...invitationData,
      views: 0,
      wishes: []
    };
    invitations.push(newInvitation);
    return newInvitation;
  }

  async updateInvitation(id: string, invitationData: Partial<Invitation>): Promise<Invitation | null> {
    const invitationIndex = invitations.findIndex(inv => inv.id === id);
    if (invitationIndex === -1) return null;

    invitations[invitationIndex] = {
      ...invitations[invitationIndex],
      ...invitationData
    };
    return invitations[invitationIndex];
  }

  async deleteInvitation(id: string): Promise<boolean> {
    const initialLength = invitations.length;
    invitations = invitations.filter(inv => inv.id !== id);
    return invitations.length < initialLength;
  }

  async incrementInvitationViews(id: string): Promise<boolean> {
    const invitation = invitations.find(inv => inv.id === id);
    if (invitation) {
      invitation.views += 1;
      return true;
    }
    return false;
  }

  // RSVP operations
  async getAllRSVPs(): Promise<RSVP[]> {
    return rsvps;
  }

  async getRSVPById(id: string): Promise<RSVP | null> {
    return rsvps.find(rsvp => rsvp.id === id) || null;
  }

  async getRSVPsByInvitationId(invitationId: string): Promise<RSVP[]> {
    return rsvps.filter(rsvp => rsvp.invitation_id === invitationId);
  }

  async createRSVP(rsvpData: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
    const newRSVP: RSVP = {
      id: `rsvp-${Date.now()}`,
      ...rsvpData,
      created_at: new Date().toISOString()
    };
    rsvps.push(newRSVP);
    return newRSVP;
  }

  async updateRSVP(id: string, rsvpData: Partial<RSVP>): Promise<RSVP | null> {
    const rsvpIndex = rsvps.findIndex(rsvp => rsvp.id === id);
    if (rsvpIndex === -1) return null;

    rsvps[rsvpIndex] = {
      ...rsvps[rsvpIndex],
      ...rsvpData
    };
    return rsvps[rsvpIndex];
  }

  async deleteRSVP(id: string): Promise<boolean> {
    const initialLength = rsvps.length;
    rsvps = rsvps.filter(rsvp => rsvp.id !== id);
    return rsvps.length < initialLength;
  }

  // Guest Wish operations
  async getAllGuestWishes(): Promise<GuestWish[]> {
    return guestWishes;
  }

  async getGuestWishById(id: string): Promise<GuestWish | null> {
    return guestWishes.find(wish => wish.id === id) || null;
  }

  async getGuestWishesByInvitationId(invitationId: string): Promise<GuestWish[]> {
    return guestWishes.filter(wish => {
      // Check if wish is part of invitation wishes array
      const invitation = invitations.find(inv => inv.id === invitationId);
      return invitation && invitation.wishes.some(w => w.id === wish.id);
    });
  }

  async createGuestWish(wishData: Omit<GuestWish, 'id' | 'created_at'> & { invitation_id: string }): Promise<GuestWish> {
    const newWish: GuestWish = {
      id: `wish-${Date.now()}`,
      name: wishData.name,
      message: wishData.message,
      created_at: new Date().toISOString()
    };
    
    // Add to global wishes array
    guestWishes.push(newWish);
    
    // Add to invitation's wishes array
    const invitation = invitations.find(inv => inv.id === wishData.invitation_id);
    if (invitation) {
      invitation.wishes.push(newWish);
    }
    
    return newWish;
  }

  async deleteGuestWish(id: string): Promise<boolean> {
    const initialLength = guestWishes.length;
    guestWishes = guestWishes.filter(wish => wish.id !== id);
    
    // Remove from all invitations' wishes arrays
    invitations.forEach(inv => {
      inv.wishes = inv.wishes.filter(wish => wish.id !== id);
    });
    
    return guestWishes.length < initialLength;
  }

  // Itinerary Item operations
  async getItineraryItemsByInvitationId(invitationId: string): Promise<ItineraryItem[]> {
    const invitation = invitations.find(inv => inv.id === invitationId);
    return invitation ? invitation.itinerary : [];
  }

  async createItineraryItem(itemData: Omit<ItineraryItem, 'id'> & { invitation_id: string }): Promise<ItineraryItem> {
    const newItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      time: itemData.time,
      activity: itemData.activity
    };
    
    // Add to invitation's itinerary array
    const invitation = invitations.find(inv => inv.id === itemData.invitation_id);
    if (invitation) {
      invitation.itinerary.push(newItem);
    }
    
    return newItem;
  }

  async updateItineraryItem(id: string, itemData: Partial<ItineraryItem>): Promise<ItineraryItem | null> {
    // Find and update in all invitations' itinerary arrays
    for (const invitation of invitations) {
      const itemIndex = invitation.itinerary.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        invitation.itinerary[itemIndex] = {
          ...invitation.itinerary[itemIndex],
          ...itemData
        };
        return invitation.itinerary[itemIndex];
      }
    }
    return null;
  }

  async deleteItineraryItem(id: string): Promise<boolean> {
    let deleted = false;
    
    // Remove from all invitations' itinerary arrays
    invitations.forEach(inv => {
      const initialLength = inv.itinerary.length;
      inv.itinerary = inv.itinerary.filter(item => item.id !== id);
      if (inv.itinerary.length < initialLength) {
        deleted = true;
      }
    });
    
    return deleted;
  }

  // Contact Person operations
  async getContactPersonsByInvitationId(invitationId: string): Promise<ContactPerson[]> {
    const invitation = invitations.find(inv => inv.id === invitationId);
    return invitation ? invitation.contacts : [];
  }

  async createContactPerson(personData: Omit<ContactPerson, 'id'> & { invitation_id: string }): Promise<ContactPerson> {
    const newPerson: ContactPerson = {
      id: `contact-${Date.now()}`,
      name: personData.name,
      relation: personData.relation,
      phone: personData.phone
    };
    
    // Add to invitation's contacts array
    const invitation = invitations.find(inv => inv.id === personData.invitation_id);
    if (invitation) {
      invitation.contacts.push(newPerson);
    }
    
    return newPerson;
  }

  async updateContactPerson(id: string, personData: Partial<ContactPerson>): Promise<ContactPerson | null> {
    // Find and update in all invitations' contacts arrays
    for (const invitation of invitations) {
      const personIndex = invitation.contacts.findIndex(person => person.id === id);
      if (personIndex !== -1) {
        invitation.contacts[personIndex] = {
          ...invitation.contacts[personIndex],
          ...personData
        };
        return invitation.contacts[personIndex];
      }
    }
    return null;
  }

  async deleteContactPerson(id: string): Promise<boolean> {
    let deleted = false;
    
    // Remove from all invitations' contacts arrays
    invitations.forEach(inv => {
      const initialLength = inv.contacts.length;
      inv.contacts = inv.contacts.filter(person => person.id !== id);
      if (inv.contacts.length < initialLength) {
        deleted = true;
      }
    });
    
    return deleted;
  }

  // Background Image operations
  async getAllBackgrounds(): Promise<BackgroundImage[]> {
    return MOCK_BACKGROUNDS;
  }

  async getBackgroundById(id: string): Promise<BackgroundImage | null> {
    return MOCK_BACKGROUNDS.find(bg => bg.id === id) || null;
  }

  async getBackgroundsByCategory(category: string): Promise<BackgroundImage[]> {
    return MOCK_BACKGROUNDS.filter(bg => bg.category === category);
  }

  async getPremiumBackgrounds(): Promise<BackgroundImage[]> {
    return MOCK_BACKGROUNDS.filter(bg => bg.isPremium);
  }

  async getFreeBackgrounds(): Promise<BackgroundImage[]> {
    return MOCK_BACKGROUNDS.filter(bg => !bg.isPremium);
  }
}

export default new MockDataService();