import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  apiVersion: string;
  apiPrefix: string;
  logLevel: string;
  logFile: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  // AWS S3 Configuration
  awsRegion: string;
  s3BucketName: string;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  s3Endpoint?: string;
  s3PublicDomain?: string;
  // File Upload Configuration
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedQrCodeTypes: string[];
  thumbnailSizes: { width: number; height: number }[];
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api',
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // AWS S3 Configuration
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3BucketName: process.env.S3_BUCKET_NAME || 'raikanbersama-uploads',
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  s3Endpoint: process.env.S3_ENDPOINT,
  s3PublicDomain: process.env.S3_PUBLIC_DOMAIN,
  // File Upload Configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB in bytes
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedQrCodeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
  thumbnailSizes: [
    { width: 150, height: 150 }, // Small thumbnail
    { width: 300, height: 300 }, // Medium thumbnail
    { width: 800, height: 600 }  // Large preview
  ],
};

export default config;