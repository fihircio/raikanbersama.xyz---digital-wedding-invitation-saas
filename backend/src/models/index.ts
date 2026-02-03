import { Sequelize } from 'sequelize';
import { User } from './User';
import { Invitation } from './Invitation';
import { RSVP } from './RSVP';
import { GuestWish } from './GuestWish';
import { ItineraryItem } from './ItineraryItem';
import { ContactPerson } from './ContactPerson';
import { BackgroundImage } from './BackgroundImage';
import { Gallery } from './Gallery';
import { Favorite } from './Favorite';
import { Order } from './Order';
import { Affiliate } from './Affiliate';
import { ContactMessage } from './ContactMessage';
import { Coupon } from './Coupon';

const models = {
  User,
  Invitation,
  RSVP,
  GuestWish,
  ItineraryItem,
  ContactPerson,
  BackgroundImage,
  Gallery,
  Favorite,
  Order,
  Affiliate,
  ContactMessage,
  Coupon
};

// Setup model associations
export const setupAssociations = (): void => {
  const { User, Invitation, RSVP, GuestWish, ItineraryItem, ContactPerson, Gallery, Favorite, BackgroundImage, Order, Affiliate, ContactMessage, Coupon } = models;

  // User has many Invitations
  User.hasMany(Invitation, {
    foreignKey: 'user_id',
    as: 'invitations'
  });
  Invitation.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Invitation has many RSVPs
  Invitation.hasMany(RSVP, {
    foreignKey: 'invitation_id',
    as: 'rsvps'
  });
  RSVP.belongsTo(Invitation, {
    foreignKey: 'invitation_id',
    as: 'invitation'
  });

  // Invitation has many GuestWishes
  Invitation.hasMany(GuestWish, {
    foreignKey: 'invitation_id',
    as: 'guestWishes'
  });
  GuestWish.belongsTo(Invitation, {
    foreignKey: 'invitation_id',
    as: 'invitation'
  });

  // Invitation has many ItineraryItems
  Invitation.hasMany(ItineraryItem, {
    foreignKey: 'invitation_id',
    as: 'itinerary'
  });
  ItineraryItem.belongsTo(Invitation, {
    foreignKey: 'invitation_id',
    as: 'invitation'
  });

  // Invitation has many ContactPersons
  Invitation.hasMany(ContactPerson, {
    foreignKey: 'invitation_id',
    as: 'contacts'
  });
  ContactPerson.belongsTo(Invitation, {
    foreignKey: 'invitation_id',
    as: 'invitation'
  });

  // Invitation has many Gallery items
  Invitation.hasMany(Gallery, {
    foreignKey: 'invitation_id',
    as: 'gallery'
  });
  Gallery.belongsTo(Invitation, {
    foreignKey: 'invitation_id',
    as: 'invitation'
  });

  // User has many Favorites
  User.hasMany(Favorite, {
    foreignKey: 'user_id',
    as: 'favorites'
  });
  Favorite.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // BackgroundImage has many Favorites
  BackgroundImage.hasMany(Favorite, {
    foreignKey: 'background_image_id',
    as: 'favorites'
  });
  Favorite.belongsTo(BackgroundImage, {
    foreignKey: 'background_image_id',
    as: 'backgroundImage'
  });

  // User has many Orders
  User.hasMany(Order, {
    foreignKey: 'user_id',
    as: 'orders'
  });
  Order.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Invitation has many Orders
  Invitation.hasMany(Order, {
    foreignKey: 'invitation_id',
    as: 'orders'
  });
  Order.belongsTo(Invitation, {
    foreignKey: 'invitation_id',
    as: 'invitation'
  });

  // User has one Affiliate profile (optional)
  User.hasOne(Affiliate, {
    foreignKey: 'user_id',
    as: 'affiliateProfile'
  });
  Affiliate.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Affiliate has many Coupons
  Affiliate.hasMany(Coupon, {
    foreignKey: 'affiliate_id',
    as: 'coupons'
  });
  Coupon.belongsTo(Affiliate, {
    foreignKey: 'affiliate_id',
    as: 'affiliate'
  });

  // Coupon has many Orders
  Coupon.hasMany(Order, {
    foreignKey: 'coupon_id',
    as: 'orders'
  });
  Order.belongsTo(Coupon, {
    foreignKey: 'coupon_id',
    as: 'coupon'
  });
};

// Initialize all models
export const initializeModels = (sequelize: Sequelize): typeof models => {
  // Initialize each model
  Object.values(models).forEach(model => {
    model.initialize(sequelize);
  });

  // Setup associations
  setupAssociations();

  return models;
};

// Export all models
export {
  User,
  Invitation,
  RSVP,
  GuestWish,
  ItineraryItem,
  ContactPerson,
  BackgroundImage,
  Gallery,
  Favorite,
  Order,
  Affiliate,
  ContactMessage,
  Coupon
};

export default models;