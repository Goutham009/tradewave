import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive sample data...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // ============================================================================
  // ADMIN USER
  // ============================================================================
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

  // ============================================================================
  // ACCOUNT MANAGERS
  // ============================================================================
  const am1 = await prisma.user.upsert({
    where: { email: 'am1@tradewave.io' },
    update: {},
    create: {
      email: 'am1@tradewave.io',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'ACCOUNT_MANAGER',
      status: 'ACTIVE',
      companyName: 'Tradewave',
      phone: '+1-555-0101',
    },
  });

  const am2 = await prisma.user.upsert({
    where: { email: 'am2@tradewave.io' },
    update: {},
    create: {
      email: 'am2@tradewave.io',
      name: 'Michael Chen',
      password: hashedPassword,
      role: 'ACCOUNT_MANAGER',
      status: 'ACTIVE',
      companyName: 'Tradewave',
      phone: '+1-555-0102',
    },
  });
  console.log('✅ Created account managers');

  // ============================================================================
  // PROCUREMENT TEAM
  // ============================================================================
  const proc1 = await prisma.user.upsert({
    where: { email: 'procurement1@tradewave.io' },
    update: {},
    create: {
      email: 'procurement1@tradewave.io',
      name: 'David Rodriguez',
      password: hashedPassword,
      role: 'PROCUREMENT_OFFICER',
      status: 'ACTIVE',
      companyName: 'Tradewave',
      phone: '+1-555-0201',
    },
  });

  const proc2 = await prisma.user.upsert({
    where: { email: 'procurement2@tradewave.io' },
    update: {},
    create: {
      email: 'procurement2@tradewave.io',
      name: 'Emily Watson',
      password: hashedPassword,
      role: 'PROCUREMENT_OFFICER',
      status: 'ACTIVE',
      companyName: 'Tradewave',
      phone: '+1-555-0202',
    },
  });
  console.log('✅ Created procurement team');

  // ============================================================================
  // BUYERS (Various statuses)
  // ============================================================================
  const buyers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'buyer1@acmecorp.com' },
      update: {},
      create: {
        email: 'buyer1@acmecorp.com',
        name: 'John Smith',
        password: hashedPassword,
        role: 'BUYER',
        status: 'ACTIVE',
        companyName: 'Acme Corporation',
        phone: '+1-555-1001',
        country: 'USA',
        region: 'North America',
        kybStatus: 'COMPLETED',
        accountManagerId: am1.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer2@globalimports.com' },
      update: {},
      create: {
        email: 'buyer2@globalimports.com',
        name: 'Lisa Wang',
        password: hashedPassword,
        role: 'BUYER',
        status: 'ACTIVE',
        companyName: 'Global Imports LLC',
        phone: '+1-555-1002',
        country: 'USA',
        region: 'North America',
        kybStatus: 'COMPLETED',
        accountManagerId: am1.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer3@eurotraders.eu' },
      update: {},
      create: {
        email: 'buyer3@eurotraders.eu',
        name: 'Hans Mueller',
        password: hashedPassword,
        role: 'BUYER',
        status: 'ACTIVE',
        companyName: 'Euro Traders GmbH',
        phone: '+49-555-1003',
        country: 'Germany',
        region: 'Europe',
        kybStatus: 'PENDING',
        accountManagerId: am2.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer4@asiamart.sg' },
      update: {},
      create: {
        email: 'buyer4@asiamart.sg',
        name: 'Wei Lin',
        password: hashedPassword,
        role: 'BUYER',
        status: 'ACTIVE',
        companyName: 'Asia Mart Pte Ltd',
        phone: '+65-555-1004',
        country: 'Singapore',
        region: 'Asia',
        kybStatus: 'COMPLETED',
        accountManagerId: am2.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer5@newcorp.com' },
      update: {},
      create: {
        email: 'buyer5@newcorp.com',
        name: 'Robert Brown',
        password: hashedPassword,
        role: 'BUYER',
        status: 'PENDING',
        companyName: 'NewCorp Industries',
        phone: '+1-555-1005',
        country: 'USA',
        region: 'North America',
        kybStatus: 'NOT_STARTED',
      },
    }),
  ]);
  console.log('✅ Created buyers:', buyers.length);

  // ============================================================================
  // SUPPLIER USERS
  // ============================================================================
  const supplierUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'supplier1@steelworks.cn' },
      update: {},
      create: {
        email: 'supplier1@steelworks.cn',
        name: 'Zhang Wei',
        password: hashedPassword,
        role: 'SUPPLIER',
        status: 'ACTIVE',
        companyName: 'Shanghai Steel Works',
        phone: '+86-555-2001',
        country: 'China',
        region: 'Asia',
        kybStatus: 'COMPLETED',
      },
    }),
    prisma.user.upsert({
      where: { email: 'supplier2@textiles.in' },
      update: {},
      create: {
        email: 'supplier2@textiles.in',
        name: 'Rajesh Kumar',
        password: hashedPassword,
        role: 'SUPPLIER',
        status: 'ACTIVE',
        companyName: 'Premium Textiles India',
        phone: '+91-555-2002',
        country: 'India',
        region: 'Asia',
        kybStatus: 'COMPLETED',
      },
    }),
    prisma.user.upsert({
      where: { email: 'supplier3@electronics.tw' },
      update: {},
      create: {
        email: 'supplier3@electronics.tw',
        name: 'Chen Ming',
        password: hashedPassword,
        role: 'SUPPLIER',
        status: 'ACTIVE',
        companyName: 'Taiwan Electronics Co',
        phone: '+886-555-2003',
        country: 'Taiwan',
        region: 'Asia',
        kybStatus: 'COMPLETED',
      },
    }),
    prisma.user.upsert({
      where: { email: 'supplier4@chemicals.de' },
      update: {},
      create: {
        email: 'supplier4@chemicals.de',
        name: 'Klaus Schmidt',
        password: hashedPassword,
        role: 'SUPPLIER',
        status: 'ACTIVE',
        companyName: 'Deutsche Chemicals AG',
        phone: '+49-555-2004',
        country: 'Germany',
        region: 'Europe',
        kybStatus: 'PENDING',
      },
    }),
  ]);
  console.log('✅ Created supplier users:', supplierUsers.length);

  // ============================================================================
  // SUPPLIERS (Business entities)
  // ============================================================================
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { email: 'supplier1@steelworks.cn' },
      update: {},
      create: {
        name: 'Zhang Wei',
        email: 'supplier1@steelworks.cn',
        companyName: 'Shanghai Steel Works',
        location: 'Shanghai, China',
        categories: ['Steel', 'Metals', 'Raw Materials'],
        overallRating: 4.8,
        verified: true,
        yearsInBusiness: 25,
      },
    }),
    prisma.supplier.upsert({
      where: { email: 'supplier2@textiles.in' },
      update: {},
      create: {
        name: 'Rajesh Kumar',
        email: 'supplier2@textiles.in',
        companyName: 'Premium Textiles India',
        location: 'Mumbai, India',
        categories: ['Textiles', 'Fabrics', 'Garments'],
        overallRating: 4.5,
        verified: true,
        yearsInBusiness: 18,
      },
    }),
    prisma.supplier.upsert({
      where: { email: 'supplier3@electronics.tw' },
      update: {},
      create: {
        name: 'Chen Ming',
        email: 'supplier3@electronics.tw',
        companyName: 'Taiwan Electronics Co',
        location: 'Taipei, Taiwan',
        categories: ['Electronics', 'Components', 'Semiconductors'],
        overallRating: 4.9,
        verified: true,
        yearsInBusiness: 30,
      },
    }),
    prisma.supplier.upsert({
      where: { email: 'supplier4@chemicals.de' },
      update: {},
      create: {
        name: 'Klaus Schmidt',
        email: 'supplier4@chemicals.de',
        companyName: 'Deutsche Chemicals AG',
        location: 'Frankfurt, Germany',
        categories: ['Chemicals', 'Industrial', 'Pharmaceuticals'],
        overallRating: 4.7,
        verified: false,
        yearsInBusiness: 45,
      },
    }),
  ]);
  console.log('✅ Created suppliers:', suppliers.length);

  // ============================================================================
  // LEADS
  // ============================================================================
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        fullName: 'James Wilson',
        email: 'james@newcompany.com',
        phoneNumber: '+1-555-3001',
        companyName: 'New Company Inc',
        category: 'Steel',
        productName: 'Steel Coils',
        quantity: 100,
        unit: 'tons',
        location: 'USA',
        timeline: '30 days',
        source: 'LANDING_PAGE_FORM',
        status: 'NEW_LEAD',
        notes: 'Interested in bulk steel purchases',
      },
    }),
    prisma.lead.create({
      data: {
        fullName: 'Maria Garcia',
        email: 'maria@importers.mx',
        phoneNumber: '+52-555-3002',
        companyName: 'Mexican Importers SA',
        category: 'Textiles',
        productName: 'Cotton Fabric',
        quantity: 5000,
        unit: 'meters',
        location: 'Mexico',
        timeline: '45 days',
        source: 'REFERRAL',
        status: 'CONTACTED',
        notes: 'Referred by existing client. Looking for textile suppliers.',
        assignedTo: am1.id,
        lastContactedAt: new Date(),
      },
    }),
    prisma.lead.create({
      data: {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@middleeast.ae',
        phoneNumber: '+971-555-3003',
        companyName: 'Middle East Trading',
        category: 'Electronics',
        productName: 'Electronic Components',
        quantity: 10000,
        unit: 'pcs',
        location: 'UAE',
        timeline: '60 days',
        source: 'DIRECT',
        status: 'QUALIFIED',
        notes: 'Met at Dubai Trade Show. High potential client.',
        assignedTo: am2.id,
        callScheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.lead.create({
      data: {
        fullName: 'Sophie Martin',
        email: 'sophie@frenchgoods.fr',
        phoneNumber: '+33-555-3004',
        companyName: 'French Goods SARL',
        category: 'Electronics',
        productName: 'Capacitors',
        quantity: 50000,
        unit: 'pcs',
        location: 'France',
        timeline: '21 days',
        source: 'LANDING_PAGE_FORM',
        status: 'CALL_SCHEDULED',
        notes: 'Looking for electronics components. Price sensitive.',
        assignedTo: am1.id,
      },
    }),
  ]);
  console.log('✅ Created leads:', leads.length);

  // ============================================================================
  // KYB RECORDS
  // ============================================================================
  const kybRecords = await Promise.all([
    prisma.supplierKYB.create({
      data: {
        userId: buyers[0].id,
        status: 'VERIFIED',
        businessName: 'Acme Corporation',
        businessType: 'CORPORATION',
        businessDescription: 'Manufacturing company specializing in automotive parts',
        businessEstablishedYear: 2015,
        registrationCountry: 'US',
        registrationNumber: 'ACM-2020-001',
        taxIdType: 'EIN',
        taxIdNumber: 'US-TAX-12345',
        taxIdCountry: 'US',
        registeredAddress: '123 Business Ave',
        registeredCity: 'New York',
        registeredRegion: 'NY',
        registeredCountry: 'US',
        registeredPostalCode: '10001',
        primaryContactName: 'John Smith',
        primaryContactEmail: 'john@acmecorp.com',
        primaryContactPhone: '+1-555-1001',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        reviewedBy: adminUser.id,
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.supplierKYB.create({
      data: {
        userId: buyers[2].id,
        status: 'PENDING',
        businessName: 'Euro Traders GmbH',
        businessType: 'LIMITED_LIABILITY',
        businessDescription: 'European trading company',
        businessEstablishedYear: 2018,
        registrationCountry: 'DE',
        registrationNumber: 'DE-HRB-54321',
        taxIdType: 'VAT',
        taxIdNumber: 'DE-VAT-987654',
        taxIdCountry: 'DE',
        registeredAddress: 'Hauptstraße 45',
        registeredCity: 'Frankfurt',
        registeredRegion: 'Hessen',
        registeredCountry: 'DE',
        registeredPostalCode: '60311',
        primaryContactName: 'Hans Mueller',
        primaryContactEmail: 'hans@eurotraders.eu',
        primaryContactPhone: '+49-555-1003',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.supplierKYB.create({
      data: {
        userId: supplierUsers[0].id,
        status: 'VERIFIED',
        businessName: 'Shanghai Steel Works',
        businessType: 'CORPORATION',
        businessDescription: 'Leading steel manufacturer in China',
        businessEstablishedYear: 1999,
        registrationCountry: 'CN',
        registrationNumber: 'CN-BJ-2010-88888',
        taxIdType: 'TAX_ID',
        taxIdNumber: 'CN-TAX-88888888',
        taxIdCountry: 'CN',
        registeredAddress: '888 Industrial Road, Pudong',
        registeredCity: 'Shanghai',
        registeredRegion: 'Shanghai',
        registeredCountry: 'CN',
        registeredPostalCode: '200120',
        primaryContactName: 'Zhang Wei',
        primaryContactEmail: 'supplier1@steelworks.cn',
        primaryContactPhone: '+86-555-2001',
        submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        reviewedBy: adminUser.id,
        expiresAt: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log('✅ Created KYB records:', kybRecords.length);

  // ============================================================================
  // REQUIREMENTS
  // ============================================================================
  const requirements = await Promise.all([
    prisma.requirement.create({
      data: {
        buyerId: buyers[0].id,
        title: 'Steel Coils - Grade A',
        description: 'Hot rolled steel coils for automotive manufacturing. Must meet ISO 9001 standards.',
        category: 'Steel',
        subcategory: 'Hot Rolled',
        quantity: 500,
        unit: 'tons',
        budgetMin: 400,
        budgetMax: 450,
        currency: 'USD',
        deliveryLocation: 'Detroit, USA',
        deliveryDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'PENDING_ADMIN_REVIEW',
        priority: 'HIGH',
        amVerified: true,
        amVerifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedAccountManagerId: am1.id,
      },
    }),
    prisma.requirement.create({
      data: {
        buyerId: buyers[1].id,
        title: 'Cotton Fabric - Premium Quality',
        description: '100% cotton fabric for garment production. GSM 180-200.',
        category: 'Textiles',
        subcategory: 'Cotton',
        quantity: 10000,
        unit: 'meters',
        budgetMin: 2,
        budgetMax: 3,
        currency: 'USD',
        deliveryLocation: 'Los Angeles, USA',
        deliveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'VERIFIED',
        priority: 'MEDIUM',
        amVerified: true,
        adminReviewed: true,
        adminReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignedAccountManagerId: am1.id,
      },
    }),
    prisma.requirement.create({
      data: {
        buyerId: buyers[3].id,
        title: 'Electronic Components - Capacitors',
        description: 'Ceramic capacitors 100uF, 50V. RoHS compliant.',
        category: 'Electronics',
        subcategory: 'Passive Components',
        quantity: 50000,
        unit: 'pcs',
        budgetMin: 0.05,
        budgetMax: 0.08,
        currency: 'USD',
        deliveryLocation: 'Singapore',
        deliveryDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'QUOTES_PENDING',
        priority: 'HIGH',
        amVerified: true,
        adminReviewed: true,
        assignedAccountManagerId: am2.id,
      },
    }),
    prisma.requirement.create({
      data: {
        buyerId: buyers[0].id,
        title: 'Industrial Chemicals - Sulfuric Acid',
        description: 'Technical grade sulfuric acid 98% concentration.',
        category: 'Chemicals',
        subcategory: 'Industrial',
        quantity: 100,
        unit: 'tons',
        budgetMin: 200,
        budgetMax: 250,
        currency: 'USD',
        deliveryLocation: 'Houston, USA',
        deliveryDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'PENDING_AM_VERIFICATION',
        priority: 'LOW',
        assignedAccountManagerId: am1.id,
      },
    }),
  ]);
  console.log('✅ Created requirements:', requirements.length);

  // ============================================================================
  // QUOTATIONS
  // ============================================================================
  const quotations = await Promise.all([
    prisma.quotation.create({
      data: {
        requirementId: requirements[2].id,
        supplierId: supplierUsers[2].id,
        status: 'PENDING',
        unitPrice: 0.06,
        quantity: 50000,
        total: 3000,
        currency: 'USD',
        deliveryTimeline: '14 days',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: 'Can deliver in 2 batches if needed.',
        paymentTerms: '30% advance, 70% on delivery',
      },
    }),
    prisma.quotation.create({
      data: {
        requirementId: requirements[2].id,
        supplierId: supplierUsers[0].id,
        status: 'PENDING',
        unitPrice: 0.055,
        quantity: 50000,
        total: 2750,
        currency: 'USD',
        deliveryTimeline: '21 days',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: 'Best price for bulk order.',
        paymentTerms: '50% advance, 50% on delivery',
      },
    }),
    prisma.quotation.create({
      data: {
        requirementId: requirements[1].id,
        supplierId: supplierUsers[1].id,
        status: 'APPROVED_BY_ADMIN',
        unitPrice: 2.5,
        quantity: 10000,
        total: 25000,
        currency: 'USD',
        deliveryTimeline: '10 days',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: 'Premium quality cotton. Sample available.',
        paymentTerms: 'Net 30',
      },
    }),
  ]);
  console.log('✅ Created quotations:', quotations.length);

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        requirementId: requirements[1].id,
        quotationId: quotations[2].id,
        buyerId: buyers[1].id,
        supplierId: supplierUsers[1].id,
        status: 'PAYMENT_PENDING',
        amount: 25000,
        currency: 'USD',
        paymentStatus: 'PENDING',
      },
    }),
  ]);
  console.log('✅ Created transactions:', transactions.length);

  // ============================================================================
  // DISPUTES
  // ============================================================================
  const disputes = await Promise.all([
    prisma.dispute.create({
      data: {
        transactionId: transactions[0].id,
        raisedBy: buyers[1].id,
        type: 'QUALITY',
        status: 'PENDING',
        description: 'Sample quality differs from actual delivery.',
        evidence: ['photo1.jpg', 'video1.mp4'],
      },
    }),
  ]);
  console.log('✅ Created disputes:', disputes.length);

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'REQUIREMENT_CREATED',
        title: 'New Requirement Pending Review',
        message: 'Steel Coils requirement from Acme Corp is ready for admin review.',
        resourceType: 'requirement',
        resourceId: requirements[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: am1.id,
        type: 'REQUIREMENT_CREATED',
        title: 'New Requirement for Verification',
        message: 'Industrial Chemicals requirement needs AM verification.',
        resourceType: 'requirement',
        resourceId: requirements[3].id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: proc1.id,
        type: 'REQUIREMENT_CREATED',
        title: 'Requirement Ready for Sourcing',
        message: 'Cotton Fabric requirement is verified and ready for supplier matching.',
        resourceType: 'requirement',
        resourceId: requirements[1].id,
      },
    }),
  ]);
  console.log('✅ Created notifications');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Login Credentials (password: password123):');
  console.log('   Admin: admin@tradewave.io');
  console.log('   AM 1: am1@tradewave.io');
  console.log('   AM 2: am2@tradewave.io');
  console.log('   Procurement: procurement1@tradewave.io');
  console.log('   Buyer: buyer1@acmecorp.com');
  console.log('   Supplier: supplier1@steelworks.cn');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
