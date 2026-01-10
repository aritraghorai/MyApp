# Prisma Migration Guide

## Overview

This project uses Prisma 7 with SQLite for database management. Due to a Prisma 7 limitation, migrations require the database file to exist before running.

## Quick Start

### Local Development

```bash
# If database doesn't exist, create it first
sqlite3 dev.db "VACUUM;"

# Run migrations
docker compose run --rm migration

# Start development server
bun run dev
```

### VPS Deployment

```bash
# 1. Navigate to project directory
cd /var/www/personal-manager

# 2. Create database file
sqlite3 dev.db "VACUUM;"

# 3. Run migrations
docker compose run --rm migration

# 4. Start application
docker compose up -d --build
```

## Database Configuration

### Environment Variables

The `DATABASE_URL` is configured in `.env`:

```bash
DATABASE_URL="file:./dev.db"
```

**Important:** Use relative path `file:./dev.db` (not absolute path). Prisma 7 requires the database file to exist before migrations.

### Prisma Configuration

The project uses `prisma.config.ts` (required by Prisma 7):

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## Migration Commands

### Run Migrations

```bash
# Using Docker (recommended for production)
docker compose run --rm migration

# Using Bun directly
bun prisma migrate deploy
```

### Create New Migration

```bash
# Generate migration from schema changes
bun prisma migrate dev --name migration_name
```

### Generate Prisma Client

```bash
bun prisma generate
```

## Troubleshooting

### Error: "Error parsing connection string: ./dev.db"

**Cause:** Database file doesn't exist.

**Solution:**
```bash
# Create empty database
sqlite3 dev.db "VACUUM;"

# Then run migrations
docker compose run --rm migration
```

### Error: "P1013: The provided database string is invalid"

**Cause:** Prisma 7 bug when database file is missing.

**Solution:** Ensure database file exists before running migrations (see above).

### Migration Container Fails

**Check logs:**
```bash
docker compose logs migration
```

**Rebuild migration image:**
```bash
docker compose build --no-cache migration
docker compose run --rm migration
```

## Docker Migration Setup

The `Dockerfile.migration` handles:
- Installing Prisma CLI and dependencies
- Creating `.env` file in container
- Generating Prisma Client
- Running migrations with `prisma migrate deploy`

### Migration Workflow

1. Reads `DATABASE_URL` from environment (via docker-compose)
2. Creates `.env` file in container for `prisma.config.ts`
3. Creates database file if it doesn't exist
4. Generates Prisma Client
5. Runs migrations

## Best Practices

### Development

1. Always commit migration files to version control
2. Test migrations locally before deploying
3. Keep database schema in sync with Prisma schema

### Production

1. **Backup database before migrations:**
   ```bash
   cp dev.db dev.db.backup
   ```

2. **Run migrations in a transaction** (handled by Prisma automatically)

3. **Verify migrations:**
   ```bash
   docker compose run --rm migration
   # Check output for "All migrations have been successfully applied"
   ```

### CI/CD

```bash
# In your deployment script
sqlite3 dev.db "VACUUM;"  # Ensure DB exists
docker compose run --rm migration
docker compose up -d --build
```

## Database Backup

### Manual Backup

```bash
# Backup database
cp dev.db backups/dev_$(date +%Y%m%d_%H%M%S).db

# Restore from backup
cp backups/dev_20260110_225500.db dev.db
```

### Automated Backup (Recommended for Production)

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /var/www/personal-manager && cp dev.db backups/dev_$(date +\%Y\%m\%d).db && find backups/ -name "dev_*.db" -mtime +7 -delete
```

## Schema Management

### View Current Schema

```bash
bun prisma db pull
```

### Reset Database (Development Only)

```bash
# WARNING: Deletes all data
rm dev.db
sqlite3 dev.db "VACUUM;"
docker compose run --rm migration
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
