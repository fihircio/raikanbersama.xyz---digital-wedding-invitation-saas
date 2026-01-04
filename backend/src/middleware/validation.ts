import { Request, Response, NextFunction } from 'express';
import { ValidationSchema } from '../types/api';

/**
 * Validates request body against a schema
 * @param schema - Validation schema object
 * @returns Middleware function
 */
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
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
      
      // Type validation
      switch (fieldSchema.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            // Min length validation
            if (fieldSchema.min && value.length < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min} characters long`);
            }
            // Max length validation
            if (fieldSchema.max && value.length > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max} characters long`);
            }
            // Pattern validation
            if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
              errors.push(`${field} format is invalid`);
            }
            // Enum validation
            if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
              errors.push(`${field} must be one of: ${fieldSchema.enum.join(', ')}`);
            }
          }
          break;
          
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`${field} must be a number`);
          } else {
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
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`);
          } else {
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
          }
          break;
      }
      
      // Custom validation
      if (fieldSchema.custom) {
        const customResult = fieldSchema.custom(value);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
};

/**
 * Validates query parameters
 * @param schema - Validation schema object
 * @returns Middleware function
 */
export const validateQuery = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
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
        parsedValue = value.split(',');
      }
      
      // Type validation
      switch (fieldSchema.type) {
        case 'string':
          if (typeof parsedValue !== 'string') {
            errors.push(`${field} must be a string`);
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
    }
    
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
};

/**
 * Validates URL parameters
 * @param schema - Validation schema object
 * @returns Middleware function
 */
export const validateParams = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
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
      
      // Type validation
      switch (fieldSchema.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            // Min length validation
            if (fieldSchema.min && value.length < fieldSchema.min) {
              errors.push(`${field} must be at least ${fieldSchema.min} characters long`);
            }
            // Max length validation
            if (fieldSchema.max && value.length > fieldSchema.max) {
              errors.push(`${field} must be at most ${fieldSchema.max} characters long`);
            }
            // Pattern validation
            if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
              errors.push(`${field} format is invalid`);
            }
            // Enum validation
            if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
              errors.push(`${field} must be one of: ${fieldSchema.enum.join(', ')}`);
            }
          }
          break;
          
        case 'number':
          const numValue = parseInt(value, 10);
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
        const customResult = fieldSchema.custom(value);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
};