/**
 * Frontend Configuration
 * Centralized configuration for environment-specific values
 */

// API Base URL - defaults to localhost for development
// Always use relative paths to leverage the proxy (Vite in dev, Vercel in prod)
// This ensures cookies are sent correctly (SameSite: Strict) and avoids CORS issues
export const API_BASE_URL = '';

// API Endpoints
export const API_URL = `${API_BASE_URL}/api`;

// Helper function to build API endpoints
export const buildApiUrl = (path: string): string => {
    return `${API_URL}${path}`;
};
