# Courier Management System API

NestJS-based scalable backend API for NPS Courier and Logistics Management System.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run start:dev
```

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

## 📁 Project Structure

```
src/
├── common/           # Shared utilities, decorators, guards, filters
├── config/           # Configuration files
├── modules/          # Feature modules
│   ├── auth/         # Authentication & Authorization
│   ├── users/        # User management
│   ├── customers/    # Customer management
│   ├── bookings/     # Booking management
│   ├── cn/           # CN allocation & management
│   ├── operations/   # Operations (manifest, delivery, etc.)
│   ├── batches/      # Batch management
│   ├── collections/  # Collection management
│   ├── reports/      # Reporting
│   └── config/       # System configuration
├── main.ts           # Application entry point
└── app.module.ts     # Root module
```


## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api/docs

## 🔧 Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🏗️ Architecture

- **Modular Architecture**: Feature-based modules
- **Dependency Injection**: NestJS built-in DI
- **Database**: Prisma ORM with PostgreSQL
- **Caching**: Redis for performance
- **Queue**: Bull for background jobs
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration

## 📈 Scalability Features

- Redis caching
- Bull queues for background jobs
- Database connection pooling
- Query optimization
- Pagination support
- Compression middleware

