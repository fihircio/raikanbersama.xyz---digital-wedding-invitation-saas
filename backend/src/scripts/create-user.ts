import { User } from '../models';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { initializeDatabase } from '../config/database';
import { MembershipTier } from '../types/models';

/**
 * Create a new user with proper password
 */
export const createTestUser = async (): Promise<void> => {
  try {
    logger.info('Creating test user...');

    // Initialize database connection
    await initializeDatabase();

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create the user
    const user = await User.create({
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      membership_tier: MembershipTier.FREE,
      email_verified: true,
    });
    
    logger.info(`Test user created successfully with ID: ${user.id}`);
    logger.info('You can now login with:');
    logger.info('Email: test@example.com');
    logger.info('Password: password123');
  } catch (error) {
    logger.error('Error creating test user:', error);
    throw error;
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  createTestUser()
    .then(() => {
      logger.info('User creation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('User creation failed:', error);
      process.exit(1);
    });
}