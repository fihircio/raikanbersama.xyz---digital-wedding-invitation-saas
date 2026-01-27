import { User, Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery, BackgroundImage, Order } from '../models';
import { MembershipTier, OrderStatus } from '../types/models';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

/**
 * Database seeder
 * Populates the database with initial data for development
 */
export const seedDatabase = async (): Promise<void> => {
  try {
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

    // Seed orders
    await seedOrders();

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
    // Don't throw, just log so the process doesn't exit with error if it's just a duplicate key
  }
};

/**
 * Seed orders
 */
const seedOrders = async (): Promise<void> => {
  const users = await User.findAll();
  const testUser = users.find(u => u.email === 'premium@example.com');
  const eliteUser = users.find(u => u.email === 'elite@example.com');
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'inv-1');

  if (!testUser || !testInvitation) return;

  const orderCount = await Order.count();
  if (orderCount > 0) {
    logger.info('Orders already seeded');
    return;
  }

  const orders = [
    {
      user_id: testUser.id,
      invitation_id: testInvitation.id,
      amount: 49.00,
      status: OrderStatus.COMPLETED,
      plan_tier: MembershipTier.PRO,
      payment_id: 'pay_premium_123',
      payment_method: 'FPX',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      user_id: testUser.id,
      amount: 19.00,
      status: OrderStatus.FAILED,
      plan_tier: MembershipTier.LITE,
      payment_id: 'pay_basic_456',
      payment_method: 'Card',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    }
  ];

  if (eliteUser) {
    orders.push({
      user_id: eliteUser.id,
      amount: 99.00,
      status: OrderStatus.COMPLETED,
      plan_tier: MembershipTier.ELITE,
      payment_id: 'pay_elite_789',
      payment_method: 'FPX',
      created_at: new Date()
    });
  }

  await Order.bulkCreate(orders);
  logger.info(`Seeded ${orders.length} orders`);
};

/**
 * Seed background images
 */
