import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data in order
  console.log('🗑️  Clearing existing data...');
  try { await (prisma as any).securityLog.deleteMany(); } catch (e) {}
  try { await (prisma as any).activity.deleteMany(); } catch (e) {}
  try { await (prisma as any).shipment.deleteMany(); } catch (e) {}
  try { await (prisma as any).payment.deleteMany(); } catch (e) {}
  try { await prisma.transaction.deleteMany(); } catch (e) {}
  try { await prisma.quotation.deleteMany(); } catch (e) {}
  try { await prisma.requirement.deleteMany(); } catch (e) {}
  try { await (prisma as any).adminSetting.deleteMany(); } catch (e) {}
  try { await prisma.supplier.deleteMany(); } catch (e) {}
  try { await prisma.session.deleteMany(); } catch (e) {}
  try { await prisma.account.deleteMany(); } catch (e) {}
  try { await prisma.user.deleteMany(); } catch (e) {}
  console.log('✅ Data cleared\n');

  // Create demo users
  console.log('👥 Creating demo users...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);
  const buyerPassword = await bcrypt.hash('buyer123', 12);
  const supplierPassword = await bcrypt.hash('supplier123', 12);

  const adminUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@tradewave.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      companyName: 'Tradewave Admin',
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'buyer1@example.com',
      name: 'John Buyer',
      password: buyerPassword,
      role: 'BUYER',
      status: 'ACTIVE',
      companyName: 'Buyer Corp Ltd',
      industry: 'Manufacturing',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'buyer2@example.com',
      name: 'Sarah Buyer',
      password: buyerPassword,
      role: 'BUYER',
      status: 'ACTIVE',
      companyName: 'Global Imports Inc',
      industry: 'Retail',
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      id: uuidv4(),
      email: 'supplier1@example.com',
      name: 'Rajesh Supplier',
      companyName: 'Quality Exports Ltd',
      location: 'Mumbai, India',
      categories: ['Electronics', 'Components'],
      verified: true,
      overallRating: 4.5,
      yearsInBusiness: 10,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      id: uuidv4(),
      email: 'supplier2@example.com',
      name: 'Priya Supplier',
      companyName: 'Premium Goods Co',
      location: 'Shanghai, China',
      categories: ['Textiles', 'Machinery'],
      verified: true,
      overallRating: 4.8,
      yearsInBusiness: 15,
    },
  });

  console.log(`✅ Created ${5} users and suppliers\n`);

  // Create requirements
  console.log('📋 Creating demo requirements...');
  const requirementStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SOURCING', 'QUOTATIONS_READY', 'NEGOTIATING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];
  const categories = ['Electronics', 'Textiles', 'Machinery', 'Raw Materials', 'Components', 'Chemicals'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const requirements = [];
  for (let i = 0; i < 10; i++) {
    const req = await prisma.requirement.create({
      data: {
        id: uuidv4(),
        title: `Requirement ${i + 1}: ${categories[i % categories.length]} Order`,
        description: `This is a sample requirement for ${categories[i % categories.length].toLowerCase()} products. Looking for high-quality items with competitive pricing.`,
        category: categories[i % categories.length],
        status: requirementStatuses[i % requirementStatuses.length] as any,
        quantity: Math.floor(Math.random() * 1000) + 100,
        unit: 'units',
        targetPrice: Math.floor(Math.random() * 50000) + 5000,
        currency: 'USD',
        deliveryLocation: ['New York, USA', 'London, UK', 'Singapore', 'Dubai, UAE', 'Tokyo, Japan'][i % 5],
        deliveryDeadline: new Date(Date.now() + (30 + i * 7) * 24 * 60 * 60 * 1000),
        priority: priorities[i % priorities.length] as any,
        buyerId: i % 2 === 0 ? buyer1.id : buyer2.id,
      },
    });
    requirements.push(req);
  }
  console.log(`✅ Created ${requirements.length} requirements\n`);

  // Create quotations
  console.log('💰 Creating demo quotations...');
  const quotationStatuses = ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
  const quotations = [];
  for (let i = 0; i < 8; i++) {
    const requirement = requirements[i % requirements.length];
    const unitPrice = Math.floor(Math.random() * 100) + 10;
    const quantity = requirement.quantity || 100;
    const subtotal = unitPrice * quantity;
    const quot = await prisma.quotation.create({
      data: {
        id: uuidv4(),
        requirementId: requirement.id,
        supplierId: i % 2 === 0 ? supplier1.id : supplier2.id,
        userId: i % 2 === 0 ? buyer1.id : buyer2.id,
        unitPrice: unitPrice,
        quantity: quantity,
        subtotal: subtotal,
        total: subtotal,
        leadTime: Math.floor(Math.random() * 30) + 7,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: quotationStatuses[i % quotationStatuses.length] as any,
        notes: `Quotation ${i + 1} for ${requirement.title}`,
      },
    });
    quotations.push(quot);
  }
  console.log(`✅ Created ${quotations.length} quotations\n`);

  // Create transactions
  console.log('💳 Creating demo transactions...');
  const transactionStatuses = ['INITIATED', 'PAYMENT_PENDING', 'ESCROW_HELD', 'IN_TRANSIT', 'COMPLETED', 'DISPUTED'];
  const transactions = [];
  for (let i = 0; i < 6; i++) {
    const requirement = requirements[i];
    const quotation = quotations[i % quotations.length];
    const txn = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        requirementId: requirement.id,
        quotationId: quotation.id,
        buyerId: i % 2 === 0 ? buyer1.id : buyer2.id,
        supplierId: i % 2 === 0 ? supplier1.id : supplier2.id,
        status: transactionStatuses[i % transactionStatuses.length] as any,
        amount: Math.floor(Math.random() * 100000) + 10000,
        currency: 'USD',
        paymentMethod: ['WIRE_TRANSFER', 'ESCROW', 'STRIPE'][i % 3],
        carrier: ['DHL', 'FedEx', 'UPS', 'Local Courier'][i % 4],
        origin: ['Mumbai, India', 'Shanghai, China'][i % 2],
        destination: ['New York, USA', 'London, UK', 'Singapore'][i % 3],
        estimatedDelivery: new Date(Date.now() + (14 + i * 3) * 24 * 60 * 60 * 1000),
      },
    });
    transactions.push(txn);
  }
  console.log(`✅ Created ${transactions.length} transactions\n`);

  // Create shipments
  console.log('📦 Creating demo shipments...');
  const shipmentStatuses = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'IN_TRANSIT'];
  const trackingNumbers = ['TW123456789', 'TW987654321', 'TW555666777', 'TW111222333', 'TW444555666', 'TW777888999', 'TW101112131', 'TW414243444'];
  const carriers = ['DHL', 'FedEx', 'UPS', 'Local Courier'];
  
  for (let i = 0; i < Math.min(8, transactions.length); i++) {
    const txn = transactions[i % transactions.length];
    await (prisma as any).shipment.create({
      data: {
        id: uuidv4(),
        transactionId: txn.id,
        trackingNumber: trackingNumbers[i],
        carrier: carriers[i % carriers.length],
        status: shipmentStatuses[i % shipmentStatuses.length],
        originLocation: txn.origin || 'Mumbai, India',
        currentLocation: ['Mumbai Hub', 'Singapore Transit', 'Destination City', 'Customs Clearance', 'Distribution Center'][i % 5],
        destinationLocation: txn.destination || 'New York, USA',
        estimatedDelivery: new Date(Date.now() + (7 + i * 2) * 24 * 60 * 60 * 1000),
        actualDelivery: shipmentStatuses[i % shipmentStatuses.length] === 'DELIVERED' ? new Date() : null,
        updates: [
          { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'PICKED_UP', location: txn.origin, note: 'Package picked up' },
          { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'IN_TRANSIT', location: 'Transit Hub', note: 'In transit to destination' },
          { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: shipmentStatuses[i % shipmentStatuses.length], location: 'Current Location', note: 'Package status updated' },
        ],
      },
    });
  }
  console.log(`✅ Created 8 shipments\n`);

  // Create activity logs
  console.log('📊 Creating demo activity logs...');
  const activityActions = ['REQUIREMENT_CREATED', 'QUOTATION_SUBMITTED', 'PAYMENT_PROCESSED', 'DELIVERY_CONFIRMED', 'QUALITY_APPROVED', 'DISPUTE_OPENED'];
  const activityTypes = ['REQUIREMENT', 'QUOTATION', 'TRANSACTION', 'PAYMENT', 'SHIPMENT', 'SYSTEM'];
  
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await (prisma as any).activity.create({
      data: {
        id: uuidv4(),
        userId: [adminUser.id, buyer1.id, buyer2.id][i % 3],
        type: activityTypes[i % activityTypes.length],
        action: activityActions[i % activityActions.length],
        description: `Activity ${i + 1}: ${activityActions[i % activityActions.length].replace('_', ' ').toLowerCase()}`,
        resourceType: ['requirement', 'transaction', 'quotation', 'shipment'][i % 4],
        resourceId: requirements[i % requirements.length].id,
        ipAddress: `192.168.1.${100 + i}`,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ Created 20 activity logs\n`);

  // Create security logs
  console.log('🔒 Creating demo security logs...');
  const securityEvents = ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PERMISSION_DENIED'];
  
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await (prisma as any).securityLog.create({
      data: {
        id: uuidv4(),
        userId: [adminUser.id, buyer1.id, buyer2.id][i % 3],
        eventType: securityEvents[i % securityEvents.length],
        details: { browser: 'Chrome', os: 'Windows', attempt: i + 1 },
        ipAddress: `192.168.1.${50 + i}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ Created 10 security logs\n`);

  // Create admin settings
  console.log('⚙️  Creating admin settings...');
  const settings = [
    { key: 'TRANSACTION_FEE', value: '2.5', description: 'Transaction fee percentage', category: 'FEES' },
    { key: 'ESCROW_REQUIRED', value: 'true', description: 'Whether escrow is required for transactions', category: 'SECURITY' },
    { key: 'KYC_THRESHOLD', value: '10000', description: 'Amount threshold requiring KYC verification', category: 'COMPLIANCE' },
    { key: 'DISPUTE_RESOLUTION_DAYS', value: '30', description: 'Days allowed for dispute resolution', category: 'COMPLIANCE' },
    { key: 'MIN_TRANSACTION_AMOUNT', value: '1000', description: 'Minimum transaction amount in USD', category: 'FEES' },
    { key: 'MAX_TRANSACTION_AMOUNT', value: '1000000', description: 'Maximum transaction amount in USD', category: 'FEES' },
  ];

  for (const setting of settings) {
    await (prisma as any).adminSetting.create({
      data: {
        id: uuidv4(),
        key: setting.key,
        value: setting.value,
        description: setting.description,
        category: setting.category,
        updatedBy: adminUser.id,
      },
    });
  }
  console.log(`✅ Created ${settings.length} admin settings\n`);

  console.log('🎉 Database seeding completed!\n');
  console.log('📝 Login Credentials:');
  console.log('   Admin: admin@tradewave.com / admin123');
  console.log('   Buyer: buyer1@example.com / buyer123');
  console.log('   Supplier: supplier1@example.com / supplier123');
  console.log('\n   Demo users also available:');
  console.log('   admin@tradewave.io / password123');
  console.log('   demo@tradewave.io / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
