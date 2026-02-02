import { Router } from 'express';
import passport from 'passport';
import {
  googleCallback,
  handleOAuthCallback
} from '../controllers/oauthController';

const router = Router();

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
