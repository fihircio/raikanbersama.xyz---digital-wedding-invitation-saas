import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Security Rate Limiting Middleware
 * Provides different rate limiting strategies for various endpoints
 */

// Store rate limit data in memory (in production, use Redis)
const sensitiveOperationStore = new Map<string, { count: number; resetTime: number }>();
const authStore = new Map<string, { count: number; resetTime: number }>();
const contentCreationStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client identifier from request
 * @param req - Express request
 * @returns Client identifier
 */
function getClientId(req: Request): string {
  // Try to get a unique identifier for the client
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const userId = (req as any).user?.id || 'anonymous';
  
  return `${ip}:${userAgent}:${userId}`;
}

/**
 * Clean up expired entries from rate limit stores
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  [sensitiveOperationStore, authStore, contentCreationStore].forEach(store => {
    for (const [key, data] of store.entries()) {
      if (data.resetTime < now) {
        store.delete(key);
      }
    }
  });
}

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Custom rate limiter for sensitive operations
 * @param options - Rate limiting options
 */
export const sensitiveOperationLimiter = (options: {
  windowMs?: number;
  maxAttempts?: number;
  operationName?: string;
} = {}) => {
  const { windowMs = 15 * 60 * 1000, maxAttempts = 5, operationName = 'sensitive operation' } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    // Get or create client data
    let clientData = sensitiveOperationStore.get(clientId);
    
    if (!clientData || clientData.resetTime < now) {
      // Reset or initialize
      clientData = {
        count: 0,
        resetTime: now + windowMs
      };
      sensitiveOperationStore.set(clientId, clientData);
    }
    
    // Increment count
    clientData.count++;
    
    // Check if limit exceeded
    if (clientData.count > maxAttempts) {
      logger.warn(`Rate limit exceeded for ${operationName}`, {
        clientId,
        count: clientData.count,
        maxAttempts,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        error: `Too many ${operationName} attempts. Please try again later.`,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
      return;
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxAttempts,
      'X-RateLimit-Remaining': Math.max(0, maxAttempts - clientData.count),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });
    
    next();
  };
};

/**
 * Rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    });
  }
});

/**
 * Rate limiter for content creation (RSVPs, guest wishes, etc.)
 */
export const contentCreationLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const clientId = getClientId(req);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 20; // 20 content items per hour
  
  // Get or create client data
  let clientData = contentCreationStore.get(clientId);
  
  if (!clientData || clientData.resetTime < now) {
    // Reset or initialize
    clientData = {
      count: 0,
      resetTime: now + windowMs
    };
    contentCreationStore.set(clientId, clientData);
  }
  
  // Increment count
  clientData.count++;
  
  // Check if limit exceeded
  if (clientData.count > maxAttempts) {
    logger.warn('Content creation rate limit exceeded', {
      clientId,
      count: clientData.count,
      maxAttempts,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many content creation attempts. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
    return;
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': maxAttempts,
    'X-RateLimit-Remaining': Math.max(0, maxAttempts - clientData.count),
    'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
  });
  
  next();
};

/**
 * Rate limiter for file uploads
 */
export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 files per hour
  message: {
    success: false,
    error: 'Too many file uploads. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return (req as any).user?.id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('File upload rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.id,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many file uploads. Please try again later.',
      retryAfter: 60 * 60 // 1 hour in seconds
    });
  }
});

/**
 * Progressive rate limiter that increases penalties for repeated violations
 */
export const progressiveRateLimiter = (options: {
  baseWindowMs?: number;
  baseMaxAttempts?: number;
  maxMultiplier?: number;
} = {}) => {
  const { baseWindowMs = 15 * 60 * 1000, baseMaxAttempts = 5, maxMultiplier = 8 } = options;
  
  // Store violation history
  const violationHistory = new Map<string, { count: number; lastViolation: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    // Get violation history
    let history = violationHistory.get(clientId);
    
    if (!history) {
      history = { count: 0, lastViolation: 0 };
      violationHistory.set(clientId, history);
    }
    
    // Calculate penalty multiplier based on violation history
    const hoursSinceLastViolation = (now - history.lastViolation) / (1000 * 60 * 60);
    
    // Decay violations over time (1 violation decay per hour)
    if (hoursSinceLastViolation > 1) {
      history.count = Math.max(0, history.count - Math.floor(hoursSinceLastViolation));
    }
    
    // Calculate current window and max attempts
    const multiplier = Math.min(maxMultiplier, 1 + history.count * 0.5);
    const currentWindowMs = baseWindowMs * multiplier;
    const currentMaxAttempts = Math.max(1, Math.floor(baseMaxAttempts / multiplier));
    
    // Get or create client data
    let clientData = sensitiveOperationStore.get(clientId);
    
    if (!clientData || clientData.resetTime < now) {
      // Reset or initialize
      clientData = {
        count: 0,
        resetTime: now + currentWindowMs
      };
      sensitiveOperationStore.set(clientId, clientData);
    }
    
    // Increment count
    clientData.count++;
    
    // Check if limit exceeded
    if (clientData.count > currentMaxAttempts) {
      // Record violation
      history.count++;
      history.lastViolation = now;
      
      logger.warn('Progressive rate limit exceeded', {
        clientId,
        count: clientData.count,
        maxAttempts: currentMaxAttempts,
        multiplier,
        violationCount: history.count,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Current penalty: ${multiplier}x. Please try again later.`,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        penaltyMultiplier: multiplier
      });
      return;
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': currentMaxAttempts,
      'X-RateLimit-Remaining': Math.max(0, currentMaxAttempts - clientData.count),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
      'X-RateLimit-Penalty': multiplier.toFixed(2)
    });
    
    next();
  };
};