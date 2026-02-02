console.log('--- SERVER STARTING ---');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import fs from 'fs';

import config from './config';
import logger from './utils/logger';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';
import { startTokenCleanup } from './utils/tokenCleanup';
import fileCleanupService from './services/fileCleanupService';
import { connectDatabase, initializeDatabase, closeDatabase } from './config/database';
import { initializeModels } from './models';
import sequelize from './config/database';
import { securityHeaders } from './middleware/securityMiddleware';
import { configureGoogleStrategy } from './config/googleOAuth';
import authService from './services/authService';
import databaseService from './services/databaseService';


// Create Express app
const app = express();

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Enhanced security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Custom security headers
app.use(securityHeaders);

// CORS configuration
// Support comma-separated frontend URLs for multiple domains
const frontendUrls = config.frontendUrl
  ? config.frontendUrl.split(',').map(url => url.trim())
  : [];

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...frontendUrls
].filter((origin, index, self) => origin && self.indexOf(origin) === index); // Remove duplicates and empty values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
}));

// Enhanced rate limiting with multiple strategies
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes
  max: config.rateLimitMaxRequests, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
  }
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session middleware for Passport OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Compression middleware
app.use(compression());

// HTTP request logger
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));


// API routes
app.use(config.apiPrefix, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RaikanBersama.xyz API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      api: `${config.apiPrefix}`,
      documentation: `${config.apiPrefix}/docs`
    }
  });
});

import { generateCSRFToken } from './middleware/csrf';

// Health check endpoint (outside API prefix)
app.get('/health', generateCSRFToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  let databaseConnected = false;

  try {
    // Connect to database
    await connectDatabase();
    databaseConnected = true;

    // Initialize models
    initializeModels(sequelize);

    // Initialize database (create tables if they don't exist)
    await initializeDatabase();

    // Configure Google OAuth strategy
    configureGoogleStrategy(async (profile) => {
      return await authService.handleGoogleLogin(profile);
    });

  } catch (error) {
    logger.error('Database connection failed:', error);

    // In development, don't exit if database doesn't exist yet
    if (config.nodeEnv !== 'production') {
      logger.warn('Starting server in development mode without database connection. Please ensure PostgreSQL is running and database exists.');
      databaseConnected = false;
    } else {
      logger.error('Database connection failed in production. Exiting...');
      process.exit(1);
    }
  }

  // Start server
  const PORT = config.port;
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    logger.info(`API available at http://localhost:${PORT}${config.apiPrefix}`);
    logger.info(`Health check at http://localhost:${PORT}/health`);
    if (!databaseConnected) {
      logger.warn('Server started without database connection. Some features may not work properly.');
    }

    // Start token cleanup scheduler
    startTokenCleanup();
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(async () => {
      if (databaseConnected) {
        await closeDatabase();
      }
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(async () => {
      if (databaseConnected) {
        await closeDatabase();
      }
      logger.info('Process terminated');
      process.exit(0);
    });
  });
};

// Start server
startServer();

export default app;