# Skylad Backend Assignment

A comprehensive backend service for document management with folders, tags, OCR webhooks, and RBAC.

## Timeline

- **Start Date:** 2025-01-13
- **Submit Date:** 2025-01-13

## Features

### 1. Document & Tagging Model

- User, Document, Tag, and DocumentTag entities
- Each document must have exactly one primary tag
- Support for secondary tags
- Full-text search with scope filtering

### 2. Scoped Actions

- Run actions on folders or specific files
- Mock processor for generating documents and CSV files
- Usage tracking (5 credits per request)

### 3. OCR Webhook Ingestion

- Content classification (official/ad)
- Automatic task creation for ads with unsubscribe info
- Rate limiting (3 tasks per sender per day per user)

### 4. RBAC & Security

- Roles: admin, support, moderator, user
- JWT-based authentication
- Tenant isolation enforced at service level

### 5. Auditing & Metrics

- Comprehensive audit logging
- Metrics endpoint for system statistics

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (Passport)
- **Validation:** class-validator, class-transformer
- **API Documentation:** Swagger/OpenAPI

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (or use Docker)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and set your MongoDB connection string
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skylad?appName=Cluster0
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/skylad
```

### Running with Docker

```bash
# Start MongoDB and API
docker-compose up -d

# Seed the database
docker-compose exec api npm run seed
```

### Running Locally

```bash
# Start MongoDB (if not using Docker)
# Make sure MongoDB is running on localhost:27017

# Start the API
npm run dev

# In another terminal, seed the database
npm run seed
```

The API will be available at `http://localhost:3000`

**Swagger Documentation:**

- Interactive UI: `http://localhost:3000/api`
- OpenAPI JSON: `http://localhost:3000/api-json`
- OpenAPI YAML: `http://localhost:3000/api-yaml`

To export the Swagger JSON: `npm run swagger:export` (requires server to be running)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run linter
- `npm run seed` - Seed database with demo data and generate JWT tokens for all users
- `npm run token <email>` - Generate a JWT token for a specific user (e.g., `npm run token admin@example.com`)
- `npm run test:api` - Run API endpoint tests
- `npm run swagger:export` - Export Swagger/OpenAPI JSON to `swagger.json` (requires server to be running)

## API Reference

All endpoints are prefixed with `/v1`. Authentication is required for all endpoints using JWT Bearer tokens.

### Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

#### Getting JWT Tokens

There are two ways to get JWT tokens:

**Method 1: Run the seed script (gets all tokens at once)**

```bash
npm run seed
```

This will output JWT tokens for admin, user1, user2, and support users.

**Method 2: Generate token for a specific user (recommended)**

```bash
# Generate token for admin
npm run token admin@example.com

# Generate token for user1
npm run token user1@example.com

# Generate token for user2
npm run token user2@example.com

# Generate token for support
npm run token support@example.com
```

The seed script creates these demo users:

- `admin@example.com` (admin role)
- `user1@example.com` (user role)
- `user2@example.com` (user role)
- `support@example.com` (support role)

### Document APIs

#### Upload Document

```bash
POST /v1/docs
Content-Type: application/json
Authorization: Bearer <token>

{
  "filename": "invoice-2025-01.pdf",
  "mime": "application/pdf",
  "textContent": "Invoice content...",
  "primaryTag": "invoices-2025",
  "secondaryTags": ["january", "billing"]
}
```

#### List Folders

```bash
GET /v1/folders
Authorization: Bearer <token>
```

Response:

```json
[
  { "name": "invoices-2025", "count": 5 },
  { "name": "legal", "count": 2 }
]
```

#### Get Folder Documents

```bash
GET /v1/folders/{tag}/docs
Authorization: Bearer <token>
```

Example:

```bash
GET /v1/folders/invoices-2025/docs
```

#### Search Documents

```bash
GET /v1/search?q=invoice&scope=files&ids[]=doc1&ids[]=doc2
Authorization: Bearer <token>
```

Query parameters:

- `q` (required): Search query
- `scope` (optional): `folder` or `files`
- `ids[]` (optional): Array of document IDs (only with `scope=files`)

**Note:** Cannot use both folder scope and file IDs.

### Actions APIs

#### Run Scoped Action

```bash
POST /v1/actions/run
Content-Type: application/json
Authorization: Bearer <token>

{
  "scope": {
    "type": "folder",
    "name": "invoices-2025"
  },
  "messages": [
    {
      "role": "user",
      "content": "make a CSV of vendor totals"
    }
  ],
  "actions": ["make_document", "make_csv"]
}
```

For file scope:

```json
{
  "scope": {
    "type": "files",
    "ids": ["doc1", "doc2"]
  },
  "messages": [...],
  "actions": ["make_document"]
}
```

**Note:** Cannot use both folder scope and file IDs.

#### Get Usage for Month

```bash
GET /v1/actions/usage/month?year=2025&month=1
Authorization: Bearer <token>
```

