import { Router, RequestHandler } from 'express';
import passport from 'passport';
import { authenticate } from '../middleware/auth';
import { createSecureRoute } from '../middleware/securityMiddleware';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail
} from '../controllers/userController';
import {
  googleCallback,
  handleOAuthCallback
} from '../controllers/oauthController';

const router = Router();

// Configure Google OAuth strategy
// This needs to be called after database connection is established
// We'll configure it in server.ts and pass the handler function

// Validation schemas
const registerSchema = {
  email: {
    type: 'string',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!value) return true;
      return value.length <= 255 || 'Email must be at most 255 characters long';
    }
  },
  name: {
    type: 'string',
    required: true,
    min: 2,
    max: 100
  },
  password: {
    type: 'string',
    required: true,
    min: 8,
    max: 128,
    custom: (value: string) => {
      if (!value) return true;
      // Check for at least one uppercase letter
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      // Check for at least one lowercase letter
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      // Check for at least one number
      if (!/\d/.test(value)) {
        return 'Password must contain at least one number';
      }
      return true;
    }
  }
};

const loginSchema = {
  email: {
    type: 'string',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: 'string',
    required: true
  }
};

const updateProfileSchema = {
  email: {
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!value) return true;
      return value.length <= 255 || 'Email must be at most 255 characters long';
    }
  },
  name: {
    type: 'string',
    min: 2,
    max: 100
  }
};

const changePasswordSchema = {
  currentPassword: {
    type: 'string',
    required: true
  },
  newPassword: {
    type: 'string',
    required: true,
    min: 8,
    max: 128,
    custom: (value: string) => {
      if (!value) return true;
      // Check for at least one uppercase letter
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      // Check for at least one lowercase letter
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      // Check for at least one number
      if (!/\d/.test(value)) {
        return 'Password must contain at least one number';
      }
      return true;
    }
  }
};

const refreshTokenSchema = {
  refreshToken: {
    type: 'string',
    required: true
  }
};

const forgotPasswordSchema = {
  email: {
    type: 'string',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

const resetPasswordSchema = {
  token: {
    type: 'string',
    required: true
  },
  newPassword: {
    type: 'string',
    required: true,
    min: 8,
    max: 128,
    custom: (value: string) => {
      if (!value) return true;
      // Check for at least one uppercase letter
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      // Check for at least one lowercase letter
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      // Check for at least one number
      if (!/\d/.test(value)) {
        return 'Password must contain at least one number';
      }
      return true;
    }
  }
};

const verifyEmailSchema = {
  token: {
    type: 'string',
    required: true
  }
};

/**
 * @route POST /api/users/register
 * @access Public
 */
router.post('/register', createSecureRoute('auth', { body: registerSchema }), register);

/**
 * @route POST /api/users/login
 * @access Public
 */
router.post('/login', createSecureRoute('auth', { body: loginSchema }), login);

/**
 * @route GET /api/users/profile
 * @access Private
 */
router.get('/profile', createSecureRoute('profile'), getProfile);

/**
 * @route PUT /api/users/profile
 * @access Private
 */
router.put('/profile', createSecureRoute('profile', { body: updateProfileSchema }), updateProfile);

/**
 * @route PUT /api/users/password
 * @access Private
 */
router.put('/password', createSecureRoute('profile', { body: changePasswordSchema }), changePassword);

/**
 * @route POST /api/users/refresh
 * @access Public
 */
router.post('/refresh', createSecureRoute('auth', { body: refreshTokenSchema }), refreshToken);

/**
 * @route POST /api/users/logout
 * @access Private
 */
router.post('/logout', createSecureRoute('profile'), logout);

/**
 * @route POST /api/users/forgot-password
 * @access Public
 */
router.post('/forgot-password', createSecureRoute('auth', { body: forgotPasswordSchema }), forgotPassword);

/**
 * @route POST /api/users/reset-password
 * @access Public
 */
router.post('/reset-password', createSecureRoute('auth', { body: resetPasswordSchema }), resetPassword);

/**
 * @route POST /api/users/send-verification
 * @access Private
 */
router.post('/send-verification', createSecureRoute('profile'), sendEmailVerification);

/**
 * @route POST /api/users/verify-email
 * @access Public
 */
router.post('/verify-email', createSecureRoute('auth', { body: verifyEmailSchema }), verifyEmail);

/**
 * @route GET /api/users/auth/google
 * @access Public
 * Initiates Google OAuth flow
 */
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route GET /api/users/auth/google/callback
 * @access Public
 * Handles Google OAuth callback
 */
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  googleCallback
);

/**
 * @route POST /api/users/oauth/callback
 * @access Public
 * Handles OAuth callback from frontend
 */
router.post('/oauth/callback', handleOAuthCallback);

export default router;