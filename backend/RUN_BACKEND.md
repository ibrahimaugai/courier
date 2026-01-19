# How to Run the Backend

## 🚀 Quick Start

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 3: Setup Environment Variables
```bash
# Create .env file (if not already created)
# Copy from ENVIRONMENT_VARIABLES.md template
# Or create manually with required variables
```

**Minimum required in .env:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/courier_db?schema=public
JWT_SECRET=Kf8Hq3TzS9aW2XnB5mY7PjR4LkD6QvN1
JWT_REFRESH_SECRET=bT4QnP8XwJ2sC9RkM7yFhA3ZpL6dV0Tg
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations (creates all tables)
npm run prisma:migrate dev

# (Optional) Seed database with initial data
npm run prisma:seed
```

### Step 5: Start the Server

**Development Mode (with hot reload):**
```bash
npm run start:dev
```

**Production Mode:**
```bash
npm run build
npm run start:prod
```

## ✅ Verify It's Running

After starting, you should see:
```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api/docs
```

## 🔍 Access Points

- **API Base URL:** http://localhost:3000/api/v1
- **Swagger Documentation:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api/v1 (if implemented)

## 📋 Prerequisites Checklist

Before running, ensure:
- [ ] PostgreSQL is installed and running
- [ ] Database `courier_db` exists (or your database name)
- [ ] `.env` file is configured
- [ ] `DATABASE_URL` is correct
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- [ ] Redis is running (optional, but recommended)
- [ ] Dependencies installed (`npm install`)

## 🐛 Troubleshooting

### Error: Cannot connect to database
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### Error: Prisma Client not generated
- Run: `npm run prisma:generate`

### Error: Port 3000 already in use
- Change PORT in .env to different port (e.g., 3001)
- Or stop the process using port 3000

### Error: Redis connection failed
- Check Redis is running
- Or remove Redis requirement (app will use in-memory cache)

## 📝 Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio (database GUI)
npm run prisma:seed       # Seed database

# Code Quality
npm run lint              # Check code style
npm run format            # Format code
```

## 🎯 First Run Steps Summary

```bash
# 1. Go to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Setup .env file (create with your values)

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Run migrations
npm run prisma:migrate dev

# 6. (Optional) Seed database
npm run prisma:seed

# 7. Start server
npm run start:dev
```

## ✅ Success Indicators

When backend is running successfully:
- ✅ Server starts without errors
- ✅ Shows "Application is running on: http://localhost:3000"
- ✅ Swagger docs accessible at http://localhost:3000/api/docs
- ✅ Can make API requests to endpoints

## 🔗 Test the API

Once running, test with:
1. Open Swagger: http://localhost:3000/api/docs
2. Try `/api/v1/auth/register` endpoint
3. Try `/api/v1/auth/login` endpoint

