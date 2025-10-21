# YouTube Creator Authentication & Management Module

This is a Next.js implementation of a YouTube creator authentication and management system using Prisma ORM and tRPC for type-safe APIs.

## Architecture

The project follows a clean architecture pattern with clear separation of concerns:

### Directory Structure

```
src/server/modules/
├── creator/                          # Creator module (YouTube creator management)
│   ├── domain/                       # Business logic & interfaces
│   │   ├── enums/                    # YtCreatorStatus enum
│   │   ├── models/                   # Domain models (IYtCreatorEntity)
│   │   └── ports/                    # Repository interfaces
│   ├── application/                  # Use cases & services
│   │   ├── dtos/                     # Data transfer objects (validation schemas)
│   │   ├── functions/                # Business functions
│   │   └── services/                 # YtCreatorService
│   ├── infrastructure/               # Data access layer
│   │   └── adapters/                 # Prisma repository implementation
│   └── presentation/                 # API layer (if needed)
│
├── youtube/                          # YouTube OAuth & operations module
│   ├── application/                  # YouTube OAuth service
│   │   └── services/                 # YtAuthService
│   └── presentation/                 # API layer (if needed)
│
└── common/                           # Shared utilities
```

## Key Features

### Creator Module
- **Create** creator entries with YouTube OAuth tokens
- **Read** creators by ID, email, or query filters
- **Update** creator information and tokens
- **Delete** creator entries

### YouTube Authentication Module
- **Get Auth URL** - Generate Google OAuth authorization URL
- **Handle OAuth Callback** - Exchange authorization code for tokens
- **Get Channel Info** - Fetch YouTube channel information
- **Upload Video** - Upload videos to YouTube (requires file handling)
- **Token Refresh** - Automatically refresh expired access tokens

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Prisma

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init
```

### 3. Configure Environment Variables

Create `.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bulkthing"
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
```

### 4. Run the Application

```bash
npm run dev
```

## API Usage (tRPC)

### Creator Endpoints

```typescript
// Create a creator
await trpc.creator.create.mutate({
  creatorId: 'uuid',
  email: 'creator@example.com',
  accessToken: 'token',
  refreshToken: 'refresh_token',
  status: 'active'
})

// Get all creators (with optional filters)
await trpc.creator.getAll.query({
  id: 'uuid',
  creatorId: 'uuid',
  email: 'creator@example.com',
  status: 'active'
})

// Get creator by ID
await trpc.creator.getById.query({ id: 'uuid' })

// Get creator by email
await trpc.creator.getByEmail.query({ email: 'creator@example.com' })

// Update creator
await trpc.creator.update.mutate({
  id: 'uuid',
  data: { accessToken: 'new_token', status: 'inactive' }
})

// Delete creator
await trpc.creator.delete.mutate({ id: 'uuid' })
```

### YouTube Auth Endpoints

```typescript
// Get authorization URL
const authUrl = await trpc.youtube.getAuthUrl.query()

// Handle OAuth callback
const result = await trpc.youtube.handleCallback.mutate({
  code: 'authorization_code',
  email: 'creator@example.com'
})

// Get YouTube channel info
const channelInfo = await trpc.youtube.getChannelInfo.query({ id: 'creator_id' })
```

## Database Schema

```prisma
model YtCreator {
  id           String           @id @default(uuid())
  creatorId    String           @unique
  email        String           @unique
  accessToken  String           @unique
  refreshToken String           @unique
  status       YtCreatorStatus  @default(active)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@map("yt_creator")
}

enum YtCreatorStatus {
  active
  inactive
  suspended
  deleted
}
```

## Design Patterns

### Repository Pattern
The `YtCreatorRepository` implements the `IYtCreatorRepository` interface, providing a clean abstraction over Prisma database operations.

### Service Layer
`YtCreatorService` and `YtAuthService` contain business logic and coordinate between the API layer and data access layer.

### Dependency Injection
Services are initialized with their dependencies (repositories) in the router files.

### DTOs with Validation
Zod schemas are used for runtime validation of input data.

## Environment Requirements

- Node.js 18+
- PostgreSQL 12+ (or compatible database)
- YouTube OAuth 2.0 credentials (Client ID and Secret)

## File Reference Guide

| File | Purpose |
|------|---------|
| `src/server/db.ts` | Prisma client initialization |
| `src/server/modules/creator/...` | Creator CRUD operations |
| `src/server/modules/youtube/...` | YouTube OAuth & API operations |
| `src/server/routers/creator.ts` | tRPC routes for creator |
| `src/server/routers/youtube.ts` | tRPC routes for YouTube |
| `prisma/schema.prisma` | Database schema definition |

## Notes

- Video upload functionality requires custom file handling and is triggered via REST API, not tRPC
- Refresh tokens are cached and reused; automatic refresh happens when tokens expire
- All creator entries require unique email and creatorId
- The module uses PostgreSQL but can be adapted to other databases supported by Prisma