### Webhook APIs

#### OCR Webhook

```bash
POST /v1/webhooks/ocr
Content-Type: application/json
Authorization: Bearer <token>

{
  "source": "scanner-01",
  "imageId": "img_123",
  "text": "LIMITED TIME SALE… unsubscribe: mailto:stop@brand.com",
  "meta": {
    "address": "123 Main St"
  }
}
```

### Metrics API

#### Get Metrics

```bash
GET /v1/metrics
Authorization: Bearer <token>
```

Response:

```json
{
  "docs_total": 123,
  "folders_total": 7,
  "actions_month": 42,
  "tasks_today": 5
}
```

**Note:** Requires admin, support, or moderator role.

## RBAC Roles

- **user**: CRUD on own docs/tags, run actions, view usage
- **support**: Read-only access
- **moderator**: Read-only access
- **admin**: Full access to all resources

## Design Decisions & Tradeoffs

### Architecture

- **NestJS**: Chosen for its modular architecture, dependency injection, and built-in support for TypeScript.
- **MongoDB**: Flexible schema for document metadata and tags, with good support for full-text search.

### Data Modeling

- **Primary Tag Constraint**: Enforced at application level through DocumentTag schema with `isPrimary: true`. Could be enforced at database level with a unique index, but application-level validation provides better error messages.
- **Tenant Isolation**: Implemented at service level by filtering all queries by `ownerId`. This ensures users can only access their own data without requiring complex middleware.

### Security

- **JWT Authentication**: Simple and stateless, suitable for API-first architecture.
- **Role-Based Access**: Implemented using NestJS guards and decorators for clean, declarative authorization.

### Tradeoffs

1. **Full-text Search**: Using MongoDB's text index. For production, consider Elasticsearch for better search capabilities.
2. **Mock Processor**: Deterministic but simple. In production, would integrate with actual AI/ML services.
3. **Rate Limiting**: Implemented at application level. For production, consider Redis-based distributed rate limiting.
4. **Audit Logging**: Synchronous logging. For high-throughput, consider async logging with a queue.

## Testing

### Unit Tests

```bash
npm run test
```

Tests cover:

- Folder vs file scope validation
- Primary tag uniqueness
- JWT isolation and role enforcement
- Webhook classification and rate-limiting
- Credits tracking on scoped actions

### E2E Tests

```bash
npm run test:e2e
```

### API Endpoint Tests

Test all API endpoints to verify they work correctly:

```bash
npm run test:api
```

**Note:** Make sure the API server is running (`npm run dev`) before running the API tests.

The test script will verify:

- Document upload and retrieval
- Folder listing and document filtering
- Full-text search with different scopes
- Scoped actions (folder and files)
- Usage tracking
- OCR webhook processing and classification
- Metrics endpoint
- RBAC and tenant isolation
- Input validation

## What I'd Do Next (Given More Time)

1. **Enhanced Search**: Implement Elasticsearch for better full-text search with faceting and filtering.
2. **File Storage**: Integrate with S3 or similar for actual file storage (currently only metadata stored).
3. **Real OCR Integration**: Replace mock classification with actual OCR service integration.
4. **Caching**: Add Redis for caching frequently accessed data and rate limiting.
5. **API Documentation**: ✅ Swagger/OpenAPI documentation available at `/api` endpoint with comprehensive examples and flows. Postman collection included (`Skylad_API_Collection.postman_collection.json`).
6. **Monitoring**: Add Prometheus metrics and distributed tracing.
7. **CI/CD**: Set up GitHub Actions for automated testing and deployment.
8. **Database Migrations**: Add migration system for schema changes.
9. **WebSocket Support**: Real-time updates for document processing status.
10. **Batch Operations**: Support for bulk document uploads and operations.

## Project Structure

```
src/
├── auth/              # Authentication & authorization
│   ├── guards/       # JWT and role guards
│   ├── decorators/   # Custom decorators
│   └── *.ts          # JWT strategy, users service
├── documents/        # Document management
│   ├── dto/         # Data transfer objects
│   └── *.ts         # Controllers, services
├── actions/         # Scoped actions
├── webhooks/        # OCR webhook processing
├── metrics/         # Metrics endpoint
├── audit/           # Audit logging
├── schemas/         # MongoDB schemas
└── scripts/         # Utility scripts (seed, etc.)
```

## Known Gaps & Shortcuts

1. **File Upload**: Currently accepts file metadata only. Real file upload would require multipart/form-data handling.
2. **JWT Generation**: Tokens can be generated using `npm run token <email>` script. For production, consider adding a proper authentication endpoint (login/register).
3. **Error Handling**: Basic error handling. Production would need more comprehensive error responses.
4. **Validation**: Some edge cases in scope validation could be more robust.
5. **Database Indexes**: Some indexes added, but could be optimized further based on query patterns.

## License

MIT
#   s k y l a d _ a s s i g n m e n t  
 