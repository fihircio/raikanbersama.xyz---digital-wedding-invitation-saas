/**
 * Frontend Configuration
 * Centralized configuration for environment-specific values
 */

// API Base URL - defaults to localhost for development
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

// API Endpoints
export const API_URL = `${API_BASE_URL}/api`;

// Helper function to build API endpoints
export const buildApiUrl = (path: string): string => {
    return `${API_URL}${path}`;
};