const seedBackgroundImages = async (): Promise<void> => {
  // ... (same as before, skipping overwrite for brevity of replacement if possible, but I need to include it if I replace the whole block)
  // Actually, I can keep seedBackgroundImages as is if I didn't verify it, but I'll paste it back.
  // To be safe and concise, I will use findOrCreate or count check in the main function as added above.
  const backgroundImages = [
    {
      name: 'Elegant Rose',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200',
      category: 'Elegant',
      isPremium: false,
      tags: ['rose', 'elegant', 'romantic'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
    {
      name: 'Minimalist White',
      url: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1519225495810-75178319a13b?auto=format&fit=crop&q=80&w=200',
      category: 'Minimalist',
      isPremium: false,
      tags: ['minimalist', 'white', 'clean'],
      layout_settings: {
        cover_layout: 'bottom-accent',
        font_family: 'sans-serif',
      },
    },
    {
      name: 'Floral Garden',
      url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=200',
      category: 'Floral',
      isPremium: true,
      tags: ['floral', 'garden', 'nature'],
      layout_settings: {
        cover_layout: 'top-bordered',
        font_family: 'serif',
      },
    },
    {
      name: 'Baby Shower Blue',
      url: 'https://images.unsplash.com/photo-1519340241574-2cef6a2188ca?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1519340241574-2cef6a2188ca?auto=format&fit=crop&q=80&w=200',
      category: 'Baby',
      isPremium: false,
      tags: ['baby', 'boy', 'blue'],
      layout_settings: {
        cover_layout: 'centered-circle',
        font_family: 'cursive',
      },
    },
    {
      name: 'Birthday Party',
      url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=200',
      category: 'Party',
      isPremium: true,
      tags: ['party', 'birthday', 'celebration'],
      layout_settings: {
        cover_layout: 'centered-circle',
        font_family: 'sans-serif',
      },
    },
    {
      name: 'Ramadan Kareem',
      url: 'https://images.unsplash.com/photo-1584281722572-902319342738?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1584281722572-902319342738?auto=format&fit=crop&q=80&w=200',
      category: 'Ramadan',
      isPremium: false,
      tags: ['ramadan', 'islamic', 'sacred'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
    {
      name: 'Aidilfitri Joy',
      url: 'https://images.unsplash.com/photo-1563294373-c65134abb2b7?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1563294373-c65134abb2b7?auto=format&fit=crop&q=80&w=200',
      category: 'Raya',
      isPremium: true,
      tags: ['raya', 'eid', 'muslim'],
      layout_settings: {
        cover_layout: 'glass-card',
        font_family: 'serif',
      },
    },
    {
      name: 'Islamic Geometry',
      url: 'https://images.unsplash.com/photo-1564769625905-50e9363afda9?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e9363afda9?auto=format&fit=crop&q=80&w=200',
      category: 'Islamic',
      isPremium: false,
      tags: ['islamic', 'geometry', 'pattern'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
    {
      name: 'Rustic Woods',
      url: 'https://images.unsplash.com/photo-1445510491599-c391e8046a68?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1445510491599-c391e8046a68?auto=format&fit=crop&q=80&w=200',
      category: 'Rustic',
      isPremium: true,
      tags: ['rustic', 'wood', 'vintage'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
    {
      name: 'Traditional Motif',
      url: 'https://images.unsplash.com/photo-1582533089852-0240222081d5?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1582533089852-0240222081d5?auto=format&fit=crop&q=80&w=200',
      category: 'Traditional',
      isPremium: false,
      tags: ['traditional', 'culture', 'heritage'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
    {
      name: 'Vintage Paper',
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200',
      category: 'Vintage',
      isPremium: true,
      tags: ['vintage', 'classic', 'old'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
    {
      name: 'Watercolor Blooms',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
      category: 'Watercolor',
      isPremium: false,
      tags: ['watercolor', 'art', 'soft'],
      layout_settings: {
        cover_layout: 'standard',
        font_family: 'serif',
      },
    },
  ];

  for (const bg of backgroundImages) {
    const exists = await BackgroundImage.findOne({ where: { name: bg.name } });
    if (!exists) {
      await BackgroundImage.create(bg as any);
    } else {
      // Update fields if needed
      let changed = false;
      if (exists.category !== bg.category) {
        exists.category = bg.category;
        changed = true;
      }
      if (JSON.stringify(exists.layout_settings) !== JSON.stringify(bg.layout_settings)) {
        exists.layout_settings = bg.layout_settings as any;
        changed = true;
      }
      if (changed) {
        await exists.save();
      }
    }
  }
  logger.info(`Seeded background images checked/created`);
};

/**
 * Seed users
 */
const seedUsers = async (): Promise<void> => {
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const users = [
    {
      email: 'elite@example.com',
      name: 'Elite User',
      password: hashedPassword,
      membership_tier: MembershipTier.ELITE,
      membership_expires_at: new Date('2025-12-31'),
      email_verified: true,
    },
    {
      email: 'basic@example.com',
      name: 'Basic User',
      password: hashedPassword,
      membership_tier: MembershipTier.LITE,
      membership_expires_at: new Date('2025-12-31'),
      email_verified: true,
    },
    {
      email: 'premium@example.com',
      name: 'Premium User',
      password: hashedPassword,
      membership_tier: MembershipTier.PRO,
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

  for (const user of users) {
    const exists = await User.findOne({ where: { email: user.email } });
    if (!exists) {
      await User.create(user);
      logger.info(`Created user: ${user.email}`);
    } else {
      // Update tier if exists to ensure testing works? No, safeguard user data.
      logger.info(`User already exists: ${user.email}`);
    }
  }
};

/**
 * Seed invitations
 */
const seedInvitations = async (): Promise<void> => {
  const users = await User.findAll();
  const testUser = users.find(u => u.email === 'premium@example.com');

  if (!testUser) return;

  const invitations = [
    {
      user_id: testUser.id,
      slug: 'inv-1',  // Changed from 'adam-hawa' to 'inv-1'
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
      wishlist_details: {
        enabled: true,
        receiver_phone: '0123456789',
        receiver_address: 'No 1, Jalan Bunga Raya, 50480 Kuala Lumpur',
        items: []
      }
    },
  ];

  for (const invitation of invitations) {
    const exists = await Invitation.findOne({ where: { slug: invitation.slug } });
    if (!exists) {
      await Invitation.create(invitation);
      logger.info(`Created invitation: ${invitation.slug}`);
    } else {
      // Force update owner for testing if needed
      if (exists.user_id !== invitation.user_id) {
        exists.user_id = invitation.user_id;
        await exists.save();
        logger.info(`Updated invitation owner: ${invitation.slug}`);
      }
      logger.info(`Invitation already exists: ${invitation.slug}`);
    }
  }
};

/**
 * Seed RSVPs
 */
const seedRSVPs = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'inv-1');

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

  for (const rsvp of rsvps) {
    // Check if rsvp exists for this phone number and invitation
    // RSVP generally unique by guest + invitation, assuming phone is unique per guest for this invite context for seeding
    const exists = await RSVP.findOne({
      where: {
        invitation_id: rsvp.invitation_id,
        phone_number: rsvp.phone_number
      }
    });
    if (!exists) {
      await RSVP.create(rsvp);
    }
  }
  logger.info(`Seeded RSVPs checked/created`);
};

/**
 * Seed guest wishes
 */
const seedGuestWishes = async (): Promise<void> => {
  const invitations = await Invitation.findAll();
  const testInvitation = invitations.find(i => i.slug === 'inv-1');

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
  const testInvitation = invitations.find(i => i.slug === 'inv-1');

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
  const testInvitation = invitations.find(i => i.slug === 'inv-1');

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
  const testInvitation = invitations.find(i => i.slug === 'inv-1');

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