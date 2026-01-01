
export enum MembershipTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium'
}

export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface GuestWish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  user_id: string;
  slug: string;
  template_id: string;
  event_type: string;
  bride_name: string;
  groom_name: string;
  host_names: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  address: string;
  google_maps_url: string;
  waze_url: string;
  itinerary: ItineraryItem[];
  contacts: ContactPerson[];
  gallery: string[];
  views: number;
  wishes: GuestWish[];
  settings: {
    music_url: string;
    primary_color: string;
    show_countdown: boolean;
    show_gallery: boolean;
    is_published: boolean;
    background_image?: string;
    pantun?: string;
    our_story?: string;
    // Customizable wording fields
    hero_title?: string;
    greeting_text?: string;
    invitation_text?: string;
    story_title?: string;
    // New individual color & size overrides
    groom_color?: string;
    bride_color?: string;
    host_color?: string;
    date_color?: string;
    greeting_color?: string;
    greeting_size?: string;
    hero_color?: string;
    hero_size?: string;
    invitation_color?: string;
    invitation_size?: string;
  };
  money_gift_details: {
    enabled: boolean;
    bank_name: string;
    account_no: string;
    account_holder: string;
    qr_url: string;
  };
}

export interface RSVP {
  id: string;
  invitation_id: string;
  guest_name: string;
  pax: number;
  is_attending: boolean;
  phone_number: string;
  message?: string;
  created_at: string;
}

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: 'popular' | 'minimalist' | 'elegant' | 'floral';
  isPremium: boolean;
  tags: string[];
}

export interface CatalogState {
  backgrounds: BackgroundImage[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  selectedBackground: BackgroundImage | null;
  isAuthenticated: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
}