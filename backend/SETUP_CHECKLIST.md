# Backend Setup Checklist

## ✅ Pre-Run Checklist

### 1. Install Prerequisites
- [ ] Node.js (v18+) installed
- [ ] PostgreSQL (v14+) installed and running
- [ ] Redis (v6+) installed and running (optional for dev)

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Configure `DATABASE_URL` with your PostgreSQL credentials
- [ ] Set `JWT_SECRET` (generate strong random string)
- [ ] Set `JWT_REFRESH_SECRET` (generate strong random string)
- [ ] Configure `REDIS_HOST` and `REDIS_PORT` (if using Redis)
- [ ] Set `CORS_ORIGIN` to your frontend URL

### 3. Database Setup
- [ ] Create PostgreSQL database
- [ ] Run `npm run prisma:generate`
- [ ] Run `npm run prisma:migrate`
- [ ] (Optional) Run `npm run prisma:seed` for initial data

### 4. Dependencies
- [ ] Run `npm install`

### 5. Start Server
- [ ] Run `npm run start:dev`
- [ ] Verify server starts on port 3000
- [ ] Check Swagger docs at http://localhost:3000/api/docs

## 🔑 Required Environment Variables

**Minimum Required:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/courier_db?schema=public
JWT_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-32-char-refresh-secret-here
```

**Recommended:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## 📚 See Also

- `ENV_SETUP_GUIDE.md` - Detailed environment setup
- `README.md` - General setup instructions
- `.env.example` - All available environment variables

