# RaikanBersama.xyz Backend API

This is the backend API for the RaikanBersama.xyz digital wedding invitation SaaS platform.

## Features

- Node.js with Express.js
- TypeScript support
- Comprehensive error handling
- Logging with Winston
- Rate limiting
- CORS configuration
- Security middleware with Helmet
- Health check endpoints
- Environment configuration
- Graceful shutdown handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure your environment variables in `.env`

### Running the Server

#### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

#### Production Mode

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check

- `GET /health` - Basic health check
- `GET /api/health` - Detailed health check
- `GET /api/health/detailed` - Comprehensive health check with system metrics

### API Base

- `GET /api` - API information and version

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── logs/                # Log files (created automatically)
├── dist/                # Compiled JavaScript (created after build)
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Environment Variables

Key environment variables (see `.env.example` for complete list):

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `LOG_LEVEL` - Logging level (info, warn, error, etc.)
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

## Logging

The application uses Winston for logging with the following features:

- Console logging in development
- File logging with rotation
- Different log levels
- Structured JSON format in production

Log files are stored in the `logs/` directory:
- `logs/app.log` - All logs
- `logs/error.log` - Error logs only

## Error Handling

The application includes comprehensive error handling:

- Custom error middleware
- Graceful error responses
- Error logging with context
- Development vs production error details

## Security

The application implements several security measures:

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request size limits
- Input sanitization

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Next Steps

This backend infrastructure is ready for:

1. Database integration (MongoDB/PostgreSQL)
2. Authentication and authorization
3. API endpoint implementation
4. File upload handling
5. Payment gateway integration
6. Email service integration
7. Caching layer (Redis)

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Add logging for new features
5. Update documentation

## License

MIT