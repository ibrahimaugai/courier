import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Environment-controlled seeding: only allow admin creation when explicitly enabled in production.
// Set ADMIN_SEED=true to force creation in production, otherwise seeding runs in non-production by default.
const adminSeedEnabled = process.env.ADMIN_SEED === 'true' || process.env.NODE_ENV !== 'production';

async function main() {
  if (!adminSeedEnabled) {
    console.log('Admin seeding skipped (set ADMIN_SEED=true to force in production).');
    await prisma.$disconnect();
    return;
  }

  // Get admin credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      username: adminUsername,
    },
  });

  // Hash the admin password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  if (existingAdmin) {
    // Update existing admin to SUPER_ADMIN and reset password
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true
      },
    });
    console.log(`✅ Admin user '${adminUsername}' updated to SUPER_ADMIN`);
    await prisma.$disconnect();
    return;
  }

  // Admin does not exist — create a new SUPER_ADMIN user
  await prisma.user.create({
    data: {
      username: adminUsername,
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ SUPER_ADMIN user '${adminUsername}' created successfully`);
}

main()
  .catch((e) => {
    // Only log errors, never credentials
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
