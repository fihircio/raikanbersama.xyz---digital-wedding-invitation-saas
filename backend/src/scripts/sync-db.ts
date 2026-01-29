import sequelize from '../config/database';
import { initializeModels } from '../models';
import logger from '../utils/logger';

/**
 * Sync Database Script
 * This script is used to manually synchronize the database models with the database tables.
 * Useful for the first-time setup in production or when models are updated.
 */
const syncDatabase = async () => {
    try {
        logger.info('Starting manual database synchronization...');

        // Initialize models
        initializeModels(sequelize);

        // Test connection
        await sequelize.authenticate();
        logger.info('Database connection established.');

        // Sync all models
        // alter: true adds missing columns/tables without dropping data
        await sequelize.sync({ alter: true });

        logger.info('Database synchronized successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Error synchronizing database:', error);
        process.exit(1);
    }
};

// Start sync
syncDatabase();
