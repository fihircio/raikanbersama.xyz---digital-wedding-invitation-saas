# File Storage Service Implementation

This document describes the file storage service implementation for RaikanBersama.xyz wedding invitation SaaS.

## Overview

The file storage service provides a comprehensive solution for handling file uploads, storage, and management for the wedding invitation platform. It uses AWS S3 as the storage backend with additional security, validation, and optimization features.

## Architecture

### Core Components

1. **File Storage Service** (`src/services/fileStorageService.ts`)
   - Handles AWS S3 operations
   - File upload, deletion, and URL generation
   - Image processing and thumbnail generation
   - Multiple file upload support

2. **File Security Service** (`src/services/fileSecurityService.ts`)
   - File validation and security scanning
   - Malicious file detection
   - Filename sanitization
   - Security event logging

3. **File Cleanup Service** (`src/services/fileCleanupService.ts`)
   - Scheduled cleanup of orphaned files
   - Storage optimization
   - Automated maintenance tasks

4. **Upload Middleware** (`src/middleware/upload.ts`)
   - Multer-based file upload handling
   - Integration with file storage service
   - Error handling and validation

5. **File Controller** (`src/controllers/fileController.ts`)
   - API endpoints for file operations
   - Integration with invitation management
   - Response formatting and error handling

## Features

### 1. File Upload and Storage

- **Single File Upload**: Upload individual files with validation
- **Multiple File Upload**: Batch upload multiple files simultaneously
- **File Type Support**: 
  - Gallery images: JPEG, PNG, WebP
  - QR codes: JPEG, PNG, WebP, SVG
  - Background images: JPEG, PNG, WebP

### 2. Image Processing

- **Thumbnail Generation**: Automatically creates multiple thumbnail sizes
  - Small: 150x150px
  - Medium: 300x300px
  - Large: 800x600px
- **Image Optimization**: JPEG compression at 80% quality
- **Format Support**: Handles various image formats with Sharp library

### 3. Security Features

- **File Type Validation**: MIME type verification
- **Size Restrictions**: Configurable file size limits
- **Malicious File Detection**: Scans for executable files and scripts
- **Filename Sanitization**: Prevents path traversal attacks
- **Content Scanning**: Detects potential XSS in images

### 4. Access Control

- **Private Storage**: Files are stored with private ACL by default
- **Signed URLs**: Temporary access URLs with configurable expiration
- **User Isolation**: Files organized by user ID for access control

### 5. Storage Management

- **Automatic Cleanup**: Scheduled removal of orphaned files
- **Storage Optimization**: Weekly maintenance tasks
- **Redundancy**: Built on AWS S3 with high durability
- **Backup Strategy**: S3's built-in replication and versioning

## API Endpoints

### Gallery Images

- `POST /api/files/gallery` - Upload single gallery image
- `POST /api/files/gallery/multiple` - Upload multiple gallery images

### QR Codes

- `POST /api/files/qr-code` - Upload QR code for money gifts

### Background Images

- `POST /api/files/background` - Upload background image

### File Management

- `DELETE /api/files/:key` - Delete a specific file
- `GET /api/files/signed-url/:key` - Generate signed URL for secure access

## Configuration

### Environment Variables

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=raikanbersama-uploads
S3_ACCESS_KEY_ID=your-aws-access-key-id
S3_SECRET_ACCESS_KEY=your-aws-secret-access-key

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Application Configuration

```typescript
// Allowed file types
allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
allowedQrCodeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']

// Thumbnail sizes
thumbnailSizes: [
  { width: 150, height: 150 },  // Small thumbnail
  { width: 300, height: 300 },  // Medium thumbnail
  { width: 800, height: 600 }   // Large preview
]
```

## File Organization

Files are organized in S3 with the following structure:

```
s3://bucket/
├── gallery-image/
│   └── {userId}/
│       └── {timestamp}-{random}.{extension}
├── gallery-image-thumb-small/
│   └── {userId}/
│       └── {timestamp}-{random}.jpg
├── gallery-image-thumb-medium/
│   └── {userId}/
│       └── {timestamp}-{random}.jpg
├── gallery-image-thumb-large/
│   └── {userId}/
│       └── {timestamp}-{random}.jpg
├── qr-code/
│   └── {userId}/
│       └── {timestamp}-{random}.{extension}
└── background/
    └── {userId}/
        └── {timestamp}-{random}.{extension}
```

## Security Considerations

1. **Access Control**: Files are private by default
2. **Temporary URLs**: Signed URLs expire after configurable time
3. **Input Validation**: All files are scanned and validated
4. **User Isolation**: Files are separated by user ID
5. **Audit Logging**: All file operations are logged

## Performance Optimizations

1. **Thumbnail Generation**: Pre-generated thumbnails for faster loading
2. **Compression**: Images are optimized for web delivery
3. **CDN Ready**: S3 can be integrated with CloudFront
4. **Parallel Uploads**: Multiple files uploaded simultaneously
5. **Cleanup Scheduling**: Off-peak maintenance tasks

## Error Handling

- **Validation Errors**: Clear error messages for invalid files
- **Upload Failures**: Detailed error reporting with retry suggestions
- **Storage Errors**: Graceful degradation with fallback options
- **Security Events**: Logging and alerting for suspicious activity

## Monitoring and Maintenance

1. **Daily Cleanup**: Removes orphaned files and temporary uploads
2. **Weekly Optimization**: Storage optimization and reorganization
3. **Security Monitoring**: Continuous scanning and threat detection
4. **Usage Analytics**: File upload and storage metrics

## Integration Points

The file storage service integrates with:

- **Invitation Service**: Gallery images, QR codes, and backgrounds
- **User Management**: User-specific file organization
- **Authentication Service**: Secure file access control
- **Logging Service**: Comprehensive audit trail

## Future Enhancements

1. **CDN Integration**: CloudFront for global content delivery
2. **Advanced Processing**: Watermarking and custom filters
3. **Storage Classes**: Automatic lifecycle management
4. **Virus Scanning**: Integration with security services
5. **Analytics**: Detailed usage and performance metrics

## Usage Examples

### Upload a Gallery Image

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('invitation_id', 'invitation-123');

const response = await fetch('/api/files/gallery', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData
});

const result = await response.json();
// result.data.url contains the uploaded image URL
// result.data.thumbnails contains thumbnail URLs
```

### Generate Signed URL

```javascript
const response = await fetch(`/api/files/signed-url/file-key-123?expiresIn=3600`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});

const result = await response.json();
// result.data.url contains the signed URL
```

## Troubleshooting

### Common Issues

1. **Upload Failures**: Check file size and type restrictions
2. **Permission Errors**: Verify AWS credentials and bucket permissions
3. **Thumbnail Issues**: Ensure image format is supported
4. **URL Generation**: Check key format and expiration time

### Debug Information

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

This will provide detailed information about file operations, security scans, and storage activities.