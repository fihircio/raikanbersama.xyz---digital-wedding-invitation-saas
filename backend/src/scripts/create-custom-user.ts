import { User } from '../models';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { initializeDatabase } from '../config/database';
import { MembershipTier } from '../types/models';

// Get command line arguments
const args = process.argv.slice(2);
const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'testuser@example.com';
const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'Password123';

/**
 * Create a new user with specified email and password
 */
export const createCustomUser = async (userEmail: string, userPassword: string): Promise<void> => {
  try {
    logger.info(`Creating user with email: ${userEmail}`);

    // Initialize database connection
    await initializeDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userEmail } });
    if (existingUser) {
      logger.info(`User with email ${userEmail} already exists`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    
    // Create the user
    const user = await User.create({
      email: userEmail,
      name: 'Test User',
      password: hashedPassword,
      membership_tier: MembershipTier.FREE,
      email_verified: true,
    });
    
    logger.info(`User created successfully with ID: ${user.id}`);
    logger.info('Login credentials:');
    logger.info(`Email: ${userEmail}`);
    logger.info(`Password: ${userPassword}`);
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  createCustomUser(email, password)
    .then(() => {
      logger.info('User creation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('User creation failed:', error);
      process.exit(1);
    });
}