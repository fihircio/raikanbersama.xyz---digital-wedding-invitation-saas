import { Request } from 'express';

/**
 * Basic sanitization function to remove potentially harmful characters
 */
export const sanitize = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove control characters and limit length
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .substring(0, 10000);
};

/**
 * HTML sanitization function with allowed tags
 */
export const sanitizeHtml = (input: string, allowedTags: string[] = []): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic HTML sanitization - remove all tags except allowed ones
  let tagPattern: RegExp;
  if (allowedTags.length > 0) {
    const escapedTags = allowedTags.map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    tagPattern = new RegExp(`<(!?\\/?\\s*(?:${escapedTags.join('|')})(?=[^>]*)>`, 'gi');
  } else {
    tagPattern = /<[^>]*>/gi;
  }
    
  return input
    // Remove tags not in allowed list
    .replace(tagPattern, '')
    // Basic entity encoding
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    // Limit length
    .substring(0, 10000);
};

/**
 * Email validation and sanitization
 */
export const validateAndSanitizeEmail = (email: string): string | null => {
  if (typeof email !== 'string') {
    return null;
  }
  
  // Basic sanitization
  const sanitized = email.trim().toLowerCase();
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Phone number validation and sanitization (Malaysian format)
 */
export const validateAndSanitizePhone = (phone: string): string | null => {
  if (typeof phone !== 'string') {
    return null;
  }
  
  // Remove all non-digit characters
  const sanitized = phone.replace(/\D/g, '');
  
  // Malaysian phone number validation
  // Landlines: 03-XXXXXXXX, 04-XXXXXXXX, etc.
  // Mobile: 01XXXXXXXXX
  const phoneRegex = /^(0[1-9]\d{7,9})$/;
  
  if (!phoneRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * URL validation and sanitization
 */
export const validateAndSanitizeUrl = (url: string): string | null => {
  if (typeof url !== 'string') {
    return null;
  }
  
  const sanitized = url.trim();
  
  try {
    const parsedUrl = new URL(sanitized);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    return sanitized;
  } catch {
    return null;
  }
};

/**
 * Google Maps URL validation
 */
export const validateGoogleMapsUrl = (url: string): string | null => {
  const sanitized = validateAndSanitizeUrl(url);
  
  if (!sanitized) {
    return null;
  }
  
  if (!sanitized.includes('maps.google.com') && !sanitized.includes('google.com/maps')) {
    return null;
  }
  
  return sanitized;
};

/**
 * Waze URL validation
 */
export const validateWazeUrl = (url: string): string | null => {
  const sanitized = validateAndSanitizeUrl(url);
  
  if (!sanitized) {
    return null;
  }
  
  if (!sanitized.includes('waze.com')) {
    return null;
  }
  
  return sanitized;
};

/**
 * Hex color validation
 */
export const validateHexColor = (color: string): string | null => {
  if (typeof color !== 'string') {
    return null;
  }
  
  const sanitized = color.trim();
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  
  if (!hexColorRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * CSS size validation (px, em, rem, %)
 */
export const validateCssSize = (size: string): string | null => {
  if (typeof size !== 'string') {
    return null;
  }
  
  const sanitized = size.trim();
  const cssSizeRegex = /^\d+(px|em|rem|%)$/;
  
  if (!cssSizeRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Time format validation (HH:MM)
 */
export const validateTimeFormat = (time: string): string | null => {
  if (typeof time !== 'string') {
    return null;
  }
  
  const sanitized = time.trim();
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Date format validation (YYYY-MM-DD)
 */
export const validateDateFormat = (date: string): string | null => {
  if (typeof date !== 'string') {
    return null;
  }
  
  const sanitized = date.trim();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(sanitized)) {
    return null;
  }
  
  // Additional validation to check if it's a valid date
  const dateObj = new Date(sanitized);
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  return sanitized;
};

/**
 * Slug validation (URL-friendly strings)
 */
export const validateSlug = (slug: string): string | null => {
  if (typeof slug !== 'string') {
    return null;
  }
  
  const sanitized = slug.trim().toLowerCase();
  const slugRegex = /^[a-z0-9-]+$/;
  
  if (!slugRegex.test(sanitized)) {
    return null;
  }
  
  // Check for reserved words
  const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp'];
  if (reservedWords.includes(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Bank account validation (Malaysian format)
 */
export const validateBankAccount = (accountNo: string): string | null => {
  if (typeof accountNo !== 'string') {
    return null;
  }
  
  // Remove all non-digit characters
  const sanitized = accountNo.replace(/\D/g, '');
  
  // Malaysian bank account numbers are typically 10-20 digits
  const accountRegex = /^\d{10,20}$/;
  
  if (!accountRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Text content validation with length limit
 */
export const validateTextContent = (text: string, maxLength: number): string | null => {
  if (typeof text !== 'string') {
    return null;
  }
  
  const sanitized = sanitize(text);
  
  if (sanitized.length > maxLength) {
    return null;
  }
  
  return sanitized;
};

/**
 * Detect malicious content patterns
 */
export const detectMaliciousContent = (content: string): boolean => {
  if (typeof content !== 'string') {
    return false;
  }
  
  // List of suspicious patterns
  const suspiciousPatterns: RegExp[] = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /@import/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Sanitize request body
 */
export const sanitizeRequestBody = (req: Request): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
};

/**
 * Sanitize request query parameters
 */
export const sanitizeRequestQuery = (req: Request): void => {
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitize(req.query[key]);
      }
    }
  }
};

/**
 * Sanitize request parameters
 */
export const sanitizeRequestParams = (req: Request): void => {
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitize(req.params[key]);
      }
    }
  }
};