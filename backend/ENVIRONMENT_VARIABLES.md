# Environment Variables Configuration

## 📋 Complete .env File Template

Create a `.env` file in the `backend/` directory with the following:

```env
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# ============================================
# DATABASE CONFIGURATION (REQUIRED ⚠️)
# ============================================
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database?schema=public
DATABASE_URL=postgresql://postgres:password@localhost:5432/courier_db?schema=public

# ============================================
# JWT AUTHENTICATION (REQUIRED ⚠️)
# ============================================
# Generate strong random secrets (minimum 32 characters)
# Use: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# REDIS CONFIGURATION (REQUIRED for caching)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# ============================================
# BULL QUEUE CONFIGURATION (REQUIRED for queues)
# ============================================
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@courier.com

# ============================================
# SMS CONFIGURATION (Optional)
# ============================================
SMS_API_KEY=your-sms-api-key
SMS_API_URL=https://api.sms-provider.com

# ============================================
# RATE LIMITING
# ============================================
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# ============================================
# CORS CONFIGURATION
# ============================================
# Comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
```

## 🔴 **CRITICAL - Must Configure Before Running**

### 1. **DATABASE_URL** (REQUIRED)
```env
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
```

**Steps:**
1. Install PostgreSQL
2. Create database: `CREATE DATABASE courier_db;`
3. Replace in connection string:
   - `username` - Your PostgreSQL username (usually `postgres`)
   - `password` - Your PostgreSQL password
   - `host` - Usually `localhost`
   - `port` - Usually `5432`
   - `database` - Database name (e.g., `courier_db`)

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/courier_db?schema=public
```

### 2. **JWT_SECRET** (REQUIRED)
```env
JWT_SECRET=your-random-secret-minimum-32-characters-long
```

**Generate Secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Example:**
```env
JWT_SECRET=aB3xK9mP2qR7vT5wY8zA1bC4dE6fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
```

### 3. **JWT_REFRESH_SECRET** (REQUIRED)
```env
JWT_REFRESH_SECRET=your-random-refresh-secret-minimum-32-characters-long
```

Generate a different random string (same method as above)

## 🟡 **IMPORTANT - Recommended**

### 4. **Redis Configuration**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
```

**If Redis not available:**
- App will work but caching/queues won't function
- For development, you can skip (uses in-memory cache)

### 5. **CORS_ORIGIN**
```env
CORS_ORIGIN=http://localhost:3000
```

Set to your frontend URL. If frontend on different port, add it:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## 🟢 **OPTIONAL - Can Configure Later**

- Email settings (for notifications)
- SMS settings (for notifications)
- Other optional configurations

## 🚀 **Quick Setup (Minimum Required)**

Create `.env` file with minimum required:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/courier_db?schema=public

# JWT Secrets (generate random 32+ char strings)
JWT_SECRET=change-this-to-random-32-character-string-here
JWT_REFRESH_SECRET=change-this-to-different-random-32-character-string

# Redis (defaults work if Redis is on localhost:6379)
REDIS_HOST=localhost
REDIS_PORT=6379
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📝 **Setup Steps**

1. **Create .env file:**
   ```bash
   cd backend
   # Copy this template and create .env file
   ```

2. **Configure DATABASE_URL:**
   - Install PostgreSQL
   - Create database
   - Update connection string

3. **Generate JWT Secrets:**
   - Use openssl or any random string generator
   - Minimum 32 characters
   - Use different secrets for JWT_SECRET and JWT_REFRESH_SECRET

4. **Start PostgreSQL:**
   ```bash
   # Windows
   # Start PostgreSQL service

   # Linux/Mac
   sudo systemctl start postgresql
   ```

5. **Start Redis (optional):**
   ```bash
   # Windows
   # Start Redis service

   # Linux/Mac
   sudo systemctl start redis
   ```

6. **Run migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

7. **Start server:**
   ```bash
   npm run start:dev
   ```

## ⚠️ **Important Notes**

- **Never commit `.env` file** to git (already in .gitignore)
- **Use strong secrets** in production
- **Change default passwords** in production
- **DATABASE_URL** must be correct or app won't start
- **JWT secrets** must be set or authentication won't work

## 🔍 **Verify Configuration**

After setting up, verify:
- [ ] PostgreSQL is running
- [ ] Database exists
- [ ] DATABASE_URL is correct
- [ ] JWT secrets are set (32+ chars)
- [ ] Redis is running (if using)
- [ ] CORS_ORIGIN matches frontend URL

