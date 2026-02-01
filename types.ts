
export enum MembershipTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ELITE = 'elite'
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
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

export interface WishlistItem {
  id: string;
  item_name: string;
  item_link: string;
  item_image: string;
}

export interface RSVP {
  id: string;
  invitation_id: string;
  guest_name: string;
  pax: number;
  is_attending: boolean;
  phone_number: string;
  message?: string;
  slot?: string;
  created_at: string;
}

export interface RsvpSettings {
  response_mode: 'rsvp_and_wish' | 'wish_only' | 'external' | 'none';
  external_url?: string;
  note?: string;
  closing_date?: string;
  fields: {
    name: boolean;
    phone: boolean;
    email: boolean;
    address: boolean;
    company: boolean;
    job_title: boolean;
    car_plate: boolean;
    remarks: boolean;
    wish: boolean;
  };
  has_children_policy: boolean;
  pax_limit_per_rsvp: number;
  total_guest_limit: number;
  has_slots: boolean;
  slots_options?: string[];
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
  rsvps: RSVP[];
  rsvp_settings: RsvpSettings;
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
    // Hashtag for social sharing
    hashtag_text?: string;
    hashtag_color?: string;
    hashtag_size?: string;
    hashtag_font?: string;
    // New individual color & size overrides
    groom_color?: string;
    groom_font?: string;
    groom_size?: string;
    bride_color?: string;
    bride_font?: string;
    bride_size?: string;
    host_color?: string;
    host_font?: string;
    host_size?: string;
    date_color?: string;
    date_font?: string;
    date_size?: string;
    greeting_color?: string;
    greeting_font?: string;
    greeting_size?: string;
    hero_color?: string;
    hero_font?: string;
    hero_size?: string;
    location_color?: string;
    location_font?: string;
    location_size?: string;
    invitation_color?: string;
    invitation_font?: string;
    invitation_size?: string;
    package_plan?: string;
    opening_type?: 'window' | 'slide' | 'open-letter' | 'blur' | 'slide-up' | 'none';
    opening_color?: string;
    effect_style?: 'none' | 'bubble' | 'snow' | 'stars';
    effect_color?: string;
    layout_settings?: {
      cover_layout?: string;
      font_family?: string;
      overlay_opacity?: number;
    };
    youtube_url?: string;
    youtube_start_time?: string;
    youtube_show?: boolean;
    youtube_autoplay?: boolean;
    auto_scroll_delay?: number;
    is_paid?: boolean;
  };
  money_gift_details: {
    enabled: boolean;
    bank_name: string;
    account_no: string;
    account_holder: string;
    qr_url: string;
    gift_title?: string;
    gift_subtitle?: string;
  };
  wishlist_details: {
    enabled: boolean;
    receiver_phone: string;
    receiver_address: string;
    items: WishlistItem[];
    wishlist_title?: string;
    wishlist_subtitle?: string;
  };
}

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: string;
  theme: string;
  primary_color: string;
  isPremium: boolean;
  tags: string[];
  layout_settings?: {
    cover_layout?: string;
    font_family?: string;
    overlay_opacity?: number;
  };
  created_at: string;
  updated_at: string;
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
  label: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  invitation_id?: string;
  amount: string;
  status: OrderStatus;
  plan_tier: MembershipTier;
  payment_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  invitation?: {
    id: string;
    slug: string;
    bride_name: string;
    groom_name: string;
    event_type: string;
  };
}