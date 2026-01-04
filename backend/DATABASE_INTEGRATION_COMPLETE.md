# Database Integration Complete

## Summary

The RaikanBersama.xyz wedding invitation SaaS now has a complete PostgreSQL database integration that replaces the mock data service. The application can run in development mode without a database connection and will gracefully handle database connection errors.

## What's Been Implemented

### 1. Database Infrastructure
- **PostgreSQL Database Configuration**: Configured with environment variables and connection pooling
- **Sequelize ORM**: Integrated with TypeScript decorators for type safety
- **Connection Management**: Proper error handling and graceful shutdown

### 2. Database Models
- **User Model**: Complete with authentication fields and membership tracking
- **Invitation Model**: Full wedding invitation data with nested objects
- **RSVP Model**: Guest RSVP functionality
- **GuestWish Model**: Guest message functionality
- **ItineraryItem Model**: Event timeline management
- **ContactPerson Model**: Wedding contact information
- **Gallery Model**: Photo gallery management
- **BackgroundImage Model**: Template background management

### 3. Repository Pattern
- **BaseRepository**: Common CRUD operations with error handling
- **UserRepository**: User-specific database operations
- **InvitationRepository**: Invitation management with view tracking
- **RSVPRepository**: RSVP management
- **GuestWishRepository**: Guest wish management
- **ItineraryRepository**: Event timeline management
- **ContactPersonRepository**: Contact person management
- **GalleryRepository**: Gallery management
- **BackgroundImageRepository**: Background image management

### 4. Database Service
- **DatabaseService**: Replaces mock data service with real database operations
- **Type Conversion**: Proper handling of Date to string conversions
- **Error Handling**: Graceful error management

### 5. API Integration
- **Invitation Controller**: Updated to use database service
- **User Controller**: Updated with type conversion
- **Auth Service**: Updated to use database service
- **Server Configuration**: Graceful handling of database connection failures

### 6. Development Tools
- **Database Seeding**: Script to populate initial data
- **Migration Scripts**: Database schema management
- **Type Conversion Utilities**: Handle Date/string conversions
- **Error Handling**: Proper error management in development

## Database Setup Instructions

### Option 1: Local PostgreSQL Setup

1. **Install PostgreSQL**:
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Start PostgreSQL Service**:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start from Services panel
   ```

3. **Create Database and User**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE raikanbersama;
   
   # Create user
   CREATE USER raikanbersama_user WITH PASSWORD 'your_password';
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE raikanbersama TO raikanbersama_user;
   
   # Exit
   \q
   ```

4. **Configure Environment Variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env file with your database credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=raikanbersama
   DB_USER=raikanbersama_user
   DB_PASSWORD=your_password
   ```

### Option 2: Docker PostgreSQL Setup

1. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: raikanbersama
         POSTGRES_USER: raikanbersama_user
         POSTGRES_PASSWORD: your_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   volumes:
     postgres_data:
   ```

2. **Start PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud PostgreSQL Setup

1. **AWS RDS**:
   - Create RDS instance with PostgreSQL engine
   - Configure security groups to allow access
   - Update .env with RDS connection details

2. **Google Cloud SQL**:
   - Create Cloud SQL instance with PostgreSQL
   - Configure authentication
   - Update .env with connection details

3. **Heroku Postgres**:
   - Add Heroku Postgres add-on
   - Update .env with DATABASE_URL

## Running the Application

### Development Mode
```bash
cd backend
npm run dev
```

The application will start in development mode and:
- Log database connection status
- Warn if database is not available
- Continue running with limited functionality
- Provide clear error messages

### Production Mode
```bash
# Set environment variable
export NODE_ENV=production

# Start the application
npm start
```

The application will:
- Require database connection
- Exit if database is not available
- Use migrations instead of auto-sync
- Log all errors appropriately

## Database Seeding

### Run Seed Script
```bash
cd backend
npm run seed
```

This will populate the database with:
- Sample users
- Sample invitations
- Sample background images
- Sample gallery images

## API Endpoints

