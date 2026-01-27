import { Invitation, RSVP, Plan } from './types';

export const MOCK_INVITATIONS: Invitation[] = [
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
    rsvps: [],
    rsvp_settings: {
      response_mode: 'rsvp_and_wish',
      fields: {
        name: true,
        phone: true,
        email: false,
        address: false,
        company: false,
        job_title: false,
        car_plate: false,
        remarks: false,
        wish: true
      },
      has_children_policy: false,
      pax_limit_per_rsvp: 10,
      total_guest_limit: 1000,
      has_slots: false
    },
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
    },
    wishlist_details: {
      enabled: false,
      receiver_phone: '',
      receiver_address: '',
      items: []
    }
  }
];

export const MOCK_RSVPS: RSVP[] = [
  { id: 'r1', invitation_id: 'inv-1', guest_name: 'Zulkhairi Ali', pax: 2, is_attending: true, phone_number: '0112233445', created_at: '2024-05-10T10:00:00Z' },
  { id: 'r2', invitation_id: 'inv-1', guest_name: 'Nurul Izzah', pax: 4, is_attending: true, phone_number: '0122334455', created_at: '2024-05-11T12:30:00Z' },
  { id: 'r3', invitation_id: 'inv-1', guest_name: 'Farhan Rahman', pax: 0, is_attending: false, phone_number: '0133445566', created_at: '2024-05-12T09:15:00Z', message: 'Maaf, ada urusan kecemasan.' },
  { id: 'r4', invitation_id: 'inv-1', guest_name: 'Siti Sarah', pax: 2, is_attending: true, phone_number: '0144556677', created_at: '2024-05-13T15:45:00Z' },
  { id: 'r5', invitation_id: 'inv-1', guest_name: 'Dr. Ahmad Fauzi', pax: 1, is_attending: true, phone_number: '0155667788', created_at: '2024-05-14T08:20:00Z' },
];

export const THEME_COLORS = [
  { name: 'Classic Gold', value: '#D4AF37' },
  { name: 'Royal Navy', value: '#002366' },
  { name: 'Emerald Green', value: '#046307' },
  { name: 'Dusty Rose', value: '#DCAE96' },
  { name: 'Sage Green', value: '#9C9F84' },
  { name: 'Pure Black', value: '#1A1A1A' },
];

export const FONT_FAMILIES = [
  { group: 'Serif (Formal & Elegant)', fonts: ['Playfair Display', 'Cinzel', 'Spectral', 'Cormorant Garamond', 'Lora'] },
  { group: 'Cursive (Wedding & Party)', fonts: ['Great Vibes', 'Dancing Script', 'Alex Brush', 'Pacifico', 'Pinyon Script', 'Parisienne'] },
  { group: 'Sans-Serif (Modern & Clean)', fonts: ['Montserrat', 'Outfit', 'Inter', 'Quicksand', 'Raleway'] },
  { group: 'Malay Traditional Style', fonts: ['Kurale', 'Aaltonen', 'Samyak Malayalam'] }
];

export const PACKAGE_PLANS: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    label: 'Lite (RM29)',
    price: '29',
    period: 'Seumur Hidup',
    description: 'The essential wedding invitation',
    features: ['Tiada Had Pelawat', 'Lifetime Access', 'Gallery (1 Image)'],
    isPopular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    label: 'Pro (RM49)',
    price: '49',
    period: 'Seumur Hidup',
    description: 'The preferred choice',
    features: ['Maklumat Boleh Tukar (120 Hari)', 'Gallery (5 Images)', 'Money Gift (E-Angpow)', 'RSVP & Guest Wishes'],
    isPopular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    label: 'Elite (RM69)',
    price: '69',
    period: 'Seumur Hidup',
    description: 'The ultimate experience',
    features: ['Lifetime Edit', 'Unlimited Gallery', 'Video Embed', 'Physical Wishlist', 'Custom URL'],
    isPopular: false
  }
];

export const OPENING_TYPES = [
  { id: 'none', label: 'Tiada (None)' },
  { id: 'window', label: 'Window Effect' },
  { id: 'slide', label: 'Slide Door' },
  { id: 'open-letter', label: 'Open Letter' },
  { id: 'blur', label: 'Blur Reveal' },
  { id: 'slide-up', label: 'Slide Up' }
];

export const EFFECT_STYLES = [
  { id: 'none', label: 'Tiada (None)' },
  { id: 'bubble', label: 'Floating Bubbles' },
  { id: 'snow', label: 'Snow Fall' },
  { id: 'stars', label: 'Shining Stars' }
];