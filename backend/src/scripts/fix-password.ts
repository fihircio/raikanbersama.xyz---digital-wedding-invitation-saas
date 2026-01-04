import { User } from '../models';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { initializeDatabase } from '../config/database';

/**
 * Fix user password
 * Updates the password for the free@example.com account
 */
export const fixUserPassword = async (): Promise<void> => {
  try {
    logger.info('Fixing user password...');

    // Initialize database connection
    await initializeDatabase();

    // Find the free user
    const user = await User.findOne({ where: { email: 'free@example.com' } });
    
    if (!user) {
      logger.error('User free@example.com not found');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Update the user password
    await user.update({ password: hashedPassword });
    
    logger.info('Password updated successfully for free@example.com');
  } catch (error) {
    logger.error('Error fixing user password:', error);
    throw error;
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  fixUserPassword()
    .then(() => {
      logger.info('Password fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Password fix failed:', error);
      process.exit(1);
    });
}