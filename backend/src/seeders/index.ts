import { User, Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery, BackgroundImage } from '../models';
import { MembershipTier } from '../types/models';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

/**
 * Database seeder
 * Populates the database with initial data for development
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if data already exists
    // Make sure models are initialized first
    logger.info('Checking if database is already seeded...');
    
    // Try to count users, but handle the case where model isn't initialized yet
    let userCount = 0;
    try {
      userCount = await User.count();
    } catch (error) {
      logger.warn('Could not count users (database might not be initialized yet):', error);
      userCount = 0;
    }
    
    if (userCount > 0) {
      logger.info('Database already seeded. Skipping seeding.');
      return;
    }

    logger.info('Starting database seeding...');

    // Seed background images
    await seedBackgroundImages();

    // Seed users
    await seedUsers();

    // Seed invitations
    await seedInvitations();

    // Seed RSVPs
    await seedRSVPs();

    // Seed guest wishes
    await seedGuestWishes();

    // Seed itinerary items
    await seedItineraryItems();

    // Seed contact persons
    await seedContactPersons();

    // Seed gallery items
    await seedGalleryItems();

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

/**
 * Seed background images
 */
const seedBackgroundImages = async (): Promise<void> => {
  const backgroundImages = [
    {
      name: 'Elegant Rose',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200',
      category: 'elegant',
      isPremium: false,
      tags: ['rose', 'elegant', 'romantic'],
    },
    {
      name: 'Minimalist White',
      url: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=200',
      category: 'minimalist',
      isPremium: false,
      tags: ['minimalist', 'white', 'clean'],
    },
    {
      name: 'Floral Garden',
      url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=200',
      category: 'floral',
      isPremium: true,
      tags: ['floral', 'garden', 'nature'],
    },
    {
      name: 'Classic Gold',
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=200',
      category: 'popular',
      isPremium: true,
      tags: ['gold', 'classic', 'luxury'],
    },
  ];

  await BackgroundImage.bulkCreate(backgroundImages);
  logger.info(`Seeded ${backgroundImages.length} background images`);
};

/**
 * Seed users
 */
const seedUsers = async (): Promise<void> => {
  const hashedPassword = await bcrypt.hash('Password123', 10);
  
  const users = [
    {
      email: 'user@example.com',
      name: 'Test User',
      password: hashedPassword,
      membership_tier: MembershipTier.PREMIUM,
      membership_expires_at: new Date('2025-12-31'),
      email_verified: true,
    },
    {
      email: 'free@example.com',
      name: 'Free User',
      password: hashedPassword,
      membership_tier: MembershipTier.FREE,
      email_verified: false,
    },
  ];

  await User.bulkCreate(users);
  logger.info(`Seeded ${users.length} users`);
};

/**
 * Seed invitations
 */
const seedInvitations = async (): Promise<void> => {
  const users = await User.findAll();
  const testUser = users.find(u => u.email === 'user@example.com');
  
  if (!testUser) return;

  const invitations = [
    {
      user_id: testUser.id,
      slug: 'adam-hawa',
      template_id: 'modern-classic',
      event_type: 'Walimatulurus',
      bride_name: 'Siti Hawa',
      groom_name: 'Adam Malik',
      host_names: 'Encik Ahmad & Puan Aminah',
      event_date: new Date('2025-12-25'),
      start_time: '11:00',
      end_time: '16:00',
      location_name: 'Dewan Banquet Melati',
      address: 'No 1, Jalan Bunga Raya, 50480 Kuala Lumpur',
      google_maps_url: 'https://maps.google.com',
      waze_url: 'https://waze.com',
      views: 1240,
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
        invitation_size: '14',
      },
      money_gift_details: {
        enabled: true,
        bank_name: 'Maybank',
        account_no: '123456789012',
        account_holder: 'Siti Hawa binti Ahmad',
        qr_url: '',
      },
    },
  ];

  await Invitation.bulkCreate(invitations);
  logger.info(`Seeded ${invitations.length} invitations`);
};