All API endpoints are now integrated with the database:

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/password` - Change password
- `POST /api/users/refresh` - Refresh access token
- `POST /api/users/logout` - User logout
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password
- `POST /api/users/send-verification` - Send email verification
- `POST /api/users/verify-email` - Verify email

### Invitation Management
- `GET /api/invitations` - Get all invitations
- `GET /api/invitations/:id` - Get invitation by ID
- `GET /api/invitations/slug/:slug` - Get invitation by slug
- `POST /api/invitations` - Create invitation
- `PUT /api/invitations/:id` - Update invitation
- `DELETE /api/invitations/:id` - Delete invitation

### RSVP Management
- `GET /api/rsvps` - Get all RSVPs
- `GET /api/rsvps/:id` - Get RSVP by ID
- `GET /api/rsvps/invitation/:invitationId` - Get RSVPs by invitation
- `POST /api/rsvps` - Create RSVP
- `PUT /api/rsvps/:id` - Update RSVP
- `DELETE /api/rsvps/:id` - Delete RSVP

### Guest Wishes
- `GET /api/guest-wishes` - Get all guest wishes
- `GET /api/guest-wishes/:id` - Get guest wish by ID
- `GET /api/guest-wishes/invitation/:invitationId` - Get wishes by invitation
- `POST /api/guest-wishes` - Create guest wish
- `DELETE /api/guest-wishes/:id` - Delete guest wish

### Itinerary Management
- `GET /api/itinerary/invitation/:invitationId` - Get itinerary items
- `POST /api/itinerary` - Create itinerary item
- `PUT /api/itinerary/:id` - Update itinerary item
- `DELETE /api/itinerary/:id` - Delete itinerary item

### Contact Persons
- `GET /api/contact-persons/invitation/:invitationId` - Get contact persons
- `POST /api/contact-persons` - Create contact person
- `PUT /api/contact-persons/:id` - Update contact person
- `DELETE /api/contact-persons/:id` - Delete contact person

### Gallery Management
- `GET /api/gallery/invitation/:invitationId` - Get gallery images
- `POST /api/gallery` - Add gallery image
- `PUT /api/gallery/:id` - Update gallery image
- `DELETE /api/gallery/:id` - Delete gallery image

### Background Images
- `GET /api/backgrounds` - Get all background images
- `GET /api/backgrounds/:id` - Get background image by ID
- `POST /api/backgrounds` - Create background image
- `PUT /api/backgrounds/:id` - Update background image
- `DELETE /api/backgrounds/:id` - Delete background image

## Database Schema

The database schema includes:

### Users Table
- id (UUID, Primary Key)
- email (String, Unique)
- name (String)
- password (String, Hashed)
- membership_tier (Enum)
- membership_expires_at (DateTime)
- email_verified (Boolean)
- created_at (DateTime)
- updated_at (DateTime)

### Invitations Table
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- slug (String, Unique)
- template_id (String)
- event_type (String)
- bride_name (String)
- groom_name (String)
- host_names (String)
- event_date (DateTime)
- start_time (String)
- end_time (String)
- location_name (String)
- address (String)
- google_maps_url (String)
- waze_url (String)
- views (Integer, Default: 0)
- created_at (DateTime)
- updated_at (DateTime)
- JSON fields for settings, money_gift_details, etc.

### RSVPs Table
- id (UUID, Primary Key)
- invitation_id (UUID, Foreign Key)
- guest_name (String)
- pax (Integer)
- is_attending (Boolean)
- phone_number (String)
- message (Text)
- created_at (DateTime)
- updated_at (DateTime)

### Guest Wishes Table
- id (UUID, Primary Key)
- invitation_id (UUID, Foreign Key)
- name (String)
- message (Text)
- created_at (DateTime)
- updated_at (DateTime)

### Itinerary Items Table
- id (UUID, Primary Key)
- invitation_id (UUID, Foreign Key)
- time (String)
- activity (String)
- created_at (DateTime)
- updated_at (DateTime)

### Contact Persons Table
- id (UUID, Primary Key)
- invitation_id (UUID, Foreign Key)
- name (String)
- relation (String)
- phone (String)
- created_at (DateTime)
- updated_at (DateTime)

### Gallery Table
- id (UUID, Primary Key)
- invitation_id (UUID, Foreign Key)
- url (String)
- caption (Text)
- created_at (DateTime)
- updated_at (DateTime)

### Background Images Table
- id (UUID, Primary Key)
- name (String)
- url (String)
- thumbnail (String)
- category (Enum)
- is_premium (Boolean)
- tags (Array)
- created_at (DateTime)
- updated_at (DateTime)

## Performance Optimizations

### Database Indexes
- Primary keys on all tables
- Unique indexes on email, slug
- Foreign key indexes for relationships
- Composite indexes for common query patterns

### Connection Pooling
- Min connections: 2
- Max connections: 10
- Connection timeout: 30 seconds
- Idle timeout: 10 seconds

## Security Features

### Password Security
- bcrypt hashing with salt rounds: 10
- Secure password reset tokens
- Email verification system

### Data Validation
- Input validation on all endpoints
- SQL injection prevention through ORM
- XSS protection through helmet middleware

### Rate Limiting
- 100 requests per 15 minutes per IP
- Standard security headers
- CORS configuration for frontend

## Monitoring and Logging

### Application Logs
- Request logging with Morgan
- Error logging with detailed stack traces
- Database query logging in development
- Performance monitoring for slow queries

### Health Checks
- `/health` endpoint for monitoring
- Database connection status
- Server status information

## Next Steps

1. **Database Migration**: Set up production database
2. **Environment Configuration**: Configure production environment variables
3. **Testing**: Run comprehensive API tests
4. **Performance Monitoring**: Set up query performance monitoring
5. **Backup Strategy**: Implement database backup procedures

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check PostgreSQL is running
   - Verify database credentials
   - Check network connectivity

2. **Migration Errors**:
   - Check database permissions
   - Verify schema compatibility
   - Run migrations manually if needed

3. **Performance Issues**:
   - Check database indexes
   - Monitor slow queries
   - Optimize connection pool settings

### Debug Mode

Enable debug logging:
```bash
export DEBUG=*
npm run dev
```

This will provide detailed database operation logs for troubleshooting.