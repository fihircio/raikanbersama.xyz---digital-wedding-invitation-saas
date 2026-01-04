import { Router } from 'express';

const router = Router();

/**
 * API Documentation
 * @route GET /api/docs
 * @access Public
 */
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  
  const documentation = {
    title: 'RaikanBersama.xyz API Documentation',
    version: '1.0.0',
    description: 'RESTful API for RaikanBersama.xyz digital wedding invitation SaaS platform',
    baseUrl,
    endpoints: {
      authentication: {
        title: 'Authentication',
        description: 'User authentication and profile management',
        endpoints: [
          {
            method: 'POST',
            path: '/users/register',
            description: 'Register a new user account',
            parameters: {
              email: {
                type: 'string',
                required: true,
                description: 'User email address',
                format: 'email'
              },
              name: {
                type: 'string',
                required: true,
                description: 'User full name',
                format: 'text'
              },
              password: {
                type: 'string',
                required: true,
                description: 'User password (min 8 characters, must contain uppercase, lowercase, and number)',
                format: 'password'
              }
            },
            response: {
              success: true,
              data: {
                user: 'User object without password',
                token: 'JWT authentication token'
              }
            }
          },
          {
            method: 'POST',
            path: '/users/login',
            description: 'Login with email and password',
            parameters: {
              email: {
                type: 'string',
                required: true,
                description: 'User email address',
                format: 'email'
              },
              password: {
                type: 'string',
                required: true,
                description: 'User password',
                format: 'password'
              }
            },
            response: {
              success: true,
              data: {
                user: 'User object without password',
                token: 'JWT authentication token'
              }
            }
          },
          {
            method: 'GET',
            path: '/users/profile',
            description: 'Get current user profile',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            response: {
              success: true,
              data: 'User profile object'
            }
          },
          {
            method: 'PUT',
            path: '/users/profile',
            description: 'Update user profile',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              name: {
                type: 'string',
                description: 'Updated user name',
                format: 'text'
              },
              email: {
                type: 'string',
                description: 'Updated user email',
                format: 'email'
              }
            },
            response: {
              success: true,
              data: 'Updated user profile'
            }
          },
          {
            method: 'PUT',
            path: '/users/password',
            description: 'Change user password',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              currentPassword: {
                type: 'string',
                required: true,
                description: 'Current user password',
                format: 'password'
              },
              newPassword: {
                type: 'string',
                required: true,
                description: 'New user password (min 8 characters, must contain uppercase, lowercase, and number)',
                format: 'password'
              }
            },
            response: {
              success: true,
              message: 'Password changed successfully'
            }
          }
        ]
      },
      invitations: {
        title: 'Invitations',
        description: 'Wedding invitation management',
        endpoints: [
          {
            method: 'GET',
            path: '/invitations',
            description: 'Get all user invitations with pagination and filtering',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                format: 'integer'
              },
              limit: {
                type: 'number',
                description: 'Items per page (default: 10, max: 100)',
                format: 'integer'
              },
              search: {
                type: 'string',
                description: 'Search term for filtering',
                format: 'text'
              },
              sortBy: {
                type: 'string',
                description: 'Sort field (created_at, updated_at, event_date, bride_name, groom_name, slug, event_type)',
                format: 'text'
              },
              sortOrder: {
                type: 'string',
                description: 'Sort order (asc, desc)',
                format: 'text'
              },
              event_type: {
                type: 'string',
                description: 'Filter by event type',
                format: 'text'
              },
              is_published: {
                type: 'boolean',
                description: 'Filter by published status',
                format: 'boolean'
              }
            },
            response: {
              success: true,
              data: 'Array of invitation objects',
              pagination: 'Pagination metadata'
            }
          },
          {
            method: 'GET',
            path: '/invitations/:id',
            description: 'Get invitation by ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Invitation object'
            }
          },
          {
            method: 'GET',
            path: '/invitations/slug/:slug',
            description: 'Get invitation by slug (public access)',
            parameters: {
              slug: {
                type: 'string',
                required: true,
                description: 'Invitation slug',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Invitation object'
            }
          },
          {
            method: 'POST',
            path: '/invitations',
            description: 'Create new invitation',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              slug: {
                type: 'string',
                required: true,
                description: 'Unique invitation slug (lowercase, numbers, hyphens)',
                format: 'text'
              },
              template_id: {
                type: 'string',
                required: true,
                description: 'Template ID',
                format: 'text'
              },
              event_type: {
                type: 'string',
                required: true,
                description: 'Event type (Walimatulurus, Majlis Tunang, Majlis Persandingan, Others)',
                format: 'text'
              },
              bride_name: {
                type: 'string',
                required: true,
                description: 'Bride name',
                format: 'text'
              },
              groom_name: {
                type: 'string',
                required: true,
                description: 'Groom name',
                format: 'text'
              },
              host_names: {
                type: 'string',
                required: true,
                description: 'Host names',
                format: 'text'
              },
              event_date: {
                type: 'string',
                required: true,
                description: 'Event date (YYYY-MM-DD)',
                format: 'date'
              },
              start_time: {
                type: 'string',
                required: true,
                description: 'Start time (HH:MM)',
                format: 'text'
              },
              end_time: {
                type: 'string',
                required: true,
                description: 'End time (HH:MM)',
                format: 'text'
              },
              location_name: {
                type: 'string',
                required: true,
                description: 'Location name',
                format: 'text'
              },
              address: {
                type: 'string',
                required: true,
                description: 'Event address',
                format: 'text'
              },
              google_maps_url: {
                type: 'string',
                required: true,
                description: 'Google Maps URL',
                format: 'url'
              },
              waze_url: {
                type: 'string',
                required: true,
                description: 'Waze URL',
                format: 'url'
              }
            },
            response: {
              success: true,
              data: 'Created invitation object'
            }
          },
          {
            method: 'PUT',
            path: '/invitations/:id',
            description: 'Update invitation',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Updated invitation object'
            }
          },
          {
            method: 'DELETE',
            path: '/invitations/:id',
            description: 'Delete invitation',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              message: 'Invitation deleted successfully'
            }
          }
        ]
      },
      rsvps: {
        title: 'RSVPs',
        description: 'RSVP management',
        endpoints: [
          {
            method: 'GET',
            path: '/rsvps',
            description: 'Get all RSVPs with pagination and filtering',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                format: 'integer'
              },
              limit: {
                type: 'number',
                description: 'Items per page (default: 10, max: 100)',
                format: 'integer'
              },
              search: {
                type: 'string',
                description: 'Search term for filtering',
                format: 'text'
              },
              sortBy: {
                type: 'string',
                description: 'Sort field (created_at, guest_name, phone_number, is_attending, pax)',
                format: 'text'
              },
              sortOrder: {
                type: 'string',
                description: 'Sort order (asc, desc)',
                format: 'text'
              },
              invitation_id: {
                type: 'string',
                description: 'Filter by invitation ID',
                format: 'text'
              },
              is_attending: {
                type: 'boolean',
                description: 'Filter by attendance status',
                format: 'boolean'
              }
            },
            response: {
              success: true,
              data: 'Array of RSVP objects',
              pagination: 'Pagination metadata'
            }
          },
          {
            method: 'GET',
            path: '/rsvps/:id',
            description: 'Get RSVP by ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'RSVP ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'RSVP object'
            }
          },
          {
            method: 'GET',
            path: '/rsvps/invitation/:invitationId',
            description: 'Get RSVPs by invitation ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of RSVP objects'
            }
          },
          {
            method: 'POST',
            path: '/rsvps',
            description: 'Create new RSVP (public access)',
            parameters: {
              invitation_id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              guest_name: {
                type: 'string',
                required: true,
                description: 'Guest name',
                format: 'text'
              },
              pax: {
                type: 'number',
                required: true,
                description: 'Number of guests (0-20)',
                format: 'integer'
              },
              is_attending: {
                type: 'boolean',
                required: true,
                description: 'Attendance status',
                format: 'boolean'
              },
              phone_number: {
                type: 'string',
                required: true,
                description: 'Phone number (Malaysian format)',
                format: 'text'
              },
              message: {
                type: 'string',
                description: 'Optional message',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Created RSVP object'
            }
          },
          {
            method: 'PUT',
            path: '/rsvps/:id',
            description: 'Update RSVP',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'RSVP ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Updated RSVP object'
            }
          },
          {
            method: 'DELETE',
            path: '/rsvps/:id',
            description: 'Delete RSVP',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'RSVP ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              message: 'RSVP deleted successfully'
            }
          }
        ]
      },
      guestWishes: {
        title: 'Guest Wishes',
        description: 'Guest wish management',
        endpoints: [
          {
            method: 'GET',
            path: '/guest-wishes',
            description: 'Get all guest wishes with pagination',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                format: 'integer'
              },
              limit: {
                type: 'number',
                description: 'Items per page (default: 10, max: 100)',
                format: 'integer'
              },
              invitation_id: {
                type: 'string',
                description: 'Filter by invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of guest wish objects',
              pagination: 'Pagination metadata'
            }
          },
          {
            method: 'GET',
            path: '/guest-wishes/:id',
            description: 'Get guest wish by ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Guest wish ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Guest wish object'
            }
          },
          {
            method: 'GET',
            path: '/guest-wishes/invitation/:invitationId',
            description: 'Get guest wishes by invitation ID (public access)',
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of guest wish objects'
            }
          },
          {
            method: 'POST',
            path: '/guest-wishes',
            description: 'Create new guest wish (public access)',
            parameters: {
              invitation_id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              name: {
                type: 'string',
                required: true,
                description: 'Guest name',
                format: 'text'
              },
              message: {
                type: 'string',
                required: true,
                description: 'Guest message (5-500 characters)',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Created guest wish object'
            }
          },
          {
            method: 'DELETE',
            path: '/guest-wishes/:id',
            description: 'Delete guest wish',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Guest wish ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              message: 'Guest wish deleted successfully'
            }
          }
        ]
      },
      itinerary: {
        title: 'Itinerary Items',
        description: 'Wedding itinerary management',
        endpoints: [
          {
            method: 'GET',
            path: '/itinerary/invitation/:invitationId',
            description: 'Get itinerary items by invitation ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of itinerary items (sorted by time)'
            }
          },
          {
            method: 'GET',
            path: '/itinerary/:id',
            description: 'Get itinerary item by ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Itinerary item ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Itinerary item object'
            }
          },
          {
            method: 'POST',
            path: '/itinerary',
            description: 'Create new itinerary item',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitation_id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              time: {
                type: 'string',
                required: true,
                description: 'Time (HH:MM format)',
                format: 'text'
              },
              activity: {
                type: 'string',
                required: true,
                description: 'Activity description',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Created itinerary item object'
            }
          },
          {
            method: 'PUT',
            path: '/itinerary/:id',
            description: 'Update itinerary item',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Itinerary item ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Updated itinerary item object'
            }
          },
          {
            method: 'DELETE',
            path: '/itinerary/:id',
            description: 'Delete itinerary item',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Itinerary item ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              message: 'Itinerary item deleted successfully'
            }
          }
        ]
      },
      contactPersons: {
        title: 'Contact Persons',
        description: 'Contact person management',
        endpoints: [
          {
            method: 'GET',
            path: '/contact-persons/invitation/:invitationId',
            description: 'Get contact persons by invitation ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of contact person objects'
            }
          },
          {
            method: 'GET',
            path: '/contact-persons/:id',
            description: 'Get contact person by ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Contact person ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Contact person object'
            }
          },
          {
            method: 'POST',
            path: '/contact-persons',
            description: 'Create new contact person',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitation_id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              name: {
                type: 'string',
                required: true,
                description: 'Contact person name',
                format: 'text'
              },
              relation: {
                type: 'string',
                required: true,
                description: 'Relation to couple',
                format: 'text'
              },
              phone: {
                type: 'string',
                required: true,
                description: 'Phone number (Malaysian format)',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Created contact person object'
            }
          },
          {
            method: 'PUT',
            path: '/contact-persons/:id',
            description: 'Update contact person',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Contact person ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Updated contact person object'
            }
          },
          {
            method: 'DELETE',
            path: '/contact-persons/:id',
            description: 'Delete contact person',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Contact person ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              message: 'Contact person deleted successfully'
            }
          }
        ]
      },
      gallery: {
        title: 'Gallery Images',
        description: 'Gallery image management',
        endpoints: [
          {
            method: 'GET',
            path: '/gallery/invitation/:invitationId',
            description: 'Get gallery images by invitation ID',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of image URLs'
            }
          },
          {
            method: 'POST',
            path: '/gallery',
            description: 'Add image to gallery',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitation_id: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              url: {
                type: 'string',
                required: true,
                description: 'Image URL',
                format: 'url'
              }
            },
            response: {
              success: true,
              data: 'Added image URL'
            }
          },
          {
            method: 'DELETE',
            path: '/gallery/:invitationId/:imageIndex',
            description: 'Remove image from gallery',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              imageIndex: {
                type: 'string',
                required: true,
                description: 'Image index (0-based)',
                format: 'text'
              }
            },
            response: {
              success: true,
              message: 'Gallery image removed successfully'
            }
          },
          {
            method: 'PUT',
            path: '/gallery/:invitationId',
            description: 'Update gallery images (replace entire gallery)',
            headers: {
              Authorization: 'Bearer JWT token'
            },
            parameters: {
              invitationId: {
                type: 'string',
                required: true,
                description: 'Invitation ID',
                format: 'text'
              },
              gallery: {
                type: 'array',
                required: true,
                description: 'Array of image URLs',
                format: 'array'
              }
            },
            response: {
              success: true,
              data: 'Updated gallery'
            }
          }
        ]
      },
      backgrounds: {
        title: 'Background Images',
        description: 'Background image catalog',
        endpoints: [
          {
            method: 'GET',
            path: '/backgrounds',
            description: 'Get all background images with pagination and filtering',
            parameters: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                format: 'integer'
              },
              limit: {
                type: 'number',
                description: 'Items per page (default: 10, max: 100)',
                format: 'integer'
              },
              search: {
                type: 'string',
                description: 'Search term for filtering',
                format: 'text'
              },
              sortBy: {
                type: 'string',
                description: 'Sort field (name, category, isPremium)',
                format: 'text'
              },
              sortOrder: {
                type: 'string',
                description: 'Sort order (asc, desc)',
                format: 'text'
              },
              category: {
                type: 'string',
                description: 'Filter by category (popular, minimalist, elegant, floral)',
                format: 'text'
              },
              isPremium: {
                type: 'boolean',
                description: 'Filter by premium status',
                format: 'boolean'
              }
            },
            response: {
              success: true,
              data: 'Array of background image objects',
              pagination: 'Pagination metadata'
            }
          },
          {
            method: 'GET',
            path: '/backgrounds/:id',
            description: 'Get background image by ID',
            parameters: {
              id: {
                type: 'string',
                required: true,
                description: 'Background image ID',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Background image object'
            }
          },
          {
            method: 'GET',
            path: '/backgrounds/category/:category',
            description: 'Get background images by category',
            parameters: {
              category: {
                type: 'string',
                required: true,
                description: 'Category (popular, minimalist, elegant, floral)',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of background image objects',
              pagination: 'Pagination metadata'
            }
          },
          {
            method: 'GET',
            path: '/backgrounds/premium',
            description: 'Get premium background images',
            parameters: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                format: 'integer'
              },
              limit: {
                type: 'number',
                description: 'Items per page (default: 10, max: 100)',
                format: 'integer'
              },
              search: {
                type: 'string',
                description: 'Search term for filtering',
                format: 'text'
              },
              sortBy: {
                type: 'string',
                description: 'Sort field (name, category, isPremium)',
                format: 'text'
              },
              sortOrder: {
                type: 'string',
                description: 'Sort order (asc, desc)',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of premium background image objects',
              pagination: 'Pagination metadata'
            }
          },
          {
            method: 'GET',
            path: '/backgrounds/free',
            description: 'Get free background images',
            parameters: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                format: 'integer'
              },
              limit: {
                type: 'number',
                description: 'Items per page (default: 10, max: 100)',
                format: 'integer'
              },
              search: {
                type: 'string',
                description: 'Search term for filtering',
                format: 'text'
              },
              sortBy: {
                type: 'string',
                description: 'Sort field (name, category, isPremium)',
                format: 'text'
              },
              sortOrder: {
                type: 'string',
                description: 'Sort order (asc, desc)',
                format: 'text'
              }
            },
            response: {
              success: true,
              data: 'Array of free background image objects',
              pagination: 'Pagination metadata'
            }
          }
        ]
      }
    },
    authentication: {
      title: 'Authentication',
      description: 'All API endpoints require JWT token except where noted',
      type: 'Bearer JWT token'
    },
    errors: {
      title: 'Error Responses',
      description: 'Standard error response format',
      format: {
        success: 'boolean',
        error: 'string',
        details: 'array of validation errors (if applicable)'
      }
    },
    pagination: {
      title: 'Pagination',
      description: 'List endpoints support pagination',
      format: {
        page: 'Current page number (starting from 1)',
        limit: 'Number of items per page',
        total: 'Total number of items',
        pages: 'Total number of pages',
        hasNext: 'Whether next page exists',
        hasPrev: 'Whether previous page exists',
        nextPage: 'Next page number (if exists)',
        prevPage: 'Previous page number (if exists)'
      }
    }
  };

  res.status(200).json(documentation);
});

export default router;