/**
 * Seed RSVPs
 */
const seedRSVPs = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'adam-hawa');
  
  if (!testInvitation) return;

  const rsvps = [
    {
      invitation_id: testInvitation.id,
      guest_name: 'Zulkhairi Ali',
      pax: 2,
      is_attending: true,
      phone_number: '0112233445',
    },
    {
      invitation_id: testInvitation.id,
      guest_name: 'Nurul Izzah',
      pax: 4,
      is_attending: true,
      phone_number: '0122334455',
    },
    {
      invitation_id: testInvitation.id,
      guest_name: 'Farhan Rahman',
      pax: 0,
      is_attending: false,
      phone_number: '0133445566',
      message: 'Maaf, ada urusan kecemasan.',
    },
    {
      invitation_id: testInvitation.id,
      guest_name: 'Siti Sarah',
      pax: 2,
      is_attending: true,
      phone_number: '0144556677',
    },
    {
      invitation_id: testInvitation.id,
      guest_name: 'Dr. Ahmad Fauzi',
      pax: 1,
      is_attending: true,
      phone_number: '0155667788',
    },
  ];

  await RSVP.bulkCreate(rsvps);
  logger.info(`Seeded ${rsvps.length} RSVPs`);
};

/**
 * Seed guest wishes
 */
const seedGuestWishes = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'adam-hawa');
  
  if (!testInvitation) return;

  const guestWishes = [
    {
      invitation_id: testInvitation.id,
      name: 'Zulkhairi',
      message: 'Selamat pengantin baru! Semoga kekal ke anak cucu.',
    },
    {
      invitation_id: testInvitation.id,
      name: 'Farah & Family',
      message: 'Alhamdulillah, cantiknya kad! See you there!',
    },
  ];

  await GuestWish.bulkCreate(guestWishes);
  logger.info(`Seeded ${guestWishes.length} guest wishes`);
};

/**
 * Seed itinerary items
 */
const seedItineraryItems = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'adam-hawa');
  
  if (!testInvitation) return;

  const itineraryItems = [
    {
      invitation_id: testInvitation.id,
      time: '11:00',
      activity: 'Ketibaan Tetamu',
    },
    {
      invitation_id: testInvitation.id,
      time: '13:00',
      activity: 'Ketibaan Pengantin & Jamuan Makan',
    },
    {
      invitation_id: testInvitation.id,
      time: '16:00',
      activity: 'Majlis Bersurai',
    },
  ];

  await ItineraryItem.bulkCreate(itineraryItems);
  logger.info(`Seeded ${itineraryItems.length} itinerary items`);
};

/**
 * Seed contact persons
 */
const seedContactPersons = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'adam-hawa');
  
  if (!testInvitation) return;

  const contactPersons = [
    {
      invitation_id: testInvitation.id,
      name: 'Ahmad (Ayah)',
      relation: 'Bapa',
      phone: '0123456789',
    },
    {
      invitation_id: testInvitation.id,
      name: 'Aminah (Ibu)',
      relation: 'Ibu',
      phone: '0987654321',
    },
  ];

  await ContactPerson.bulkCreate(contactPersons);
  logger.info(`Seeded ${contactPersons.length} contact persons`);
};

/**
 * Seed gallery items
 */
const seedGalleryItems = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'adam-hawa');
  
  if (!testInvitation) return;

  const galleryItems = [
    {
      invitation_id: testInvitation.id,
      image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      caption: 'Pre-wedding photos',
      display_order: 1,
    },
    {
      invitation_id: testInvitation.id,
      image_url: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=800',
      caption: 'Couple portrait',
      display_order: 2,
    },
  ];

  await Gallery.bulkCreate(galleryItems);
  logger.info(`Seeded ${galleryItems.length} gallery items`);
};