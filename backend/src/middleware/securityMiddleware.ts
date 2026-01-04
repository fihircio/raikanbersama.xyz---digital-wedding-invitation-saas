import { Request, Response, NextFunction } from 'express';
import { validateAndSanitizeBody, validateAndSanitizeQuery, validateAndSanitizeParams } from './securityValidation';
import { validateCSRFToken, generateCSRFToken } from './csrf';
import { sensitiveOperationLimiter, authLimiter, contentCreationLimiter, fileUploadLimiter } from './securityRateLimit';
import { validateFileUpload } from './fileSecurityValidation';
import contentModerationService from '../services/contentModerationService';
import logger from '../utils/logger';

/**
 * Comprehensive Security Middleware
 * Combines all security features for the wedding invitation platform
 */

/**
 * Security configuration options
 */
interface SecurityOptions {
  requireAuth?: boolean;
  requireCSRF?: boolean;
  rateLimit?: {
    enabled?: boolean;
    maxAttempts?: number;
    windowMs?: number;
  };
  contentModeration?: {
    enabled?: boolean;
    contentType?: 'rsvp' | 'guest-wish' | 'general';
  };
  fileUpload?: {
    enabled?: boolean;
    allowedTypes?: string[];
    maxSize?: number;
  };
}

/**
 * Helper function to apply remaining security checks
 */
const applyOtherSecurityChecks = (
  req: Request,
  res: Response,
  next: NextFunction,
  options: SecurityOptions
): void => {
  const {
    requireCSRF = true,
    contentModeration = { enabled: true },
    fileUpload = { enabled: false },
    requireAuth = true
  } = options;
    
  // 3. CSRF protection for state-changing requests
  if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const validationResult = validateCSRFToken()(req, res, () => {});
    if (res.headersSent) {
      return; // CSRF validation failed
    }
  }
  
  // 4. Input validation and sanitization
  if (req.body && Object.keys(req.body).length > 0) {
    // Use a basic validation schema for general requests
    const basicSchema = {
      // Limit size of all string inputs
      '*': {
        type: 'string',
        max: 10000, // 10KB max for any field
        custom: (value: any) => {
          if (typeof value === 'string' && value.length > 10000) {
            return 'Input too large';
          }
          return true;
        }
      }
    };
    
    const validator = validateAndSanitizeBody(basicSchema);
    validator(req, res, () => {});
    if (res.headersSent) {
      return; // Validation failed
    }
  }
  
  // 5. Content moderation
  if (contentModeration.enabled && req.body) {
    // Check for potentially malicious content
    const bodyString = JSON.stringify(req.body);
    const maliciousResult = contentModerationService.analyzeContent(bodyString);
    
    if (!maliciousResult.isApproved) {
      logger.warn('Content moderation blocked request', {
        reason: maliciousResult.reason,
        score: maliciousResult.score,
        categories: maliciousResult.categories,
        ip: req.ip,
        path: req.path,
        userId: (req as any).user?.id
      });
      
      res.status(400).json({
        success: false,
        error: 'Content not allowed',
        reason: maliciousResult.reason
      });
      return;
    }
  }
  
  // 6. File upload validation
  if (fileUpload.enabled && (req.file || req.files)) {
    const fileValidator = validateFileUpload({
      allowedTypes: fileUpload.allowedTypes,
      maxSize: fileUpload.maxSize,
      scanForMalware: true,
      requireAuth: requireAuth
    });
    
    // Execute file validation
    fileValidator(req, res, () => {
      if (res.headersSent) {
        return; // File validation failed
      }
      
      // If file validation passes, continue to next middleware
      next();
    });
    return;
  }
  
  // Generate CSRF token for safe requests
  if (requireCSRF && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    generateCSRFToken(req, res, () => {});
  }
  
  // Continue to next middleware if all checks pass
  next();
};

/**
 * Create comprehensive security middleware
 * @param options - Security configuration options
 */
export const securityMiddleware = (options: SecurityOptions = {}) => {
  const {
    requireAuth = true,
    requireCSRF = true,
    rateLimit = { enabled: true },
    contentModeration = { enabled: true },
    fileUpload = { enabled: false }
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Apply security measures in order
    
    // 1. Rate limiting (first line of defense)
    if (rateLimit.enabled) {
      const limiter = sensitiveOperationLimiter({
        maxAttempts: rateLimit.maxAttempts,
        windowMs: rateLimit.windowMs,
        operationName: 'API request'
      });
      
      const result = limiter(req, res, () => {});
      if (res.headersSent) {
        return; // Rate limit exceeded
      }
    }
    
    // 2. Authentication check - apply authentication middleware if needed
    if (requireAuth) {
      // Import and apply authentication middleware
      const { authenticate } = require('./auth');
      authenticate(req, res, (err?: any) => {
        if (err) {
          return;
        }
        
        // Continue with other security checks
        applyOtherSecurityChecks(req, res, next, options);
      });
    } else {
      // Skip authentication, apply other security checks
      applyOtherSecurityChecks(req, res, next, options);
    }
  };
};

/**
 * Apply security middleware to specific routes with different configurations
 */
