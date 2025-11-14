import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../auth/users.service';
import { DocumentsService } from '../documents/documents.service';
import { UserRole } from '../schemas/user.schema';
import * as jwt from 'jsonwebtoken';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const documentsService = app.get(DocumentsService);

  console.log('Seeding database...');

  // Create or get demo users (with default password: password123)
  const defaultPassword = 'password123';

  let admin = await usersService.findByEmail('admin@example.com');
  if (!admin) {
    admin = await usersService.create('admin@example.com', UserRole.ADMIN, defaultPassword);
    console.log('Created admin user');
  } else {
    console.log('Admin user already exists');
  }

  let user1 = await usersService.findByEmail('user1@example.com');
  if (!user1) {
    user1 = await usersService.create('user1@example.com', UserRole.USER, defaultPassword);
    console.log('Created user1');
  } else {
    console.log('User1 already exists');
  }

  let user2 = await usersService.findByEmail('user2@example.com');
  if (!user2) {
    user2 = await usersService.create('user2@example.com', UserRole.USER, defaultPassword);
    console.log('Created user2');
  } else {
    console.log('User2 already exists');
  }

  let support = await usersService.findByEmail('support@example.com');
  if (!support) {
    support = await usersService.create('support@example.com', UserRole.SUPPORT, defaultPassword);
    console.log('Created support user');
  } else {
    console.log('Support user already exists');
  }

  console.log('\nUsers:', {
    admin: admin._id.toString(),
    user1: user1._id.toString(),
    user2: user2._id.toString(),
    support: support._id.toString(),
  });

  // Generate JWT tokens for testing
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const adminToken = jwt.sign({ sub: admin._id.toString(), email: admin.email, role: admin.role }, secret);
  const user1Token = jwt.sign({ sub: user1._id.toString(), email: user1.email, role: user1.role }, secret);
  const user2Token = jwt.sign({ sub: user2._id.toString(), email: user2.email, role: user2.role }, secret);

  console.log('\n=== JWT Tokens for Testing ===');
  console.log('Admin Token:', adminToken);
  console.log('User1 Token:', user1Token);
  console.log('User2 Token:', user2Token);
  console.log('\nUse these tokens in Authorization header: Bearer <token>');
  console.log('\n=== Login Credentials ===');
  console.log('All users have default password: password123');
  console.log('You can also login via POST /v1/auth/login to get a fresh token.\n');

  // Create sample documents for user1
  await documentsService.uploadDocument(user1._id.toString(), {
    filename: 'invoice-2025-01.pdf',
    mime: 'application/pdf',
    textContent: 'Invoice for January 2025. Total: $1,500.00. Payment due: 30 days.',
    primaryTag: 'invoices-2025',
    secondaryTags: ['january', 'billing'],
  });

  await documentsService.uploadDocument(user1._id.toString(), {
    filename: 'contract-agreement.pdf',
    mime: 'application/pdf',
    textContent: 'Service Agreement. Terms and conditions apply. Legal document.',
    primaryTag: 'legal',
    secondaryTags: ['contracts'],
  });

  await documentsService.uploadDocument(user1._id.toString(), {
    filename: 'receipt-001.pdf',
    mime: 'application/pdf',
    textContent: 'Receipt for purchase. Amount: $99.99. Transaction ID: TXN-12345.',
    primaryTag: 'receipts',
    secondaryTags: ['2025'],
  });

  // Create sample documents for user2
  await documentsService.uploadDocument(user2._id.toString(), {
    filename: 'invoice-2025-02.pdf',
    mime: 'application/pdf',
    textContent: 'Invoice for February 2025. Total: $2,000.00. Payment due: 30 days.',
    primaryTag: 'invoices-2025',
    secondaryTags: ['february'],
  });

  console.log('Created sample documents');
  console.log('\nSeed completed!');
  console.log('\nYou can now use the JWT tokens above to test the API.');

  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

