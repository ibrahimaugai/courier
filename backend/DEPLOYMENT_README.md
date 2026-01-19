# Deployment Guide

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)

### Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: creates default users

# Start server
npm run start:dev     # Development
npm run start:prod    # Production
```

### Default Credentials (After Seed)
- Admin: `admin` / `admin123`
- User: `user` / `user123`

## Docker Deployment

```bash
docker-compose up -d
```

## API Documentation

- Swagger UI: http://localhost:3000/api/docs

## Environment Variables

See `.env.example` for required variables.

