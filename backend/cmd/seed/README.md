# Database Seeder

This script creates an admin user in the database.

## Usage

```bash
cd backend
go run cmd/seed/main.go
```

## Default Admin Credentials

- **Email**: `admin@preptoplate.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the admin password immediately after first login in production!

## What it does

1. Connects to the database using your `.env` configuration
2. Checks if admin user already exists (to prevent duplicates)
3. Creates admin user with hashed password
4. Prints confirmation with credentials
