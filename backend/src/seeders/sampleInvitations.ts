
import { User, Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery } from '../models';
import { MembershipTier } from '../types/models';
// @ts-ignore
import bcrypt from 'bcrypt';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export const seedSampleInvitations = async () => {
    try {
        console.log('🌱 Seeding Enriched Sample Invitations...');

        // 1. Create Sample User
        const email = 'sample@example.com';
        let user = await User.findOne({ where: { email } });

        if (!user) {
            const hashedPassword = await bcrypt.hash('sample123', 10);
            user = await User.create({
                id: uuidv4(),
                email,
                password: hashedPassword,
                name: 'Sample User',
                phone_number: '0123456789',
                is_verified: true,
                membership_tier: MembershipTier.ELITE
            });
            console.log('✅ Created sample user');
        } else {
            console.log('ℹ️ Sample user already exists');
        }

        // 2. Define Samples
        const samples = [
            {
                slug: 'sample-pakej-aswa',
                plan: 'lite',
                title: 'Raikan Cinta (Lite)',
                template: 'modern-classic',
                backgroundImage: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655902916-98df2c9e7641b3f0.webp',
                features: ['rsvp'],
                opening_type: 'none',
                effect_style: 'none',
                youtube_url: '',
                has_gallery: false,
                has_wishlist: false
            },
            {
                slug: 'sample-pakej-asmaradana',
                plan: 'pro',
                title: 'Raikan Cinta (Pro)',
                template: 'floral-dream',
                backgroundImage: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655903269-b3c123c4609dc0ac.webp',
                features: ['rsvp', 'wishes', 'music'],
                opening_type: 'window',
                effect_style: 'bubble',
                youtube_url: 'https://www.youtube.com/watch?v=QPL2JvRCTtI',
                has_gallery: true,
                has_wishlist: false
            },
            {
                slug: 'sample-pakej-kayangan',
                plan: 'elite',
                title: 'Raikan Cinta (Elite)',
                template: 'royal-gold',
                backgroundImage: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655904712-c076fe431d634d2e.webp',
                features: ['rsvp', 'wishes', 'music', 'gallery', 'money_gift', 'wishlist'],
                opening_type: 'blur',
                effect_style: 'snow',
                youtube_url: 'https://www.youtube.com/watch?v=QPL2JvRCTtI',
                has_gallery: true,
                has_wishlist: true
            }
        ];

        // 3. Create Invitations
        for (const sample of samples) {
            let inv = await Invitation.findOne({ where: { slug: sample.slug } });

            const settings = {
                package_plan: sample.plan,
                is_paid: true,
                is_published: true,
                music_url: sample.features.includes('music') ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : '',
                primary_color: '#8B4513',
                show_countdown: true,
                show_gallery: sample.features.includes('gallery'),
                background_image: sample.backgroundImage,
                hero_title: sample.title,
                greeting_text: 'Assalammualaikum W.B.T',
                invitation_text: 'Dengan penuh kesyukuran...',
                opening_type: sample.opening_type,
                effect_style: sample.effect_style,
                youtube_url: sample.youtube_url,
            };

            const wishlist_details = {
                enabled: sample.has_wishlist,
                receiver_phone: sample.has_wishlist ? '012-3456789' : '',
                receiver_address: sample.has_wishlist ? 'No. 123, Jalan Kayangan, 50480 Kuala Lumpur' : '',
                items: sample.has_wishlist ? [
                    { id: uuidv4(), item_name: 'Set Periuk Dessini', item_link: 'https://shopee.com.my', item_image: 'https://images.unsplash.com/photo-1584990333910-fe905206f369?auto=format&fit=crop&w=400&q=80' },
                    { id: uuidv4(), item_name: 'Vacuum Cleaner', item_link: 'https://lazada.com.my', item_image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80' }
                ] : [],
                wishlist_title: 'Physical Wishlist',
                wishlist_subtitle: 'Gifts requested'
            };

            const rsvp_settings = {
                response_mode: 'rsvp_and_wish',
                fields: {
                    name: true,
                    phone: true,
                    email: false,
                    address: false,
                    company: false,
                    job_title: false,
                    car_plate: false,
                    remarks: false, // Unselect catatan
                    wish: true
                },
                has_children_policy: false,
                pax_limit_per_rsvp: 5,
                total_guest_limit: 500,
                has_slots: false
            };

            if (!inv) {
                inv = await Invitation.create({
                    id: uuidv4(),
                    user_id: user.id,
                    slug: sample.slug,
                    template_id: sample.template,
                    event_type: 'Walimatulurus',
                    bride_name: 'Sarah',
                    groom_name: 'Ahmad',
                    host_names: 'Keluarga Hj. Ali & Hjh. Fatimah',
                    event_date: new Date('2025-12-25'),
                    start_time: '11:00 AM',
                    end_time: '04:00 PM', // 11-4pm
                    location_name: 'Grand Ballroom, Hotel Royale',
                    address: 'Jalan Sultan Ismail, Kuala Lumpur',
                    google_maps_url: 'https://maps.google.com',
                    waze_url: 'https://waze.com',
                    views: 1205 + Math.floor(Math.random() * 500),
                    settings,
                    money_gift_details: {
                        enabled: sample.features.includes('money_gift'),
                        bank_name: 'Maybank',
                        account_no: '1234567890',
                        account_holder: 'Ahmad & Sarah',
                        qr_url: '',
                        gift_title: 'Hadiah & Ingatan',
                        gift_subtitle: 'Khas buat mempelai'
                    },
                    wishlist_details,
                    rsvp_settings
                });
                console.log(`✅ Created invitation: ${sample.slug}`);
            } else {
                console.log(`ℹ️ Invitation ${sample.slug} already exists, updating...`);
                await inv.update({
                    settings,
                    is_paid: true,
                    is_published: true,
                    start_time: '11:00 AM',
                    end_time: '04:00 PM',
                    wishlist_details,
                    rsvp_settings
                });
            }

            // 4. Create/Update Sub-Data

            // Contacts (Ayah & Ibu)
            await ContactPerson.destroy({ where: { invitation_id: inv.id } });
            await ContactPerson.create({ id: uuidv4(), invitation_id: inv.id, name: 'Ayah: Hj. Ali bin Hassan', relation: 'Bapa Pengantin', phone: '012-3456789' });
            await ContactPerson.create({ id: uuidv4(), invitation_id: inv.id, name: 'Ibu: Hjh. Fatimah binti Omar', relation: 'Ibu Pengantin', phone: '019-8765432' });

            // Gallery
            await Gallery.destroy({ where: { invitation_id: inv.id } });
            if (sample.has_gallery) {
                const galleryImages = [
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80'
                ];
                for (let i = 0; i < galleryImages.length; i++) {
                    await Gallery.create({
                        id: uuidv4(),
                        invitation_id: inv.id,
                        image_url: galleryImages[i],
                        caption: `Sample Photo ${i + 1}`,
                        display_order: i
                    });
                }
            }

            // RSVPs
            const rsvpExists = await RSVP.count({ where: { invitation_id: inv.id } });
            if (rsvpExists === 0) {
                await RSVP.create({
                    id: uuidv4(),
                    invitation_id: inv.id,
                    guest_name: "Farid & Isteri",
                    pax: 2,
                    is_attending: true,
                    phone_number: "0123456789",
                    message: "Tahniah! Tak sabar nak datang.",
                    created_at: new Date()
                });
                await RSVP.create({
                    id: uuidv4(),
                    invitation_id: inv.id,
                    guest_name: "Hafiz",
                    pax: 1,
                    is_attending: true,
                    phone_number: "0198765432",
                    message: "See you there bro!",
                    created_at: new Date()
                });
            }

            // Guest Wishes
            if (sample.features.includes('wishes')) {
                const wishExists = await GuestWish.count({ where: { invitation_id: inv.id } });
                if (wishExists === 0) {
                    await GuestWish.create({
                        id: uuidv4(),
                        invitation_id: inv.id,
                        name: "Auntie Leha",
                        message: "Semoga berkekalan hingga ke jannah nak.",
                        created_at: new Date()
                    });
                    await GuestWish.create({
                        id: uuidv4(),
                        invitation_id: inv.id,
                        name: "BFF Group",
                        message: "Happy Wedding Sarah!! Cantik sangat!",
                        created_at: new Date()
                    });
                }
            }

            // Itinerary
            const itinExists = await ItineraryItem.count({ where: { invitation_id: inv.id } });
            if (itinExists === 0) {
                await ItineraryItem.create({ id: uuidv4(), invitation_id: inv.id, time: '11:00 AM', activity: 'Ketibaan Tetamu' });
                await ItineraryItem.create({ id: uuidv4(), invitation_id: inv.id, time: '12:30 PM', activity: 'Ketibaan Pengantin & Makan Beradab' });
                await ItineraryItem.create({ id: uuidv4(), invitation_id: inv.id, time: '04:00 PM', activity: 'Majlis Bersurai' });
            }
        }

        console.log('✨ Enriched Seed completed successfully!');
    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
};

if (require.main === module) {
    seedSampleInvitations().then(() => process.exit(0)).catch(() => process.exit(1));
}
