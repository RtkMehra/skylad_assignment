import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../auth/users.service';
import * as jwt from 'jsonwebtoken';

async function generateToken() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: npm run token <email>');
    console.log('Example: npm run token admin@example.com');
    console.log('Example: npm run token user1@example.com');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const user = await usersService.findByEmail(email);
  
  if (!user) {
    console.error(`User with email ${email} not found.`);
    console.log('\nAvailable users from seed:');
    console.log('  - admin@example.com');
    console.log('  - user1@example.com');
    console.log('  - user2@example.com');
    console.log('  - support@example.com');
    await app.close();
    process.exit(1);
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const token = jwt.sign(
    { 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role 
    }, 
    secret, 
    { expiresIn: '24h' }
  );

  console.log(`\nJWT Token for ${user.email} (${user.role}):`);
  console.log(token);
  console.log('\nUse in Authorization header:');
  console.log(`Authorization: Bearer ${token}\n`);

  await app.close();
}

generateToken().catch((error) => {
  console.error('Failed to generate token:', error);
  process.exit(1);
});

