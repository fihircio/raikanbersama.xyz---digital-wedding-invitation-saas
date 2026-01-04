import { seedDatabase } from '../seeders';
import { connectDatabase, closeDatabase, initializeDatabase } from '../config/database';
import { initializeModels } from '../models';
import sequelize from '../config/database';
import logger from '../utils/logger';

/**
 * Seed script
 * Runs database seeder
 */
const runSeeder = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Initialize models before seeding
    initializeModels(sequelize);
    
    // Run seeder
    await seedDatabase();
    
    // Close connection
    await closeDatabase();
    
    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error running seeder:', error);
    process.exit(1);
  }
};

// Run seeder
runSeeder();