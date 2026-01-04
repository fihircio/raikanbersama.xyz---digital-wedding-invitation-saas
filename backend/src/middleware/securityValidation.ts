import { Request, Response, NextFunction } from 'express';
import { ValidationSchema } from '../types/api';
import { sanitize as sanitizeString } from '../utils/sanitization';
import logger from '../utils/logger';

/**
 * Enhanced validation middleware with XSS protection and sanitization
 * Validates request body against a schema and sanitizes inputs
 */
export const validateAndSanitizeBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const sanitizedBody: any = {};
    
    for (const field in schema) {
      const fieldSchema = schema[field];
      const value = req.body[field];
      
      // Check if required field is missing
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }
      
      // Type validation and sanitization
      switch (fieldSchema.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            // Sanitize string input
            const sanitized = sanitizeString(value);
            sanitizedBody[field] = sanitized;
            
            // Min length validation
            if (fieldSchema.min && sanitized.length < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min} characters long`);
            }
            // Max length validation
            if (fieldSchema.max && sanitized.length > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max} characters long`);
            }
            // Pattern validation
            if (fieldSchema.pattern && !fieldSchema.pattern.test(sanitized)) {
              errors.push(`${field} format is invalid`);
            }
            // Enum validation
            if (fieldSchema.enum && !fieldSchema.enum.includes(sanitized)) {
              errors.push(`${field} must be one of: ${fieldSchema.enum.join(', ')}`);
            }
          }
          break;
          
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`${field} must be a number`);
          } else {
            sanitizedBody[field] = value;
            // Min value validation
            if (fieldSchema.min !== undefined && value < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min}`);
            }
            // Max value validation
            if (fieldSchema.max !== undefined && value > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max}`);
            }
          }
          break;
          
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field} must be a boolean`);
          } else {
            sanitizedBody[field] = value;
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`);
          } else {
            // Sanitize array elements if they are strings
            const sanitizedArray = value.map(item => 
              typeof item === 'string' ? sanitizeString(item) : item
            );
            sanitizedBody[field] = sanitizedArray;
            
            // Min length validation
            if (fieldSchema.min && value.length < fieldSchema.min) {
              errors.push(`${field} must have at least ${fieldSchema.min} items`);
            }
            // Max length validation
            if (fieldSchema.max && value.length > fieldSchema.max) {
              errors.push(`${field} must have at most ${fieldSchema.max} items`);
            }
          }
          break;
          
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`${field} must be an object`);
          } else {
            // Recursively sanitize object properties
            const sanitizedObj: any = {};
            for (const key in value) {
              if (typeof value[key] === 'string') {
                sanitizedObj[key] = sanitizeString(value[key]);
              } else {
                sanitizedObj[key] = value[key];
              }
            }
            sanitizedBody[field] = sanitizedObj;
          }
          break;
      }
      
      // Custom validation
      if (fieldSchema.custom) {
        const customResult = fieldSchema.custom(sanitizedBody[field] || value);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Validation failed:', { errors, body: req.body });
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    
    // Replace request body with sanitized version
    req.body = { ...req.body, ...sanitizedBody };
    next();
  };
};

/**
 * Enhanced validation for query parameters with sanitization
 */
export const validateAndSanitizeQuery = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const sanitizedQuery: any = {};
    
    for (const field in schema) {
      const fieldSchema = schema[field];
      const value = req.query[field];
      
      // Skip validation if field is not provided
      if (value === undefined || value === null) {
        continue;
      }
      
      // Convert string values to appropriate types
      let parsedValue: any = value;
      if (fieldSchema.type === 'number' && typeof value === 'string') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
          errors.push(`${field} must be a valid number`);
          continue;
        }
        parsedValue = numValue;
      } else if (fieldSchema.type === 'boolean' && typeof value === 'string') {
        parsedValue = value.toLowerCase() === 'true';
      } else if (fieldSchema.type === 'array' && typeof value === 'string') {
        parsedValue = value.split(',').map(item => sanitizeString(item.trim()));
      } else if (fieldSchema.type === 'string' && typeof value === 'string') {
        parsedValue = sanitizeString(value);
      }
      
      // Type validation
      switch (fieldSchema.type) {
        case 'string':
          if (typeof parsedValue !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            // Min length validation
            if (fieldSchema.min && parsedValue.length < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min} characters long`);
            }
            // Max length validation
            if (fieldSchema.max && parsedValue.length > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max} characters long`);
            }
          }
          break;
          
        case 'number':
          if (typeof parsedValue !== 'number') {
            errors.push(`${field} must be a number`);
          } else {
            // Min value validation
            if (fieldSchema.min !== undefined && parsedValue < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min}`);
            }
            // Max value validation
            if (fieldSchema.max !== undefined && parsedValue > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max}`);
            }
          }
          break;
          
        case 'boolean':
          if (typeof parsedValue !== 'boolean') {
            errors.push(`${field} must be a boolean`);
          }
          break;
          
        case 'array':
          if (!Array.isArray(parsedValue)) {
            errors.push(`${field} must be an array`);
          }
          break;
      }
      
      // Enum validation
      if (fieldSchema.enum && !fieldSchema.enum.includes(String(parsedValue))) {
        errors.push(`${field} must be one of: ${fieldSchema.enum.join(', ')}`);
      }
      
      // Custom validation
      if (fieldSchema.custom) {
        const customResult = fieldSchema.custom(parsedValue);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`);
        }
      }
      
      // Add to sanitized query
      sanitizedQuery[field] = parsedValue;
    }
    
    if (errors.length > 0) {
      logger.warn('Query validation failed:', { errors, query: req.query });
      res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
      return;
    }
    
    // Replace request query with sanitized version
    req.query = { ...req.query, ...sanitizedQuery };
    next();
  };
};

/**
 * Enhanced validation for URL parameters with sanitization
 */
export const validateAndSanitizeParams = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const sanitizedParams: any = {};
    
    for (const field in schema) {
      const fieldSchema = schema[field];
      const value = req.params[field];
      
      // Check if required field is missing
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }
      
      // Sanitize string parameters
      const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : value;
      sanitizedParams[field] = sanitizedValue;
      
      // Type validation
      switch (fieldSchema.type) {
        case 'string':
          if (typeof sanitizedValue !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            // Min length validation
            if (fieldSchema.min && sanitizedValue.length < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min} characters long`);
            }
            // Max length validation
            if (fieldSchema.max && sanitizedValue.length > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max} characters long`);
            }
            // Pattern validation
            if (fieldSchema.pattern && !fieldSchema.pattern.test(sanitizedValue)) {
              errors.push(`${field} format is invalid`);
            }
            // Enum validation
            if (fieldSchema.enum && !fieldSchema.enum.includes(sanitizedValue)) {
              errors.push(`${field} must be one of: ${fieldSchema.enum.join(', ')}`);
            }
          }
          break;
          
        case 'number':
          const numValue = parseInt(sanitizedValue, 10);
          if (isNaN(numValue)) {
            errors.push(`${field} must be a valid number`);
          } else {
            // Min value validation
            if (fieldSchema.min !== undefined && numValue < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min}`);
            }
            // Max value validation
            if (fieldSchema.max !== undefined && numValue > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max}`);
            }
          }
          break;
      }
      
      // Custom validation
      if (fieldSchema.custom) {
        const customResult = fieldSchema.custom(sanitizedValue);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Parameter validation failed:', { errors, params: req.params });
      res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errors
      });
      return;
    }
    
    // Replace request params with sanitized version
    req.params = { ...req.params, ...sanitizedParams };
    next();
  };
};