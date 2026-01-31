import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import config from '../config';
import { generateCSRFToken } from '../middleware/csrf';

const router = Router();

// Health check endpoint with CSRF token generation
router.get('/', generateCSRFToken, (req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
    },
  };

  logger.info('Health check accessed', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(200).json({
    success: true,
    data: healthData,
  });
});

// Detailed health check endpoint
router.get('/detailed', (req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
    },
    cpu: {
      usage: process.cpuUsage(),
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
    },
  };

  logger.info('Detailed health check accessed', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(200).json({
    success: true,
    data: healthData,
  });
});

export default router;