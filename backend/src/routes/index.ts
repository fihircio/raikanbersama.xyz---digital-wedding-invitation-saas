import { Router } from 'express';
import healthRoutes from './health';
import userRoutes from './users';
import invitationRoutes from './invitations';
import rsvpRoutes from './rsvps';
import guestWishRoutes from './guest-wishes';
import itineraryRoutes from './itinerary';
import contactPersonRoutes from './contact-persons';
import galleryRoutes from './gallery';
import backgroundRoutes from './backgrounds';
import fileRoutes from './files';
import favoriteRoutes from './favorites';
import profileRoutes from './profile';
import orderRoutes from './orders';
import paymentRoutes from './payments';
import docsRoutes from './docs';

const router = Router();

router.use('/health', healthRoutes);
router.use('/docs', docsRoutes);
router.use('/users', userRoutes);
router.use('/invitations', invitationRoutes);
router.use('/rsvps', rsvpRoutes);
router.use('/guest-wishes', guestWishRoutes);
router.use('/itinerary', itineraryRoutes);
router.use('/contact-persons', contactPersonRoutes);
router.use('/gallery', galleryRoutes);
router.use('/backgrounds', backgroundRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/profile', profileRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/files', fileRoutes);

// API version and info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RaikanBersama.xyz API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login'
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PUT /api/profile',
        changePassword: 'PUT /api/profile/password'
      },
      orders: {
        getAll: 'GET /api/orders',
        getById: 'GET /api/orders/:id'
      },
      invitations: {
        getAll: 'GET /api/invitations',
        getById: 'GET /api/invitations/:id',
        getBySlug: 'GET /api/invitations/slug/:slug',
        create: 'POST /api/invitations',
        update: 'PUT /api/invitations/:id',
        delete: 'DELETE /api/invitations/:id'
      },
      rsvps: {
        getAll: 'GET /api/rsvps',
        getById: 'GET /api/rsvps/:id',
        getByInvitationId: 'GET /api/rsvps/invitation/:invitationId',
        create: 'POST /api/rsvps',
        update: 'PUT /api/rsvps/:id',
        delete: 'DELETE /api/rsvps/:id'
      },
      guestWishes: {
        getAll: 'GET /api/guest-wishes',
        getById: 'GET /api/guest-wishes/:id',
        getByInvitationId: 'GET /api/guest-wishes/invitation/:invitationId',
        create: 'POST /api/guest-wishes',
        delete: 'DELETE /api/guest-wishes/:id'
      },
      itinerary: {
        getByInvitationId: 'GET /api/itinerary/invitation/:invitationId',
        getById: 'GET /api/itinerary/:id',
        create: 'POST /api/itinerary',
        update: 'PUT /api/itinerary/:id',
        delete: 'DELETE /api/itinerary/:id'
      },
      contactPersons: {
        getByInvitationId: 'GET /api/contact-persons/invitation/:invitationId',
        getById: 'GET /api/contact-persons/:id',
        create: 'POST /api/contact-persons',
        update: 'PUT /api/contact-persons/:id',
        delete: 'DELETE /api/contact-persons/:id'
      },
      gallery: {
        getByInvitationId: 'GET /api/gallery/invitation/:invitationId',
        add: 'POST /api/gallery',
        remove: 'DELETE /api/gallery/:invitationId/:imageIndex',
        update: 'PUT /api/gallery/:invitationId'
      },
      backgrounds: {
        getAll: 'GET /api/backgrounds',
        getById: 'GET /api/backgrounds/:id',
        getByCategory: 'GET /api/backgrounds/category/:category',
        getPremium: 'GET /api/backgrounds/premium',
        getFree: 'GET /api/backgrounds/free'
      },
      favorites: {
        getAll: 'GET /api/favorites',
        add: 'POST /api/favorites',
        remove: 'DELETE /api/favorites/:backgroundId',
        check: 'GET /api/favorites/check/:backgroundId'
      },
      files: {
        uploadGalleryImage: 'POST /api/files/gallery',
        uploadMultipleGalleryImages: 'POST /api/files/gallery/multiple',
        uploadQrCode: 'POST /api/files/qr-code',
        uploadBackgroundImage: 'POST /api/files/background',
        deleteFile: 'DELETE /api/files/:key',
        getSignedUrl: 'GET /api/files/signed-url/:key'
      }
    }
  });
});

export default router;