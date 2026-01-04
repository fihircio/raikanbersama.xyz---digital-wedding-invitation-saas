import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens to prevent Cross-Site Request Forgery attacks
 */

// Store tokens in memory (in production, use Redis or database)
const tokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Generate a CSRF token
 * @returns CSRF token
 */
function _generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a session ID for CSRF token storage
 * @param req - Express request
 * @returns Session ID
 */
function getSessionId(req: Request): string {
  // Try to get session ID from various sources
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Create a hash from IP and user agent for session identification
  return crypto.createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex');
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, tokenData] of tokenStore.entries()) {
    if (tokenData.expires < now) {
      tokenStore.delete(sessionId);
    }
  }
}

// Clean up expired tokens every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

/**
 * Middleware to generate CSRF token
 */
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = getSessionId(req);
  const token = _generateCSRFToken();
  
  // Store token with expiration (1 hour)
  tokenStore.set(sessionId, {
    token,
    expires: Date.now() + 60 * 60 * 1000
  });
  
  // Set CSRF token in response header
  res.set('X-CSRF-Token', token);
  
  // Also store in a cookie for client-side access
  res.cookie('csrf-token', token, {
    httpOnly: false, // Client needs to read this for AJAX requests
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 hour
  });
  
  next();
};

/**
 * Middleware to validate CSRF token
 * @param options - Configuration options
 */
export const validateCSRFToken = (options: { 
  skipMethods?: string[]; 
  skipPaths?: string[] 
} = {}) => {
  const { skipMethods = ['GET', 'HEAD', 'OPTIONS'], skipPaths = [] } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip validation for specified methods and paths
    if (skipMethods.includes(req.method) || skipPaths.some(path => req.path.startsWith(path))) {
      next();
      return;
    }
    
    const sessionId = getSessionId(req);
    const storedTokenData = tokenStore.get(sessionId);
    
    if (!storedTokenData || storedTokenData.expires < Date.now()) {
      logger.warn('CSRF token expired or not found', { 
        sessionId, 
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      res.status(403).json({
        success: false,
        error: 'CSRF token expired or invalid. Please refresh the page and try again.'
      });
      return;
    }
    
    // Get token from header, body, or query
    const tokenFromHeader = req.get('X-CSRF-Token');
    const tokenFromBody = req.body?.csrf_token;
    const tokenFromQuery = req.query?.csrf_token as string;
    
    const providedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;
    
    if (!providedToken) {
      logger.warn('CSRF token missing in request', { 
        sessionId, 
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      res.status(403).json({
        success: false,
        error: 'CSRF token required. Please include X-CSRF-Token header or csrf_token in your request.'
      });
      return;
    }
    
    // Validate token
    if (providedToken !== storedTokenData.token) {
      logger.warn('Invalid CSRF token', { 
        sessionId, 
        path: req.path,
        method: req.method,
        ip: req.ip,
        providedToken: providedToken.substring(0, 8) + '...' // Log only part of the token for security
      });
      res.status(403).json({
        success: false,
        error: 'Invalid CSRF token. Please refresh the page and try again.'
      });
      return;
    }
    
    // Token is valid, continue
    next();
  };
};

/**
 * Middleware to double submit CSRF protection for forms
 * This requires both a cookie and a request parameter/header
 */
export const doubleSubmitCSRF = (req: Request, res: Response, next: NextFunction): void => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  
  const sessionId = getSessionId(req);
  const storedTokenData = tokenStore.get(sessionId);
  
  if (!storedTokenData || storedTokenData.expires < Date.now()) {
    res.status(403).json({
      success: false,
      error: 'CSRF token expired or invalid. Please refresh the page and try again.'
    });
    return;
  }
  
  // Get token from cookie
  const tokenFromCookie = req.cookies?.['csrf-token'];
  
  // Get token from header or body
  const tokenFromHeader = req.get('X-CSRF-Token');
  const tokenFromBody = req.body?.csrf_token;
  const providedToken = tokenFromHeader || tokenFromBody;
  
  if (!tokenFromCookie || !providedToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF protection failed. Both cookie and request token are required.'
    });
    return;
  }
  
  // Validate that both tokens match
  if (tokenFromCookie !== providedToken || providedToken !== storedTokenData.token) {
    logger.warn('Double submit CSRF validation failed', { 
      sessionId, 
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    res.status(403).json({
      success: false,
      error: 'Invalid CSRF token. Please refresh the page and try again.'
    });
    return;
  }
  
  next();
};

/**
 * Middleware to invalidate CSRF token (for logout)
 */
export const invalidateCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = getSessionId(req);
  tokenStore.delete(sessionId);
  
  // Clear CSRF cookie
  res.clearCookie('csrf-token');
  
  next();
};