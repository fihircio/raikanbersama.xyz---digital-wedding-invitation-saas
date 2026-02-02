import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import config from './index';

// Google OAuth configuration
const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${config.frontendUrl}/api/users/auth/google/callback`,
};

// Google profile interface
export interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
  provider: string;
  _json: any;
}

/**
 * Configure Passport Google OAuth Strategy
 * This function should be called after database connection is established
 */
export const configureGoogleStrategy = (
  findOrCreateUser: (profile: GoogleProfile) => Promise<any>
): void => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleOAuthConfig.clientID,
        clientSecret: googleOAuthConfig.clientSecret,
        callbackURL: googleOAuthConfig.callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void
      ) => {
        try {
          // Find or create user based on Google profile
          const user = await findOrCreateUser(profile as GoogleProfile);
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
};

/**
 * Serialize user for session
 */
passport.serializeUser((user: any, done: (error: any, id?: any) => void) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id: string, done: (error: any, user?: any) => void) => {
  try {
    // This will be implemented when we have the database service available
    // For now, we'll pass the id and let the controller handle it
    done(null, { id });
  } catch (error) {
    done(error as Error, undefined);
  }
});

/**
 * Get Google OAuth configuration
 */
export const getGoogleOAuthConfig = () => googleOAuthConfig;

/**
 * Check if Google OAuth is properly configured
 */
export const isGoogleOAuthConfigured = (): boolean => {
  return !!(googleOAuthConfig.clientID && googleOAuthConfig.clientSecret);
};

export default passport;
