import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'raikanbersama',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: 'postgres' as const,
  ssl: process.env.DB_SSL === 'true',
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    acquire: 30000,
    idle: 10000
  },
  logging: (msg: string) => logger.debug(msg),
  // Disable timezone parsing for now to avoid issues
  timezone: '+00:00'
};

// Alternative: Use full connection string if provided
const databaseUrl = process.env.DATABASE_URL;

// Create Sequelize instance
const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      ssl: process.env.DB_SSL === 'true',
      pool: dbConfig.pool,
      logging: dbConfig.logging,
      timezone: dbConfig.timezone
    })
  : new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      dbConfig
    );

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    // In development, don't exit the process if database doesn't exist yet
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Database connection failed in development mode. Please ensure PostgreSQL is running and the database exists.');
      return;
    }
    process.exit(1);
  }
};

// Initialize database (sync models)
export const initializeDatabase = async (): Promise<void> => {
  try {
    // In production, we should use migrations instead of sync
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running in production mode - skipping auto-sync');
      return;
    }

    // Sync all models with database
    await sequelize.sync({ force: true });
    logger.info('Database synchronized successfully.');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed.');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

export default sequelize;