import { Request } from 'express';
import { PaginationParams, FilterParams } from '../types/api';

/**
 * Extracts pagination parameters from request query
 * @param req - Express request object
 * @returns Pagination parameters with defaults
 */
export const getPaginationParams = (req: Request): PaginationParams => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  
  // Ensure page is at least 1
  const validPage = Math.max(1, page);
  
  // Ensure limit is between 1 and 100
  const validLimit = Math.min(100, Math.max(1, limit));
  
  return {
    page: validPage,
    limit: validLimit
  };
};

/**
 * Calculates pagination metadata
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
) => {
  const pages = Math.ceil(total / limit);
  const hasNext = page < pages;
  const hasPrev = page > 1;
  
  return {
    page,
    limit,
    total,
    pages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

/**
 * Extracts filter parameters from request query
 * @param req - Express request object
 * @returns Filter parameters
 */
export const getFilterParams = (req: Request): FilterParams => {
  return {
    search: req.query.search as string || '',
    sortBy: req.query.sortBy as string || 'created_at',
    sortOrder: (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc'
  };
};

/**
 * Applies pagination to an array of items
 * @param items - Array of items to paginate
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated items
 */
export const paginateArray = <T>(
  items: T[],
  page: number,
  limit: number
): T[] => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return items.slice(startIndex, endIndex);
};

/**
 * Applies sorting to an array of items
 * @param items - Array of items to sort
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order ('asc' or 'desc')
 * @returns Sorted items
 */
export const sortArray = <T>(
  items: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    // @ts-ignore - Dynamic property access
    const aValue = a[sortBy];
    // @ts-ignore - Dynamic property access
    const bValue = b[sortBy];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Applies search filtering to an array of items
 * @param items - Array of items to filter
 * @param searchTerm - Search term
 * @param searchFields - Fields to search in
 * @returns Filtered items
 */
export const searchArray = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearchTerm);
      }
      return false;
    });
  });
};