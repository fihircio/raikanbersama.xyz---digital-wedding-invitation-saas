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
    const baseUrl = (import.meta as any).env?.VITE_API_URL;
    console.log('Config Debug:', {
        env_VITE_API_URL: baseUrl,
        resolved_API_BASE_URL: baseUrl || 'EMPTY_STRING_FALLBACK'
    });
    return `${API_URL}${path}`;
};
