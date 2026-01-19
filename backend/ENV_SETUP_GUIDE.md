# Environment Variables Setup Guide

## 📋 Required Configuration Before Running Backend

### 🔴 **CRITICAL - Must Configure Before Running**

#### 1. **Database (PostgreSQL) - REQUIRED**
```env
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/courier_db?schema=public
```

**How to get:**
- Install PostgreSQL locally or use cloud service
- Create a database (e.g., `courier_db`)
- Replace `username`, `password`, `host`, `port`, `database` with your values

#### 2. **JWT Secrets - REQUIRED**
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

**How to generate:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Minimum:** 32 characters, use strong random strings

### 🟡 **IMPORTANT - Recommended to Configure**

#### 3. **Redis - REQUIRED for Caching & Queues**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
```

**If Redis not available:**
- App will work but caching won't function
- Queues won't work
- For development, you can skip Redis (app will use in-memory cache)

#### 4. **CORS - Required if Frontend on Different Port**
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**Set to your frontend URL(s)**

### 🟢 **OPTIONAL - Can Configure Later**

#### 5. **Email (Optional - for notifications)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@courier.com
```

#### 6. **SMS (Optional - for notifications)**
```env
SMS_API_KEY=your-sms-api-key
SMS_API_URL=https://api.sms-provider.com
```

#### 7. **Other Optional Settings**
```env
NODE_ENV=development          # or 'production'
PORT=3000                     # Server port
API_PREFIX=api/v1             # API prefix
THROTTLE_TTL=60               # Rate limit window (seconds)
THROTTLE_LIMIT=100            # Max requests per window
LOG_LEVEL=debug               # Logging level
```

## 🚀 Quick Setup Steps

### Step 1: Create .env File
```bash
cd backend
cp .env.example .env
```

### Step 2: Configure Database
Edit `.env` and set:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/courier_db?schema=public
```

### Step 3: Generate JWT Secrets
```bash
# Generate secrets (use any method)
JWT_SECRET=your-random-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-random-refresh-secret-here-min-32-chars
```

### Step 4: Configure Redis (if available)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Step 5: Set CORS (if needed)
```env
CORS_ORIGIN=http://localhost:3000
```

## 📝 Minimum Configuration for Development

**Minimum required to run:**
```env
# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:password@localhost:5432/courier_db?schema=public

# JWT Secrets (REQUIRED)
JWT_SECRET=change-this-to-a-random-32-character-string
JWT_REFRESH_SECRET=change-this-to-a-random-32-character-string

# Redis (can use defaults if local)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🔧 Setup Checklist

Before running `npm run start:dev`:

- [ ] PostgreSQL is installed and running
- [ ] Database `courier_db` is created (or use your database name)
- [ ] `.env` file created from `.env.example`
- [ ] `DATABASE_URL` configured correctly
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` set (strong random strings)
- [ ] Redis is running (optional for development)
- [ ] `CORS_ORIGIN` set to your frontend URL

## 🐛 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready` or check service
- Verify DATABASE_URL format is correct
- Ensure database exists: `CREATE DATABASE courier_db;`
- Check username/password are correct

### Redis Connection Error
- Check Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT
- For development, you can skip Redis (app will work without it)

### JWT Errors
- Ensure JWT_SECRET is at least 32 characters
- Use strong random strings
- Don't use simple passwords

## 💡 Production Recommendations

For production:
- Use strong, randomly generated JWT secrets
- Use environment-specific database
- Configure proper CORS origins
- Set NODE_ENV=production
- Use secure Redis with password
- Configure email/SMS for notifications
- Set appropriate rate limits
- Use proper logging level

