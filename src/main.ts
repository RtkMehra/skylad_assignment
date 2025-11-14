import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('v1');

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Skylad Backend API')
    .setDescription(
      `Document management API with folders, tags, OCR webhooks, and RBAC.

## Features
- Document management with primary/secondary tags
- Scoped actions for document processing
- OCR webhook ingestion with classification
- Role-based access control (RBAC)
- Comprehensive auditing and metrics

## Demo Users

The following users are created by the seed script (\`npm run seed\`). All users have the default password: **\`password123\`**

| Email | Role | Description |
|-------|------|-------------|
| \`admin@example.com\` | admin | Full access to all resources and metrics |
| \`user1@example.com\` | user | Standard user with CRUD on own resources |
| \`user2@example.com\` | user | Standard user with CRUD on own resources |
| \`support@example.com\` | support | Read-only access to all resources |

**Getting Started:**
1. Run \`npm run seed\` to create demo users
2. Login via \`POST /v1/auth/login\` with any user's email and password \`password123\`
3. Use the returned \`access_token\` in the \`Authorization: Bearer <token>\` header

## Authentication
All endpoints require JWT Bearer token authentication. Use the login endpoint or seed script to get tokens.

## API Flows

### Document Management Flow
1. Upload document with primary tag → Creates folder automatically
2. List folders → See all primary-tag folders with counts
3. Get folder documents → Retrieve documents in a specific folder
4. Search documents → Full-text search with scope filtering

### Scoped Actions Flow
1. Run action with folder/files scope → Processes documents
2. Generates derived files (documents/CSV) → Creates new documents
3. Tracks usage → 5 credits per request
4. View usage → Get monthly credit totals

### OCR Webhook Flow
1. Post OCR webhook → Classifies content (official/ad)
2. For ads → Extracts unsubscribe info
3. Creates task → With rate limiting (3 per sender/day)
4. Logs event → Audit trail maintained

### RBAC Flow
- **User**: CRUD on own docs/tags, run actions, view own usage
- **Support/Moderator**: Read-only access to all resources
- **Admin**: Full access to all resources including metrics
`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and JWT token generation')
    .addTag('Documents', 'Document management with folders and tags')
    .addTag('Folders', 'Folder operations (primary-tag based)')
    .addTag('Search', 'Full-text search across documents')
    .addTag('Actions', 'Scoped actions for document processing')
    .addTag('Webhooks', 'OCR webhook ingestion and classification')
    .addTag('Metrics', 'System metrics and statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Skylad API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();

