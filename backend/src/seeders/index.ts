import { User, Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery, BackgroundImage, Order } from '../models';
import { MembershipTier, OrderStatus } from '../types/models';
import { seedSampleInvitations } from './sampleInvitations';
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

    // Seed sample invitations for pricing page
    await seedSampleInvitations();

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
  // Clear existing backgrounds to ensure fresh set
  await BackgroundImage.destroy({ where: {}, truncate: true, cascade: true });

  const backgroundImages = [
    // BEGIN_BACKGROUND_IMAGES
    {
      name: "Birthday Celebration",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/birthday.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/birthday.png",
      category: "Party",
      theme: "Modern",
      primary_color: "Gold",
      isPremium: false,
      tags: ["birthday","party","celebration"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Classic Vintage 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655907962-1266b68c8f54ee4d.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655907962-1266b68c8f54ee4d.webp",
      category: "Vintage",
      theme: "Vintage",
      primary_color: "White",
      isPremium: true,
      tags: ["vintage","classic","white"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Ethereal Flowery 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655902916-98df2c9e7641b3f0.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655902916-98df2c9e7641b3f0.webp",
      category: "Floral",
      theme: "Floral",
      primary_color: "Pink",
      isPremium: false,
      tags: ["flower","ethereal","floral"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Ethereal Flowery 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903269-b3c123c4609dc0ac.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903269-b3c123c4609dc0ac.webp",
      category: "Floral",
      theme: "Floral",
      primary_color: "Emerald",
      isPremium: false,
      tags: ["flower","ethereal","floral"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Ethereal Flowery 03",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903618-2ed12cedfa0808fa.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903618-2ed12cedfa0808fa.webp",
      category: "Floral",
      theme: "Modern",
      primary_color: "White",
      isPremium: true,
      tags: ["flower","ethereal","floral"],
      layout_settings: {"cover_layout":"top-bordered","font_family":"serif","overlay_opacity":0.4},
    },
    {
      name: "Ethereal Flowery 04",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903936-5d37778f705cc8a3.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903936-5d37778f705cc8a3.webp",
      category: "Floral",
      theme: "Traditional",
      primary_color: "Gold",
      isPremium: true,
      tags: ["flower","ethereal","floral"],
      layout_settings: {"cover_layout":"centered-circle","font_family":"cursive","overlay_opacity":0.3},
    },
    {
      name: "Floral 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185141980-937540cb21e416f5.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185144817-7eb7d2113f093f35.webp",
      category: "Floral",
      theme: "Floral",
      primary_color: "Varies",
      isPremium: true,
      tags: ["floral","floral","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Floral 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185145027-a16a2c4f1ae24db9.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185145183-c2358f40a38ecf6d.webp",
      category: "Floral",
      theme: "Floral",
      primary_color: "Varies",
      isPremium: true,
      tags: ["floral","floral","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Flowery Elegance",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/flowery.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/flowery.png",
      category: "Floral",
      theme: "Floral",
      primary_color: "Pink",
      isPremium: false,
      tags: ["flowery","floral","elegant"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Garden Party 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655906814-c6e2985e713e7840.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655906814-c6e2985e713e7840.webp",
      category: "Party",
      theme: "Floral",
      primary_color: "Pink",
      isPremium: false,
      tags: ["party","garden","floral"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Garden Party 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655907165-a70c19f3d38c2a70.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655907165-a70c19f3d38c2a70.webp",
      category: "Party",
      theme: "Modern",
      primary_color: "Emerald",
      isPremium: true,
      tags: ["party","modern","emerald"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Islamic 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770186210547-829979cb83be499e.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770186213165-fc9a2c67b7d2791c.webp",
      category: "Islamic",
      theme: "Islamic",
      primary_color: "Varies",
      isPremium: true,
      tags: ["islamic","islamic","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Islamic 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770186213400-402554c263fe73d1.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770186213651-17cd5c6336eea5ae.webp",
      category: "Islamic",
      theme: "Islamic",
      primary_color: "Varies",
      isPremium: true,
      tags: ["islamic","islamic","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Majestic Birthday",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655901297-199d5b9a5d7c6cf7.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655901297-199d5b9a5d7c6cf7.webp",
      category: "Baby",
      theme: "Modern",
      primary_color: "Blue",
      isPremium: false,
      tags: ["birthday","baby","blue"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Minimal 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185928496-4af6edcfe08c882d.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185928922-9ac0979422e53387.webp",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "Varies",
      isPremium: true,
      tags: ["minimalist","minimalist","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Minimal Chic",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/minimal_03.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/minimal_03.png",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "White",
      isPremium: true,
      tags: ["minimal","chic","premium"],
      layout_settings: {"cover_layout":"bottom-accent","font_family":"sans-serif","overlay_opacity":0.2},
    },
    {
      name: "Minimal Clean",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/minimal.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/minimal.png",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "White",
      isPremium: false,
      tags: ["minimal","clean","simple"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.2},
    },
    {
      name: "Minimal Soft",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/minimal_02.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/minimal_02.png",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "White",
      isPremium: false,
      tags: ["minimal","soft","elegant"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.2},
    },
    {
      name: "Modern Flow",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/modern.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/modern.png",
      category: "Modern",
      theme: "Modern",
      primary_color: "Blue",
      isPremium: false,
      tags: ["modern","flow","contemporary"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.3},
    },
    {
      name: "Modern Flow 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769657840647-4d3b51f04fbfa4d6.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769657840647-4d3b51f04fbfa4d6.webp",
      category: "Modern",
      theme: "Modern",
      primary_color: "Blue",
      isPremium: false,
      tags: ["modern","flow","blue"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.3},
    },
    {
      name: "Modern Gradient",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/modern_02.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/modern_02.png",
      category: "Modern",
      theme: "Modern",
      primary_color: "Blue",
      isPremium: true,
      tags: ["modern","gradient","premium"],
      layout_settings: {"cover_layout":"glass-card","font_family":"sans-serif","overlay_opacity":0.3},
    },
    {
      name: "Modern Minimalist",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655905759-e0f9807bd74e1eee.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655905759-e0f9807bd74e1eee.webp",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "White",
      isPremium: false,
      tags: ["minimalist","modern","clean"],
      layout_settings: {"cover_layout":"bottom-accent","font_family":"sans-serif","overlay_opacity":0.2},
    },
    {
      name: "Neon Glow",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/neon.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/neon.png",
      category: "Party",
      theme: "Modern",
      primary_color: "Pink",
      isPremium: true,
      tags: ["neon","glow","party"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.4},
    },
    {
      name: "Ornament 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185929130-6ac7d8354f2fcfc0.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185929299-a006ad56eef834c2.webp",
      category: "Modern",
      theme: "Modern",
      primary_color: "Varies",
      isPremium: true,
      tags: ["modern","modern","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Premium Collection 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135442920-4f94a78cdc6c617d.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135443216-b8fbcaf46797a79f.webp",
      category: "Floral",
      theme: "Floral",
      primary_color: "Pink",
      isPremium: true,
      tags: ["premium","floral","elegant"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Premium Collection 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135443452-e33907bf676b0df9.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135443719-2b6545459c89e622.webp",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "White",
      isPremium: true,
      tags: ["premium","minimalist","clean"],
      layout_settings: {"cover_layout":"bottom-accent","font_family":"sans-serif","overlay_opacity":0.2},
    },
    {
      name: "Premium Collection 03",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135444041-5d993a9218efd946.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135444306-35179c50f73a8d05.webp",
      category: "Modern",
      theme: "Modern",
      primary_color: "Blue",
      isPremium: true,
      tags: ["premium","modern","dynamic"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.3},
    },
    {
      name: "Premium Collection 04",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135444671-c97c5c82c1641adb.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135445009-f10bee36561eb9ac.webp",
      category: "Islamic",
      theme: "Islamic",
      primary_color: "Emerald",
      isPremium: true,
      tags: ["premium","islamic","traditional"],
      layout_settings: {"cover_layout":"glass-card","font_family":"serif","overlay_opacity":0.4},
    },
    {
      name: "Premium Collection 05",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135445371-cfbc7e81b23557d8.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135445677-93247d98737f179e.webp",
      category: "Rustic",
      theme: "Rustic",
      primary_color: "Gold",
      isPremium: true,
      tags: ["premium","rustic","nature"],
      layout_settings: {"cover_layout":"centered-circle","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Premium Collection 06",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135445917-370d4cd5de49b0c9.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135446162-38df49cdb2e5fb19.webp",
      category: "Party",
      theme: "Party",
      primary_color: "Pink",
      isPremium: true,
      tags: ["premium","party","fun"],
      layout_settings: {"cover_layout":"standard","font_family":"sans-serif","overlay_opacity":0.4},
    },
    {
      name: "Premium Collection 07",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135446523-2879f67501e17d67.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135446867-dcb2479f8ca2518a.webp",
      category: "Traditional",
      theme: "Traditional",
      primary_color: "Gold",
      isPremium: true,
      tags: ["premium","traditional","motif"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Premium Collection 08",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135447155-43c9d8078df822b2.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135447398-e603ee3a0e3be79b.webp",
      category: "Vintage",
      theme: "Vintage",
      primary_color: "White",
      isPremium: true,
      tags: ["premium","vintage","classic"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Premium Collection 09",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135447620-6a270e13fc175dea.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135447877-08814b6697d53cd0.webp",
      category: "Watercolor",
      theme: "Watercolor",
      primary_color: "Pink",
      isPremium: true,
      tags: ["premium","watercolor","soft"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Premium Collection 10",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135448194-95dfc20c9d013ac2.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135448425-3c2118069ddd8612.webp",
      category: "Modern",
      theme: "Modern",
      primary_color: "Blue",
      isPremium: true,
      tags: ["premium","modern","gradient"],
      layout_settings: {"cover_layout":"glass-card","font_family":"sans-serif","overlay_opacity":0.3},
    },
    {
      name: "Premium Collection 11",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135448803-9bbea9fbb49abbbf.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/3defea99-3607-43a2-ab4f-5011d5f65d8a/1770135449102-ae598062900364f9.webp",
      category: "Minimalist",
      theme: "Minimalist",
      primary_color: "White",
      isPremium: true,
      tags: ["premium","minimalist","vogue"],
      layout_settings: {"cover_layout":"bottom-accent","font_family":"sans-serif","overlay_opacity":0.2},
    },
    {
      name: "Ramadhan 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185145362-4bd13e54ac05a745.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185145542-18c69faab37d3bb2.webp",
      category: "Islamic",
      theme: "Ramadan",
      primary_color: "Varies",
      isPremium: true,
      tags: ["islamic","ramadan","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Ramadhan 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185145739-f303062cc398d322.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185145989-0e6ffd5689de2a87.webp",
      category: "Islamic",
      theme: "Ramadan",
      primary_color: "Varies",
      isPremium: true,
      tags: ["islamic","ramadan","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Ramadhan Mubarak",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/ramadhan.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/ramadhan.png",
      category: "Ramadan",
      theme: "Islamic",
      primary_color: "Emerald",
      isPremium: false,
      tags: ["ramadhan","islamic","eid"],
      layout_settings: {"cover_layout":"glass-card","font_family":"serif","overlay_opacity":0.4},
    },
    {
      name: "Ramadhan Special 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769657843367-c02dd2cbe28157c4.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769657843367-c02dd2cbe28157c4.webp",
      category: "Islamic",
      theme: "Islamic",
      primary_color: "Emerald",
      isPremium: true,
      tags: ["ramadhan","islamic","emerald"],
      layout_settings: {"cover_layout":"glass-card","font_family":"serif","overlay_opacity":0.4},
    },
    {
      name: "Raya 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185146188-2083ff461de80b5a.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185146369-788d2ef3be867310.webp",
      category: "Islamic",
      theme: "Raya",
      primary_color: "Varies",
      isPremium: true,
      tags: ["islamic","raya","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Royal Islamic Motif",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655904712-c076fe431d634d2e.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655904712-c076fe431d634d2e.webp",
      category: "Islamic",
      theme: "Islamic",
      primary_color: "Gold",
      isPremium: true,
      tags: ["islamic","royal","gold"],
      layout_settings: {"cover_layout":"glass-card","font_family":"serif","overlay_opacity":0.5},
    },
    {
      name: "Rustic Charm 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769657843865-5b7665210ee4171f.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769657843865-5b7665210ee4171f.webp",
      category: "Traditional",
      theme: "Traditional",
      primary_color: "Gold",
      isPremium: true,
      tags: ["rustic","traditional","gold"],
      layout_settings: {"cover_layout":"centered-circle","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Rustic Nature",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/rustic.png",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/rustic.png",
      category: "Rustic",
      theme: "Rustic",
      primary_color: "Gold",
      isPremium: false,
      tags: ["rustic","nature","earthy"],
      layout_settings: {"cover_layout":"centered-circle","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Traditional 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185146581-5e19a88ffe06244d.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185146870-e0b392df35fd3ff2.webp",
      category: "Traditional",
      theme: "Traditional",
      primary_color: "Varies",
      isPremium: true,
      tags: ["traditional","traditional","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Watercolor 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185147090-82bdc6b905e9ca5a.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185147298-78a0170ec54d1315.webp",
      category: "Watercolor",
      theme: "Watercolor",
      primary_color: "Varies",
      isPremium: true,
      tags: ["watercolor","watercolor","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Watercolor 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185147498-fd96455efa105653.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185147648-a6cd43f701247600.webp",
      category: "Watercolor",
      theme: "Watercolor",
      primary_color: "Varies",
      isPremium: true,
      tags: ["watercolor","watercolor","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Watercolor 03",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185147867-9ae5f886801e98ae.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background-thumb-medium/1bda822d-aec0-4eab-b3d3-bd734be23f00/1770185148111-0ea79055ec1ec43f.webp",
      category: "Watercolor",
      theme: "Watercolor",
      primary_color: "Varies",
      isPremium: true,
      tags: ["watercolor","watercolor","new"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.3},
    },
    {
      name: "Watercolor Bloom 01",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655908844-e2a647da5f41b994.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655908844-e2a647da5f41b994.webp",
      category: "Watercolor",
      theme: "Vintage",
      primary_color: "Blue",
      isPremium: false,
      tags: ["watercolor","bloom","soft"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    {
      name: "Watercolor Bloom 02",
      url: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655909266-7941b626eb7350bb.webp",
      thumbnail: "https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655909266-7941b626eb7350bb.webp",
      category: "Watercolor",
      theme: "Floral",
      primary_color: "Pink",
      isPremium: false,
      tags: ["watercolor","bloom","soft"],
      layout_settings: {"cover_layout":"standard","font_family":"serif","overlay_opacity":0.2},
    },
    // END_BACKGROUND_IMAGES
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
      if (exists.url !== bg.url) {
        exists.url = bg.url;
        changed = true;
      }
      if (exists.thumbnail !== bg.thumbnail) {
        exists.thumbnail = bg.thumbnail;
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
      image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
      caption: 'Couple portrait',
      display_order: 2,
    },
  ];

  await Gallery.bulkCreate(galleryItems);
  logger.info(`Seeded ${galleryItems.length} gallery items`);
};