export const applyRouteSecurity = {
  // Authentication routes (login, register)
  auth: securityMiddleware({
    requireAuth: false,
    requireCSRF: false,
    rateLimit: {
      enabled: true,
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    contentModeration: {
      enabled: true,
      contentType: 'general'
    }
  }),
  
  // RSVP routes
  rsvp: securityMiddleware({
    requireAuth: false, // RSVPs can be public
    requireCSRF: true,
    rateLimit: {
      enabled: true,
      maxAttempts: 20,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    contentModeration: {
      enabled: true,
      contentType: 'rsvp'
    }
  }),
  
  // Guest wish routes
  guestWish: securityMiddleware({
    requireAuth: false, // Guest wishes can be public
    requireCSRF: true,
    rateLimit: {
      enabled: true,
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    contentModeration: {
      enabled: true,
      contentType: 'guest-wish'
    }
  }),
  
  // User profile routes
  profile: securityMiddleware({
    requireAuth: true,
    requireCSRF: true,
    rateLimit: {
      enabled: true,
      maxAttempts: 20,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    contentModeration: {
      enabled: true,
      contentType: 'general'
    }
  }),
  
  // File upload routes
  fileUpload: securityMiddleware({
    requireAuth: true,
    requireCSRF: true,
    rateLimit: {
      enabled: true,
      maxAttempts: 50,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    contentModeration: {
      enabled: false // File content is validated separately
    },
    fileUpload: {
      enabled: true,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  }),
  
  // Admin routes
  admin: securityMiddleware({
    requireAuth: true,
    requireCSRF: true,
    rateLimit: {
      enabled: true,
      maxAttempts: 100,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    contentModeration: {
      enabled: true,
      contentType: 'general'
    }
  })
};

/**
 * Security headers middleware
 * Adds security-related headers to responses
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );
  
  next();
};

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log request details
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString()
  };
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempt
    /union/i,   // SQL injection
    /select/i,   // SQL injection
    /drop/i,     // SQL injection
    /exec/i,     // Code execution
    /cmd/i       // Command injection
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url || '') || pattern.test(JSON.stringify(req.body))
  );
  
  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ...logData,
      suspicious: true
    });
  } else {
    logger.info('Request logged', logData);
  }
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.info('Request completed', {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Helper function to create security middleware with custom validation
 * @param securityType - Type of security configuration to use
 * @param validationOptions - Custom validation options for body, params, or query
 */
export const createSecureRoute = (
  securityType: keyof typeof applyRouteSecurity,
  validationOptions?: {
    body?: any;
    params?: any;
    query?: any;
  }
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Apply the base security middleware
    const baseSecurity = applyRouteSecurity[securityType];
    
    // If custom validation is needed, apply it
    if (validationOptions) {
      // Apply body validation if specified
      if (validationOptions.body && req.body && Object.keys(req.body).length > 0) {
        const bodyValidator = validateAndSanitizeBody(validationOptions.body);
        bodyValidator(req, res, (err) => {
          if (err || res.headersSent) return;
          
          // Apply params validation if specified
          if (validationOptions.params && req.params && Object.keys(req.params).length > 0) {
            const paramsValidator = validateAndSanitizeParams(validationOptions.params);
            paramsValidator(req, res, (err) => {
              if (err || res.headersSent) return;
              
              // Apply query validation if specified
              if (validationOptions.query && req.query && Object.keys(req.query).length > 0) {
                const queryValidator = validateAndSanitizeQuery(validationOptions.query);
                queryValidator(req, res, (err) => {
                  if (err || res.headersSent) return;
                  
                  // Apply base security and continue
                  baseSecurity(req, res, next);
                });
              } else {
                // Apply base security and continue
                baseSecurity(req, res, next);
              }
            });
          } else {
            // Apply query validation if specified
            if (validationOptions.query && req.query && Object.keys(req.query).length > 0) {
              const queryValidator = validateAndSanitizeQuery(validationOptions.query);
              queryValidator(req, res, (err) => {
                if (err || res.headersSent) return;
                
                // Apply base security and continue
                baseSecurity(req, res, next);
              });
            } else {
              // Apply base security and continue
              baseSecurity(req, res, next);
            }
          }
        });
      } else {
        // Apply params validation if specified
        if (validationOptions.params && req.params && Object.keys(req.params).length > 0) {
          const paramsValidator = validateAndSanitizeParams(validationOptions.params);
          paramsValidator(req, res, (err) => {
            if (err || res.headersSent) return;
            
            // Apply query validation if specified
            if (validationOptions.query && req.query && Object.keys(req.query).length > 0) {
              const queryValidator = validateAndSanitizeQuery(validationOptions.query);
              queryValidator(req, res, (err) => {
                if (err || res.headersSent) return;
                
                // Apply base security and continue
                baseSecurity(req, res, next);
              });
            } else {
              // Apply base security and continue
              baseSecurity(req, res, next);
            }
          });
        } else {
          // Apply query validation if specified
          if (validationOptions.query && req.query && Object.keys(req.query).length > 0) {
            const queryValidator = validateAndSanitizeQuery(validationOptions.query);
            queryValidator(req, res, (err) => {
              if (err || res.headersSent) return;
              
              // Apply base security and continue
              baseSecurity(req, res, next);
            });
          } else {
            // Apply base security and continue
            baseSecurity(req, res, next);
          }
        }
      }
    } else {
      // Just apply base security
      baseSecurity(req, res, next);
    }
  };
};