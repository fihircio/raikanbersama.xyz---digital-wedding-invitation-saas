# Database Setup Guide

This guide explains how to set up PostgreSQL for the RaikanBersama.xyz wedding invitation SaaS.

## Prerequisites

1. **PostgreSQL Server**: Make sure you have PostgreSQL installed and running
   - On macOS: `brew install postgresql` and `brew services start postgresql`
   - On Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib` and `sudo systemctl start postgresql`
   - On Windows: Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Database Creation**: Create a database for the application
   ```sql
   CREATE DATABASE raikanbersama;
   ```

## Environment Configuration

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your PostgreSQL configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=raikanbersama
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_SSL=false
   DB_POOL_MIN=2
   DB_POOL_MAX=10
   ```

## Database Initialization

### Option 1: Using the Seed Script (Recommended for Development)

1. Run the seed script to populate the database with initial data:
   ```bash
   npm run seed
   ```

This will create:
- Users with sample data
- Sample invitation with related data
- Background images
- RSVPs, guest wishes, itinerary items, contact persons, and gallery items

### Option 2: Manual Database Setup

1. The application will automatically create tables on first run (in development mode)
2. Tables will be created with proper relationships and indexes

## Database Schema

The following tables will be created:

1. **users** - User accounts and authentication
2. **invitations** - Wedding invitation details
3. **rsvps** - RSVP responses
4. **guest_wishes** - Guest messages and wishes
5. **itinerary_items** - Event schedule/timeline
6. **contact_persons** - Contact information for the event
7. **gallery** - Photo gallery for invitations
8. **background_images** - Available background images

## Connection Pooling

The application uses Sequelize with connection pooling:
- Minimum connections: 2
- Maximum connections: 10
- Connection timeout: 30 seconds
- Idle timeout: 10 seconds

## Performance Optimizations

The following indexes are automatically created:
- Primary keys on all tables
- Unique indexes on email (users) and slug (invitations)
- Foreign key indexes for relationships
- Composite indexes for frequently queried fields

## Troubleshooting

### Connection Issues

If you encounter connection errors:

1. **Check PostgreSQL is running**:
   ```bash
   pg_isready
   ```

2. **Verify database exists**:
   ```bash
   psql -h localhost -U postgres -l
   ```

3. **Check connection parameters**:
   - Host: localhost (or your DB_HOST)
   - Port: 5432 (or your DB_PORT)
   - Database: raikanbersama (or your DB_NAME)
   - User: postgres (or your DB_USER)

4. **Create database if needed**:
   ```bash
   createdb raikanbersama
   ```

### Permission Issues

If you encounter permission errors:

1. **Create user with privileges**:
   ```sql
   CREATE USER raikanbersama_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE raikanbersama TO raikanbersama_user;
   ```

2. **Update .env with new user credentials**:
   ```env
   DB_USER=raikanbersama_user
   DB_PASSWORD=secure_password
   ```

## Migration Strategy

For production environments:

1. **Use proper migration tools** like Sequelize CLI or custom migration scripts
2. **Backup database before migrations**
3. **Test migrations in staging first**
4. **Keep migration files in version control**

## Backup and Recovery

### Automated Backups

Set up automated backups with cron:

```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -h localhost -U postgres raikanbersama > /backups/raikanbersama_$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 pg_dump -h localhost -U postgres raikanbersama > /backups/raikanbersama_weekly_$(date +\%Y\%m\%d).sql
```

### Recovery

To restore from backup:

```bash
psql -h localhost -U postgres raikanbersama < /backups/raikanbersama_backup.sql
```

## Security Considerations

1. **Use SSL in production**: Set `DB_SSL=true` in production
2. **Strong passwords**: Use strong passwords for database users
3. **Network security**: Restrict database access to application servers only
4. **Regular updates**: Keep PostgreSQL updated with security patches

## Monitoring

Monitor these metrics:

1. **Connection pool usage**: Active vs idle connections
2. **Query performance**: Slow queries and execution time
3. **Database size**: Growth over time
4. **Error rates**: Connection failures and timeouts

## Next Steps

After setting up the database:

1. Update the application configuration
2. Run the seed script to populate initial data
3. Start the application: `npm run dev`
4. Test all API endpoints to ensure proper integration
5. Set up monitoring and backup procedures