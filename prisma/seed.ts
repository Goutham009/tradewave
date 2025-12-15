import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user with hashed password
  const hashedPassword = await bcrypt.hash('password123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'demo@tradewave.io' },
    update: {},
    create: {
      email: 'demo@tradewave.io',
      name: 'Demo User',
      password: hashedPassword,
      role: 'BUYER',
      status: 'ACTIVE',
      companyName: 'Demo Company Ltd',
      phone: '+1234567890',
      industry: 'Manufacturing',
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tradewave.io' },
    update: {},
    create: {
      email: 'admin@tradewave.io',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      companyName: 'Tradewave',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create a sample supplier
  const supplier = await prisma.supplier.upsert({
    where: { email: 'supplier@example.com' },
    update: {},
    create: {
      name: 'Quality Supplies Co.',
      email: 'supplier@example.com',
      companyName: 'Quality Supplies Co. Ltd',
      country: 'China',
      city: 'Shanghai',
      location: 'Shanghai, China',
      categories: ['Electronics', 'Components'],
      rating: 4.5,
      verified: true,
      description: 'Leading supplier of electronic components with 15+ years experience.',
    },
  });

  console.log('✅ Created sample supplier:', supplier.companyName);

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('   Email: demo@tradewave.io');
  console.log('   Password: password123');
  console.log('\n   Admin Email: admin@tradewave.io');
  console.log('   Admin Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
