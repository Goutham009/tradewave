type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const DB_ERROR_PATTERNS = [
  /tenant or user not found/i,
  /can't reach database server/i,
  /database .* does not exist/i,
  /connection .* refused/i,
  /connect econnrefused/i,
  /econnreset/i,
  /etimedout/i,
  /connection terminated/i,
  /socket hang up/i,
  /failed to connect/i,
  /prisma client initialization error/i,
  /prisma client known request error/i,
  /p1000/i,
  /p1001/i,
  /p1002/i,
  /p1008/i,
  /p1010/i,
  /p1011/i,
  /p1017/i,
  /p2024/i,
  /fatal:/i,
];

const AUTH_ERROR_PATTERNS = [
  /not authenticated/i,
  /unauthorized/i,
  /forbidden/i,
  /admin access required/i,
];

function toIso(dateOffsetDays = 0): string {
  return new Date(Date.now() + dateOffsetDays * 24 * 60 * 60 * 1000).toISOString();
}

function paginate<T>(items: T[], page = 1, limit = 10): { items: T[]; pagination: Pagination } {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, pages },
  };
}

function padSerial(value: number, width = 3): string {
  return String(value).padStart(width, '0');
}

function expandSeedData<T>(
  seed: T[],
  target: number,
  mapItem: (seedItem: T, index: number) => T
): T[] {
  const safeTarget = Math.max(seed.length, target);
  return Array.from({ length: safeTarget }, (_, index) => mapItem(seed[index % seed.length], index));
}

export function isLikelyDemoIdentifier(id: string, prefixes: string[]): boolean {
  const normalizedId = id.trim().toLowerCase();
  return prefixes.some((prefix) => normalizedId.startsWith(prefix.toLowerCase()));
}

function getErrorText(error: unknown): string {
  if (!error) return '';
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    const causeText = cause ? String(cause) : '';
    return `${error.name} ${error.message} ${causeText}`.trim();
  }
  return String(error);
}

export function isDemoFallbackEnabled(): boolean {
  const raw = process.env.TRADEWAVE_ENABLE_DEMO_FALLBACK;
  if (!raw) return true;
  const normalized = raw.trim().toLowerCase();
  return !['0', 'false', 'off', 'no'].includes(normalized);
}

export function shouldUseDemoFallback(error: unknown): boolean {
  if (!isDemoFallbackEnabled()) {
    return false;
  }

  const text = getErrorText(error);
  if (!text) {
    return false;
  }

  if (AUTH_ERROR_PATTERNS.some((pattern) => pattern.test(text))) {
    return false;
  }

  const rawCode =
    error && typeof error === 'object' && 'code' in error
      ? (error as { code?: unknown }).code
      : null;
  const normalizedCode = typeof rawCode === 'string' ? rawCode.toUpperCase() : '';

  if (['P1000', 'P1001', 'P1002', 'P1008', 'P1010', 'P1011', 'P1017', 'P2024'].includes(normalizedCode)) {
    return true;
  }

  return DB_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

export function getDemoRequirementsApiPayload() {
  const seedRequirements = [
    {
      id: 'req_demo_001',
      title: 'Industrial Steel Pipes - Grade 304',
      description: 'Steel pipes for manufacturing line upgrade.',
      category: 'Metals',
      status: 'QUOTATIONS_READY',
      priority: 'HIGH',
      quantity: 500,
      unit: 'MT',
      targetPrice: 1180,
      currency: 'USD',
      deliveryLocation: 'Mumbai Port, India',
      deliveryDeadline: toIso(20),
      buyerId: 'demo_buyer_001',
      buyer: {
        id: 'demo_buyer_001',
        name: 'Demo Buyer',
        companyName: 'Atlas Manufacturing',
      },
      quotations: [
        { id: 'quo_demo_001', status: 'VISIBLE_TO_BUYER', total: 590000, supplierId: 'sup_demo_001', supplier: { id: 'sup_demo_001', name: 'Steel Masters', companyName: 'Steel Masters China Ltd.' } },
      ],
      _count: { quotations: 3, transactions: 0 },
      createdAt: toIso(-8),
      updatedAt: toIso(-1),
    },
    {
      id: 'req_demo_002',
      title: 'Copper Wire 99.9% Conductivity',
      description: 'Bulk copper wire for export order.',
      category: 'Metals',
      status: 'PENDING_ADMIN_REVIEW',
      priority: 'MEDIUM',
      quantity: 120,
      unit: 'MT',
      targetPrice: 8400,
      currency: 'USD',
      deliveryLocation: 'Hamburg, Germany',
      deliveryDeadline: toIso(35),
      buyerId: 'demo_buyer_001',
      buyer: {
        id: 'demo_buyer_001',
        name: 'Demo Buyer',
        companyName: 'Atlas Manufacturing',
      },
      quotations: [],
      _count: { quotations: 0, transactions: 0 },
      createdAt: toIso(-2),
      updatedAt: toIso(-1),
    },
  ];

  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  const statuses = ['QUOTATIONS_READY', 'PENDING_ADMIN_REVIEW', 'QUOTES_PENDING', 'VERIFIED'];
  const buyers = [
    { id: 'demo_buyer_001', name: 'Arjun Mehta', companyName: 'Atlas Manufacturing' },
    { id: 'demo_buyer_002', name: 'Priya Nair', companyName: 'Northstar Engineering' },
    { id: 'demo_buyer_003', name: 'Ahmed Khan', companyName: 'Delta Build Corp' },
  ];
  const locations = ['Mumbai Port, India', 'Hamburg, Germany', 'Dubai, UAE', 'Colombo, Sri Lanka'];

  const requirements = expandSeedData(seedRequirements, 18, (seed, index) => {
    const requirementId = `req_demo_${padSerial(index + 1)}`;
    const buyer = buyers[index % buyers.length];
    const quotationsCount = index % 4 === 0 ? 0 : (index % 3) + 1;

    return {
      ...seed,
      id: requirementId,
      title: `${seed.title} Lot ${index + 1}`,
      description: `${seed.description} Demo batch ${index + 1} prepared for showcase.`,
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      quantity: Number(seed.quantity) + index * 20,
      targetPrice: Number(seed.targetPrice) + index * 12,
      deliveryLocation: locations[index % locations.length],
      deliveryDeadline: toIso(10 + index * 2),
      buyerId: buyer.id,
      buyer,
      quotations:
        quotationsCount > 0
          ? [
              {
                id: `quo_demo_${padSerial(index + 1)}`,
                status: 'VISIBLE_TO_BUYER',
                total: (Number(seed.targetPrice) + index * 10) * (Number(seed.quantity) + index * 20),
                supplierId: `sup_demo_${padSerial((index % 12) + 1)}`,
                supplier: {
                  id: `sup_demo_${padSerial((index % 12) + 1)}`,
                  name: `Supplier ${index + 1}`,
                  companyName: `Supplier ${index + 1} Metals Ltd.`,
                },
              },
            ]
          : [],
      _count: {
        quotations: quotationsCount,
        transactions: index % 5 === 0 ? 1 : 0,
      },
      createdAt: toIso(-(index + 4)),
      updatedAt: toIso(-(index % 4)),
    };
  });

  return {
    status: 'success',
    data: {
      requirements,
      pagination: {
        page: 1,
        limit: 50,
        total: requirements.length,
        pages: 1,
      },
    },
  };
}

export function getDemoQuotationsApiPayload() {
  const seedQuotations: any[] = [
    {
      id: 'quo_demo_001',
      requirementId: 'req_demo_001',
      unitPrice: 1150,
      quantity: 500,
      total: 575000,
      currency: 'USD',
      leadTime: 18,
      deliveryTimeline: 18,
      validUntil: toIso(12),
      status: 'VISIBLE_TO_BUYER',
      visibleToBuyer: true,
      createdAt: toIso(-3),
      requirement: {
        id: 'req_demo_001',
        title: 'Industrial Steel Pipes - Grade 304',
        category: 'Metals',
        quantity: 500,
        unit: 'MT',
        deliveryLocation: 'Mumbai Port, India',
        deliveryDeadline: toIso(20),
        targetPrice: 1180,
      },
      supplier: {
        id: 'sup_demo_001',
        name: 'Steel Masters',
        companyName: 'Steel Masters China Ltd.',
        location: 'Shanghai, China',
        verified: true,
        overallRating: 4.8,
        totalReviews: 112,
      },
    },
    {
      id: 'quo_demo_002',
      requirementId: 'req_demo_001',
      unitPrice: 1175,
      quantity: 500,
      total: 587500,
      currency: 'USD',
      leadTime: 21,
      deliveryTimeline: 21,
      validUntil: toIso(10),
      status: 'APPROVED_BY_ADMIN',
      visibleToBuyer: true,
      createdAt: toIso(-2),
      requirement: {
        id: 'req_demo_001',
        title: 'Industrial Steel Pipes - Grade 304',
      },
      supplier: {
        id: 'sup_demo_002',
        name: 'Pacific Metals',
        companyName: 'Pacific Metals Ltd.',
        location: 'Busan, South Korea',
        verified: true,
        overallRating: 4.6,
        totalReviews: 88,
      },
    },
  ];

  const quoteStatuses = [
    'VISIBLE_TO_BUYER',
    'APPROVED_BY_ADMIN',
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
  ];
  const locations = ['Shanghai, China', 'Busan, South Korea', 'Mumbai, India', 'Jakarta, Indonesia'];

  const quotations = expandSeedData(seedQuotations, 24, (seed, index) => {
    const requirementId = `req_demo_${padSerial((index % 18) + 1)}`;
    const supplierId = `sup_demo_${padSerial((index % 14) + 1)}`;
    const unitPrice = Number(seed.unitPrice) + (index % 6) * 14;
    const quantity = Number(seed.quantity) + (index % 5) * 15;

    return {
      ...seed,
      id: `quo_demo_${padSerial(index + 1)}`,
      requirementId,
      unitPrice,
      quantity,
      total: unitPrice * quantity,
      leadTime: Number(seed.leadTime) + (index % 7),
      deliveryTimeline: Number(seed.deliveryTimeline) + (index % 7),
      validUntil: toIso(7 + (index % 21)),
      status: quoteStatuses[index % quoteStatuses.length],
      visibleToBuyer: ['VISIBLE_TO_BUYER', 'APPROVED_BY_ADMIN', 'SHORTLISTED'].includes(
        quoteStatuses[index % quoteStatuses.length]
      ),
      createdAt: toIso(-(index + 2)),
      requirement: {
        ...seed.requirement,
        id: requirementId,
        title: `${seed.requirement.title} Lot ${(index % 8) + 1}`,
        quantity,
        targetPrice: Number(seed.requirement.targetPrice || unitPrice + 40),
      },
      supplier: {
        ...seed.supplier,
        id: supplierId,
        name: `Supplier ${index + 1}`,
        companyName: `Supplier ${index + 1} Metals Ltd.`,
        location: locations[index % locations.length],
        overallRating: 4 + (index % 10) / 10,
        totalReviews: 50 + index * 4,
      },
    };
  });

  return {
    status: 'success',
    data: {
      quotations,
      pagination: {
        page: 1,
        limit: 100,
        total: quotations.length,
        pages: 1,
      },
    },
  };
}

export function getDemoAmClientsApiPayload() {
  const seedClients = [
    {
      id: 'demo_client_001',
      accountNumber: 'ACC-DEMO0001',
      companyName: 'Atlas Manufacturing',
      contactPerson: 'Arjun Mehta',
      email: 'arjun@atlas.example',
      phone: '+91 90000 11111',
      type: 'buyer',
      status: 'active',
      totalOrders: 12,
      joinedDate: toIso(-180),
    },
    {
      id: 'demo_client_002',
      accountNumber: 'ACC-DEMO0002',
      companyName: 'Steel Masters China Ltd.',
      contactPerson: 'Liu Zhang',
      email: 'liu@steelmasters.example',
      phone: '+86 13800 22222',
      type: 'supplier',
      status: 'active',
      totalOrders: 36,
      joinedDate: toIso(-260),
    },
  ];

  const clients = expandSeedData(seedClients, 16, (seed, index) => ({
    ...seed,
    id: `demo_client_${padSerial(index + 1)}`,
    accountNumber: `ACC-DEMO${padSerial(index + 1, 4)}`,
    companyName: `${seed.companyName} ${index + 1}`,
    contactPerson: `${seed.contactPerson.split(' ')[0]} ${index + 1}`,
    email: `client${index + 1}@tradewave-demo.example`,
    type: index % 2 === 0 ? 'buyer' : 'supplier',
    status: index % 5 === 0 ? 'inactive' : 'active',
    totalOrders: seed.totalOrders + index * 2,
    joinedDate: toIso(-(90 + index * 10)),
  }));

  return {
    clients,
  };
}

export function getDemoLeadsApiPayload(page = 1, limit = 20) {
  const seedLeads: any[] = [
    {
      id: 'lead_demo_001',
      email: 'ops@atlas.example',
      fullName: 'Rohit Sharma',
      companyName: 'Atlas Manufacturing',
      phoneNumber: '+91 90000 33333',
      category: 'Metals',
      productName: 'Stainless Steel Pipes',
      quantity: 500,
      unit: 'MT',
      location: 'Mumbai, India',
      timeline: '2-4 weeks',
      targetPrice: 'USD 1180/MT',
      additionalReqs: 'Need ISO and mill test certificates.',
      source: 'LANDING_PAGE_FORM',
      leadScore: 'HIGH',
      status: 'ASSIGNED_TO_AM',
      notes: 'Discovery call done. Ready for account creation.',
      assignedTo: 'demo_am_001',
      assignedAt: toIso(-3),
      assignedAccountManagerName: 'Demo Account Manager',
      assignedAccountManagerEmail: 'am@tradewave.io',
      callScheduledAt: toIso(-4),
      callCompletedAt: toIso(-3),
      callNotes: 'Buyer wants fast-track reorder options.',
      callChecklist: { 'Confirmed product specifications': true },
      createdAt: toIso(-5),
      updatedAt: toIso(-1),
    },
    {
      id: 'lead_demo_002',
      email: 'purchase@northstar.example',
      fullName: 'Priya Nair',
      companyName: 'Northstar Engineering',
      phoneNumber: '+91 90000 44444',
      category: 'Electronics',
      productName: 'Industrial Capacitors',
      quantity: 75000,
      unit: 'pcs',
      location: 'Chennai, India',
      timeline: '1-3 months',
      targetPrice: 'USD 0.09/pc',
      additionalReqs: 'RoHS and REACH compliance needed.',
      source: 'LANDING_PAGE_FORM',
      leadScore: 'MEDIUM',
      status: 'NEW_LEAD',
      notes: null,
      assignedTo: null,
      assignedAt: null,
      assignedAccountManagerName: null,
      assignedAccountManagerEmail: null,
      callScheduledAt: null,
      callCompletedAt: null,
      callNotes: null,
      callChecklist: null,
      createdAt: toIso(-1),
      updatedAt: toIso(-1),
    },
  ];

  const leadStatuses = [
    'NEW_LEAD',
    'ASSIGNED_TO_AM',
    'CALL_SCHEDULED',
    'CALL_COMPLETED',
    'QUALIFIED',
    'CONVERTED',
  ];
  const leadScores = ['HIGH', 'MEDIUM', 'LOW'];

  const leads = expandSeedData(seedLeads, 30, (seed, index) => {
    const isAssigned = index % 3 !== 0;

    return {
      ...seed,
      id: `lead_demo_${padSerial(index + 1)}`,
      email: `lead${index + 1}@tradewave-demo.example`,
      fullName: `${seed.fullName.split(' ')[0]} Demo ${index + 1}`,
      companyName: `${seed.companyName} ${index + 1}`,
      phoneNumber: `+91 90000 ${String(30000 + index).slice(-5)}`,
      productName: `${seed.productName} Variant ${index + 1}`,
      quantity: Number(seed.quantity) + index * 10,
      location: ['Mumbai, India', 'Chennai, India', 'Dubai, UAE', 'Colombo, Sri Lanka'][index % 4],
      timeline: ['2-4 weeks', '1-3 months', 'Immediate', '4-6 weeks'][index % 4],
      targetPrice: index % 4 === 0 ? null : seed.targetPrice,
      leadScore: leadScores[index % leadScores.length],
      status: leadStatuses[index % leadStatuses.length],
      assignedTo: isAssigned ? 'demo_am_001' : null,
      assignedAt: isAssigned ? toIso(-(index + 2)) : null,
      assignedAccountManagerName: isAssigned ? 'Demo Account Manager' : null,
      assignedAccountManagerEmail: isAssigned ? 'am@tradewave.io' : null,
      callScheduledAt: isAssigned ? toIso(-(index + 3)) : null,
      callCompletedAt: isAssigned && index % 2 === 0 ? toIso(-(index + 2)) : null,
      callNotes: isAssigned ? 'Demo call completed with positive interest.' : null,
      callChecklist:
        isAssigned && index % 2 === 0
          ? {
              'Confirmed product specifications': true,
              'Discussed quality standards required': true,
            }
          : null,
      createdAt: toIso(-(index + 1)),
      updatedAt: toIso(-(index % 3)),
    };
  });

  const { items, pagination } = paginate(leads, page, limit);
  return {
    leads: items,
    pagination,
  };
}

export function getDemoNegotiationsApiPayload() {
  const seedThreads: any[] = [
    {
      id: 'neg_demo_001',
      status: 'ACTIVE',
      requirement: {
        id: 'req_demo_001',
        title: 'Industrial Steel Pipes - Grade 304',
        category: 'Metals',
        quantity: 500,
        unit: 'MT',
      },
      buyer: {
        id: 'demo_buyer_001',
        name: 'Atlas Manufacturing',
      },
      supplierNames: ['Steel Masters China Ltd.'],
      quotationsCount: 2,
      rounds: 4,
      originalAmount: 590000,
      currentAmount: 575000,
      currency: 'USD',
      selectedQuotationId: 'quo_demo_001',
      lastActivity: toIso(-1),
      createdAt: toIso(-3),
      latestMessage: {
        id: 'msg_demo_001',
        content: 'We can confirm dispatch within 18 days.',
        senderRole: 'SUPPLIER',
        createdAt: toIso(-1),
      },
    },
  ];

  const threadStatuses = ['ACTIVE', 'PENDING', 'ACTIVE', 'COMPLETED'];
  const threads = expandSeedData(seedThreads, 12, (seed, index) => ({
    ...seed,
    id: `neg_demo_${padSerial(index + 1)}`,
    status: threadStatuses[index % threadStatuses.length],
    requirement: {
      ...seed.requirement,
      id: `req_demo_${padSerial((index % 18) + 1)}`,
      title: `${seed.requirement.title} Lot ${(index % 8) + 1}`,
      quantity: seed.requirement.quantity + index * 15,
    },
    buyer: {
      ...seed.buyer,
      id: `demo_buyer_${padSerial((index % 6) + 1)}`,
      name: ['Atlas Manufacturing', 'Northstar Engineering', 'Delta Build Corp'][index % 3],
    },
    supplierNames: [`Supplier ${index + 1} Metals Ltd.`],
    quotationsCount: 1 + (index % 4),
    rounds: 2 + (index % 5),
    originalAmount: seed.originalAmount + index * 9000,
    currentAmount: seed.currentAmount + index * 8700,
    selectedQuotationId: `quo_demo_${padSerial(index + 1)}`,
    lastActivity: toIso(-(index % 4)),
    createdAt: toIso(-(index + 3)),
    latestMessage: {
      ...seed.latestMessage,
      id: `msg_demo_${padSerial(index + 1)}`,
      content: `Demo negotiation update ${index + 1}: revised timeline and pricing shared.`,
      senderRole: index % 2 === 0 ? 'SUPPLIER' : 'BUYER',
      createdAt: toIso(-(index % 4)),
    },
  }));

  return {
    status: 'success',
    threads,
    total: threads.length,
  };
}

export function getDemoProcurementRequirementsApiPayload() {
  const seedQueue = [
    {
      id: 'req_demo_001',
      requirementReference: 'REQ-DEMO0001',
      title: 'Industrial Steel Pipes - Grade 304',
      buyerName: 'Atlas Manufacturing',
      category: 'Metals',
      quantity: 500,
      unit: 'MT',
      budget: 590000,
      deliveryLocation: 'Mumbai Port, India',
      deadline: toIso(20),
      status: 'suppliers_contacted',
      rawStatus: 'QUOTES_PENDING',
      priority: 'high',
      suppliersContacted: 3,
      quotesReceived: 2,
      procurementOwner: 'Demo Procurement Officer',
      createdAt: toIso(-6),
      lastUpdated: toIso(-1),
    },
    {
      id: 'req_demo_003',
      requirementReference: 'REQ-DEMO0003',
      title: 'Aluminum Extrusions',
      buyerName: 'Northstar Engineering',
      category: 'Metals',
      quantity: 220,
      unit: 'MT',
      budget: 418000,
      deliveryLocation: 'Dubai, UAE',
      deadline: toIso(28),
      status: 'pending_match',
      rawStatus: 'VERIFIED',
      priority: 'medium',
      suppliersContacted: 0,
      quotesReceived: 0,
      procurementOwner: 'Unassigned',
      createdAt: toIso(-2),
      lastUpdated: toIso(-2),
    },
  ];

  const queueStatuses = ['pending_match', 'suppliers_contacted', 'quotes_received'];
  const priorities = ['high', 'medium', 'low'];
  const requirements = expandSeedData(seedQueue, 15, (seed, index) => {
    const id = `req_demo_${padSerial(index + 1)}`;
    const status = queueStatuses[index % queueStatuses.length] as
      | 'pending_match'
      | 'suppliers_contacted'
      | 'quotes_received';
    const suppliersContacted = status === 'pending_match' ? 0 : 2 + (index % 5);
    const quotesReceived = status === 'quotes_received' ? 1 + (index % 4) : index % 2;

    return {
      ...seed,
      id,
      requirementReference: `REQ-DEMO${padSerial(index + 1, 4)}`,
      title: `${seed.title} Batch ${index + 1}`,
      buyerName: ['Atlas Manufacturing', 'Northstar Engineering', 'Delta Build Corp'][index % 3],
      quantity: seed.quantity + index * 12,
      budget: seed.budget + index * 8000,
      status,
      rawStatus:
        status === 'pending_match'
          ? 'VERIFIED'
          : status === 'suppliers_contacted'
            ? 'QUOTES_PENDING'
            : 'QUOTATIONS_READY',
      priority: priorities[index % priorities.length],
      suppliersContacted,
      quotesReceived,
      procurementOwner: index % 4 === 0 ? 'Unassigned' : `Procurement Officer ${((index % 4) + 1).toString()}`,
      deadline: toIso(14 + index * 2),
      createdAt: toIso(-(index + 3)),
      lastUpdated: toIso(-(index % 3)),
    };
  });

  return {
    requirements,
  };
}

export function getDemoAdminUsersApiPayload(
  page = 1,
  limit = 10,
  filters?: { role?: string | null; kycStatus?: string | null; search?: string | null }
) {
  const seedUsers = [
    { id: 'demo_admin_001', accountNumber: 'ACC-DEMO1001', name: 'Admin User', email: 'admin@tradewave.io', role: 'ADMIN', companyName: 'TradeWave HQ', verified: true, kycStatus: 'VERIFIED', createdAt: toIso(-400), lastLogin: toIso(-1), transactionCount: 0 },
    { id: 'demo_am_001', accountNumber: 'ACC-DEMO1002', name: 'Demo Account Manager', email: 'am@tradewave.io', role: 'ACCOUNT_MANAGER', companyName: 'TradeWave Internal', verified: true, kycStatus: 'VERIFIED', createdAt: toIso(-320), lastLogin: toIso(-1), transactionCount: 0 },
    { id: 'demo_buyer_001', accountNumber: 'ACC-DEMO1003', name: 'Arjun Mehta', email: 'arjun@atlas.example', role: 'BUYER', companyName: 'Atlas Manufacturing', verified: true, kycStatus: 'VERIFIED', createdAt: toIso(-180), lastLogin: toIso(-1), transactionCount: 12 },
    { id: 'demo_supplier_001', accountNumber: 'ACC-DEMO1004', name: 'Liu Zhang', email: 'liu@steelmasters.example', role: 'SUPPLIER', companyName: 'Steel Masters China Ltd.', verified: true, kycStatus: 'VERIFIED', createdAt: toIso(-260), lastLogin: toIso(-2), transactionCount: 36 },
  ];

  const users = expandSeedData(seedUsers, 28, (seed, index) => {
    const roleCycle = ['BUYER', 'SUPPLIER', 'BUYER', 'SUPPLIER', 'ACCOUNT_MANAGER', 'ADMIN'];
    const role = roleCycle[index % roleCycle.length];
    return {
      ...seed,
      id: `demo_user_${padSerial(index + 1)}`,
      accountNumber: `ACC-DEMO${padSerial(index + 1, 4)}`,
      name: `${role === 'BUYER' ? 'Buyer' : role === 'SUPPLIER' ? 'Supplier' : role === 'ACCOUNT_MANAGER' ? 'AM' : 'Admin'} Demo ${index + 1}`,
      email: `user${index + 1}@tradewave-demo.example`,
      role,
      companyName:
        role === 'BUYER'
          ? `Buyer Company ${index + 1}`
          : role === 'SUPPLIER'
            ? `Supplier Company ${index + 1}`
            : 'TradeWave Internal',
      verified: index % 6 !== 0,
      kycStatus: index % 5 === 0 ? 'PENDING' : index % 7 === 0 ? 'REJECTED' : 'VERIFIED',
      createdAt: toIso(-(index + 20)),
      lastLogin: toIso(-(index % 4)),
      transactionCount: role === 'BUYER' || role === 'SUPPLIER' ? 3 + index : 0,
    };
  });

  const roleFilter = filters?.role?.trim() || null;
  const kycStatusFilter = filters?.kycStatus?.trim() || null;
  const searchFilter = filters?.search?.trim().toLowerCase() || null;

  let filtered = users;

  if (roleFilter) {
    filtered = filtered.filter((user) => user.role === roleFilter);
  } else {
    filtered = filtered.filter((user) => ['BUYER', 'SUPPLIER'].includes(user.role));
  }

  if (kycStatusFilter) {
    filtered = filtered.filter((user) => user.kycStatus === kycStatusFilter);
  }

  if (searchFilter) {
    filtered = filtered.filter((user) => {
      const searchable = `${user.name} ${user.email} ${user.companyName || ''}`.toLowerCase();
      return searchable.includes(searchFilter);
    });
  }

  const { items, pagination } = paginate(filtered, page, limit);
  return {
    status: 'success',
    data: {
      users: items,
      pagination,
    },
  };
}

export function getDemoAdminRequirementsApiPayload(page = 1, limit = 100) {
  const seedRequirements = [
    {
      id: 'req_demo_001', requirementReference: 'REQ-DEMO0001', title: 'Industrial Steel Pipes - Grade 304', description: 'High-volume supply for Q2 contracts.', category: 'Metals', status: 'QUOTES_PENDING', quantity: 500, unit: 'MT', targetPrice: 1180, budgetMin: 1120, budgetMax: 1200, currency: 'USD', deliveryLocation: 'Mumbai Port, India', deliveryDeadline: toIso(20), priority: 'HIGH', amVerified: true, adminReviewed: true, suppliersContacted: 3, quotesReceived: 2, quotationCount: 2,
      buyer: { id: 'demo_buyer_001', name: 'Arjun Mehta', email: 'arjun@atlas.example', companyName: 'Atlas Manufacturing' },
      accountManager: { id: 'demo_am_001', name: 'Demo Account Manager', email: 'am@tradewave.io' },
      procurementOfficer: { id: 'demo_proc_001', name: 'Demo Procurement Officer', email: 'proc@tradewave.io' },
      createdAt: toIso(-6), updatedAt: toIso(-1),
    },
    {
      id: 'req_demo_002', requirementReference: 'REQ-DEMO0002', title: 'Copper Wire 99.9% Conductivity', description: 'Export packing with compliance docs.', category: 'Metals', status: 'PENDING_ADMIN_REVIEW', quantity: 120, unit: 'MT', targetPrice: 8400, budgetMin: 8300, budgetMax: 8500, currency: 'USD', deliveryLocation: 'Hamburg, Germany', deliveryDeadline: toIso(35), priority: 'MEDIUM', amVerified: true, adminReviewed: false, suppliersContacted: 0, quotesReceived: 0, quotationCount: 0,
      buyer: { id: 'demo_buyer_002', name: 'Priya Nair', email: 'purchase@northstar.example', companyName: 'Northstar Engineering' },
      accountManager: { id: 'demo_am_001', name: 'Demo Account Manager', email: 'am@tradewave.io' },
      procurementOfficer: null,
      createdAt: toIso(-2), updatedAt: toIso(-1),
    },
  ];

  const statuses = ['QUOTES_PENDING', 'PENDING_ADMIN_REVIEW', 'VERIFIED', 'QUOTATIONS_READY'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  const requirements = expandSeedData(seedRequirements, 20, (seed, index) => {
    const requirementId = `req_demo_${padSerial(index + 1)}`;
    return {
      ...seed,
      id: requirementId,
      requirementReference: `REQ-DEMO${padSerial(index + 1, 4)}`,
      title: `${seed.title} Lot ${index + 1}`,
      description: `${seed.description} Showcase record ${index + 1}.`,
      status: statuses[index % statuses.length],
      quantity: Number(seed.quantity) + index * 18,
      targetPrice: Number(seed.targetPrice) + index * 10,
      budgetMin: Number(seed.budgetMin) + index * 10,
      budgetMax: Number(seed.budgetMax) + index * 10,
      priority: priorities[index % priorities.length],
      suppliersContacted: index % 4 === 0 ? 0 : 2 + (index % 4),
      quotesReceived: index % 3,
      quotationCount: index % 3,
      buyer: {
        ...seed.buyer,
        id: `demo_buyer_${padSerial((index % 8) + 1)}`,
        name: `Buyer Demo ${index + 1}`,
        email: `buyer${index + 1}@tradewave-demo.example`,
        companyName: `Buyer Company ${index + 1}`,
      },
      accountManager: {
        id: `demo_am_${padSerial((index % 4) + 1)}`,
        name: `Account Manager ${((index % 4) + 1).toString()}`,
        email: `am${(index % 4) + 1}@tradewave-demo.example`,
      },
      procurementOfficer:
        index % 5 === 0
          ? null
          : {
              id: `demo_proc_${padSerial((index % 4) + 1)}`,
              name: `Procurement Officer ${((index % 4) + 1).toString()}`,
              email: `proc${(index % 4) + 1}@tradewave-demo.example`,
            },
      createdAt: toIso(-(index + 6)),
      updatedAt: toIso(-(index % 4)),
    };
  });

  const { items, pagination } = paginate(requirements, page, limit);
  return {
    success: true,
    data: items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.pages,
    },
  };
}

export function getDemoAdminQuotationsApiPayload(page = 1, limit = 10) {
  const seedQuotations = [
    {
      id: 'quo_demo_001', requirementId: 'req_demo_001', supplierName: 'Steel Masters China Ltd.', supplierEmail: 'liu@steelmasters.example', buyerName: 'Arjun Mehta', buyerCompany: 'Atlas Manufacturing', buyerEmail: 'arjun@atlas.example', requirementTitle: 'Industrial Steel Pipes - Grade 304', category: 'Metals', requirementQuantity: 500, requirementUnit: 'MT', requirementStatus: 'QUOTES_PENDING', requirementCreatedAt: toIso(-6), amount: 575000, unitPrice: 1150, quantity: 500, currency: 'USD', leadTime: 18, notes: 'Includes QC certification', status: 'VISIBLE_TO_BUYER', validUntil: toIso(12), createdAt: toIso(-3), updatedAt: toIso(-2),
    },
    {
      id: 'quo_demo_002', requirementId: 'req_demo_001', supplierName: 'Pacific Metals Ltd.', supplierEmail: 'sales@pacificmetals.example', buyerName: 'Arjun Mehta', buyerCompany: 'Atlas Manufacturing', buyerEmail: 'arjun@atlas.example', requirementTitle: 'Industrial Steel Pipes - Grade 304', category: 'Metals', requirementQuantity: 500, requirementUnit: 'MT', requirementStatus: 'QUOTES_PENDING', requirementCreatedAt: toIso(-6), amount: 587500, unitPrice: 1175, quantity: 500, currency: 'USD', leadTime: 21, notes: 'Standard packaging', status: 'APPROVED_BY_ADMIN', validUntil: toIso(10), createdAt: toIso(-2), updatedAt: toIso(-1),
    },
  ];

  const statuses = ['VISIBLE_TO_BUYER', 'APPROVED_BY_ADMIN', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'];
  const quotations = expandSeedData(seedQuotations, 26, (seed, index) => {
    const unitPrice = Number(seed.unitPrice) + (index % 7) * 11;
    const quantity = Number(seed.quantity) + (index % 5) * 20;
    return {
      ...seed,
      id: `quo_demo_${padSerial(index + 1)}`,
      requirementId: `req_demo_${padSerial((index % 20) + 1)}`,
      supplierName: `Supplier ${index + 1} Metals Ltd.`,
      supplierEmail: `supplier${index + 1}@tradewave-demo.example`,
      buyerName: `Buyer Demo ${index + 1}`,
      buyerCompany: `Buyer Company ${index + 1}`,
      buyerEmail: `buyer${index + 1}@tradewave-demo.example`,
      requirementTitle: `${seed.requirementTitle} Lot ${(index % 8) + 1}`,
      requirementQuantity: Number(seed.requirementQuantity) + index * 15,
      requirementStatus: ['QUOTES_PENDING', 'QUOTATIONS_READY', 'VERIFIED'][index % 3],
      amount: unitPrice * quantity,
      unitPrice,
      quantity,
      leadTime: Number(seed.leadTime) + (index % 6),
      notes: `Demo quotation ${index + 1} with negotiated commercial terms.`,
      status: statuses[index % statuses.length],
      validUntil: toIso(8 + (index % 14)),
      createdAt: toIso(-(index + 3)),
      updatedAt: toIso(-(index % 3)),
    };
  });

  const { items, pagination } = paginate(quotations, page, limit);
  return {
    status: 'success',
    data: {
      quotations: items,
      stats: {
        total: quotations.length,
        pending: quotations.filter((q) => q.status === 'SUBMITTED').length,
        accepted: quotations.filter((q) => q.status === 'ACCEPTED').length,
        rejected: quotations.filter((q) => q.status === 'REJECTED').length,
        totalValue: quotations.reduce((sum, q) => sum + q.amount, 0),
      },
      pagination,
    },
  };
}

export function getDemoAdminTransactionsApiPayload(page = 1, limit = 10) {
  const seedTransactions = [
    { id: 'txn_demo_001', buyerName: 'Atlas Manufacturing', supplierName: 'Steel Masters China Ltd.', amount: 575000, currency: 'USD', status: 'IN_TRANSIT', escrowStatus: 'HELD', createdAt: toIso(-5), requirementTitle: 'Industrial Steel Pipes - Grade 304' },
    { id: 'txn_demo_002', buyerName: 'Northstar Engineering', supplierName: 'Pacific Metals Ltd.', amount: 418000, currency: 'USD', status: 'PAYMENT_PENDING', escrowStatus: 'PENDING', createdAt: toIso(-2), requirementTitle: 'Aluminum Extrusions' },
    { id: 'txn_demo_003', buyerName: 'Import Hub', supplierName: 'Global Supply', amount: 67200, currency: 'USD', status: 'DISPUTED', escrowStatus: 'DISPUTED', createdAt: toIso(-8), requirementTitle: 'Electronic Parts' },
  ];

  const statuses = ['IN_TRANSIT', 'PAYMENT_PENDING', 'DISPUTED', 'ESCROW_HELD', 'COMPLETED', 'FUNDS_RELEASED'];
  const escrowStatuses = ['HELD', 'PENDING', 'DISPUTED', 'RELEASED'];
  const transactions = expandSeedData(seedTransactions, 24, (seed, index) => ({
    ...seed,
    id: `txn_demo_${padSerial(index + 1)}`,
    buyerName: `Buyer Company ${index + 1}`,
    supplierName: `Supplier Company ${index + 1}`,
    amount: seed.amount + index * 16500,
    status: statuses[index % statuses.length],
    escrowStatus: escrowStatuses[index % escrowStatuses.length],
    createdAt: toIso(-(index + 2)),
    requirementTitle: `${seed.requirementTitle} Lot ${(index % 7) + 1}`,
  }));

  const { items, pagination } = paginate(transactions, page, limit);
  return {
    status: 'success',
    data: {
      transactions: items,
      stats: {
        total: transactions.length,
        pending: transactions.filter((t) => ['PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'ESCROW_HELD'].includes(t.status)).length,
        completed: transactions.filter((t) => ['COMPLETED', 'FUNDS_RELEASED'].includes(t.status)).length,
        disputed: transactions.filter((t) => t.status === 'DISPUTED').length,
        totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
      },
      pagination,
    },
  };
}

export function getDemoAdminDisputesApiPayload() {
  const seedDisputes = [
    { id: 'DSP-001', transactionId: 'TXN-2024-003', buyerName: 'Import Hub', supplierName: 'Global Supply', amount: 67200, currency: 'USD', reason: 'Product quality does not match specifications. Received defective units.', status: 'OPEN', priority: 'HIGH', createdAt: toIso(-12), updatedAt: toIso(-12), requirementTitle: 'Electronic Parts' },
    { id: 'DSP-002', transactionId: 'TXN-2024-015', buyerName: 'Tech Corp', supplierName: 'Metals Ltd', amount: 34500, currency: 'USD', reason: 'Delivery delayed by 3 weeks without prior notice.', status: 'UNDER_REVIEW', priority: 'MEDIUM', createdAt: toIso(-10), updatedAt: toIso(-8), requirementTitle: 'Steel Components' },
    { id: 'DSP-003', transactionId: 'TXN-2024-008', buyerName: 'Mega Industries', supplierName: 'Steel Inc', amount: 89000, currency: 'USD', reason: 'Quantity mismatch - received 800 units instead of 1000.', status: 'AWAITING_RESPONSE', priority: 'HIGH', createdAt: toIso(-9), updatedAt: toIso(-6), requirementTitle: 'Industrial Materials' },
  ];

  const statuses = ['OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE', 'ESCALATED', 'RESOLVED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const disputes = expandSeedData(seedDisputes, 12, (seed, index) => ({
    ...seed,
    id: `DSP-${padSerial(index + 1)}`,
    transactionId: `TXN-2024-${padSerial(index + 1)}`,
    buyerName: `Buyer Company ${index + 1}`,
    supplierName: `Supplier Company ${index + 1}`,
    amount: seed.amount + index * 9400,
    status: statuses[index % statuses.length],
    priority: priorities[index % priorities.length],
    reason: `Demo dispute ${index + 1}: ${seed.reason}`,
    createdAt: toIso(-(index + 6)),
    updatedAt: toIso(-(index % 4)),
    requirementTitle: `${seed.requirementTitle} Lot ${(index % 8) + 1}`,
  }));

  return {
    status: 'success',
    data: {
      disputes,
    },
  };
}

function pickDemoRecordById<T extends { id: string }>(items: T[], id: string): T {
  const exactMatch = items.find((item) => item.id === id);
  if (exactMatch) {
    return exactMatch;
  }

  return {
    ...items[0],
    id,
  };
}

export function getDemoLeadByIdPayload(id: string) {
  const leadsPayload = getDemoLeadsApiPayload(1, 500);
  const lead = pickDemoRecordById(leadsPayload.leads as Array<{ id: string }>, id);
  return { lead };
}

export function getDemoAdminRequirementByIdPayload(id: string) {
  const requirementsPayload = getDemoAdminRequirementsApiPayload(1, 500);
  const requirements = requirementsPayload.data as Array<{ id: string }>;
  const requirement = pickDemoRecordById(requirements, id);

  return {
    success: true,
    data: requirement,
  };
}

export function getDemoQuotationByIdPayload(id: string) {
  const quotationsPayload = getDemoQuotationsApiPayload();
  const requirementsPayload = getDemoRequirementsApiPayload();

  const quotations = quotationsPayload.data.quotations as Array<any>;
  const requirementList = requirementsPayload.data.requirements as Array<any>;
  const selected = pickDemoRecordById(quotations, id);

  const requirement =
    requirementList.find((item) => item.id === selected.requirementId) ||
    pickDemoRecordById(requirementList, selected.requirementId || 'req_demo_001');

  const unitPrice = Number(selected.unitPrice || 1150);
  const quantity = Number(selected.quantity || 500);
  const total = Number(selected.total || unitPrice * quantity);

  return {
    status: 'success',
    data: {
      quotation: {
        ...selected,
        id,
        userId: `demo_supplier_user_${padSerial((Number(id.replace(/\D/g, '')) % 10) + 1)}`,
        requirementId: requirement.id,
        notes: selected.notes || 'Demo quotation generated for platform walkthrough.',
        terms: 'Demo terms: 30% advance, 70% before shipment. Escrow protected.',
        pricing: {
          unitPrice,
          quantity,
          subtotal: total,
          total,
          currency: selected.currency || 'USD',
        },
        delivery: {
          leadTime: String(selected.leadTime || 18),
          shippingMethod: 'Sea Freight',
          incoterm: 'CIF',
        },
        requirement: {
          ...requirement,
          buyer: requirement.buyer || {
            id: 'demo_buyer_001',
            name: 'Demo Buyer',
            email: 'buyer@tradewave-demo.example',
            companyName: 'Demo Buyer Company',
          },
          attachments: [
            {
              id: 'att_demo_001',
              name: 'requirements-specs.pdf',
              url: '#',
              size: 182000,
            },
          ],
        },
        supplier: {
          ...selected.supplier,
          email: `supplier-${selected.supplier?.id || 'demo'}@tradewave-demo.example`,
          rating: selected.supplier?.overallRating || 4.6,
          certifications: [{ id: 'cert_demo_001', name: 'ISO 9001' }],
        },
        transactions: [],
        validUntil: selected.validUntil || toIso(10),
        createdAt: selected.createdAt || toIso(-2),
        updatedAt: selected.updatedAt || toIso(-1),
      },
    },
  };
}

export function getDemoTransactionByIdPayload(id: string) {
  const sequence = Math.max(1, Number(id.replace(/\D/g, '')) || 1);
  const requirementId = `req_demo_${padSerial(((sequence - 1) % 20) + 1)}`;
  const quotationId = `quo_demo_${padSerial(((sequence - 1) % 24) + 1)}`;

  return {
    status: 'success',
    data: {
      transaction: {
        id,
        requirementId,
        quotationId,
        buyerId: `demo_buyer_${padSerial(((sequence - 1) % 8) + 1)}`,
        supplierId: `demo_supplier_${padSerial(((sequence - 1) % 8) + 1)}`,
        status: ['PAYMENT_PENDING', 'ESCROW_HELD', 'IN_TRANSIT', 'DELIVERED', 'DISPUTED'][
          (sequence - 1) % 5
        ],
        amount: 180000 + sequence * 9000,
        currency: 'USD',
        destination: ['Mumbai, India', 'Hamburg, Germany', 'Dubai, UAE'][(sequence - 1) % 3],
        estimatedDelivery: toIso(10 + ((sequence - 1) % 14)),
        createdAt: toIso(-(sequence + 4)),
        updatedAt: toIso(-(sequence % 3)),
        requirement: {
          id: requirementId,
          title: `Demo Requirement ${((sequence - 1) % 20) + 1}`,
          category: ['Metals', 'Electronics', 'Chemicals'][(sequence - 1) % 3],
          quantity: 200 + sequence * 5,
          unit: 'MT',
          deliveryLocation: ['Mumbai Port, India', 'Dubai, UAE', 'Hamburg, Germany'][(sequence - 1) % 3],
          attachments: [
            {
              id: `att_demo_${padSerial(sequence)}`,
              name: 'demo-requirement-spec.pdf',
              url: '#',
              size: 154000,
            },
          ],
        },
        quotation: {
          id: quotationId,
          unitPrice: 1100 + sequence * 4,
          quantity: 200 + sequence * 5,
          total: (1100 + sequence * 4) * (200 + sequence * 5),
          leadTime: 18 + (sequence % 7),
          supplier: {
            id: `demo_supplier_${padSerial(((sequence - 1) % 8) + 1)}`,
            name: `Supplier Contact ${sequence}`,
            companyName: `Supplier Company ${sequence}`,
            location: ['Shanghai, China', 'Busan, South Korea', 'Mumbai, India'][(sequence - 1) % 3],
            email: `supplier${sequence}@tradewave-demo.example`,
            phone: '+1 555 0100',
            verified: true,
            overallRating: 4.2 + ((sequence - 1) % 6) / 10,
            totalReviews: 80 + sequence,
          },
        },
        buyer: {
          id: `demo_buyer_${padSerial(((sequence - 1) % 8) + 1)}`,
          name: `Buyer User ${sequence}`,
          email: `buyer${sequence}@tradewave-demo.example`,
          companyName: `Buyer Company ${sequence}`,
          phone: '+1 555 0110',
        },
        supplier: {
          id: `demo_supplier_${padSerial(((sequence - 1) % 8) + 1)}`,
          name: `Supplier User ${sequence}`,
          email: `supplier${sequence}@tradewave-demo.example`,
          companyName: `Supplier Company ${sequence}`,
          location: 'Demo Logistics Hub',
          phone: '+1 555 0190',
          verified: true,
          overallRating: 4.4,
        },
        escrow: {
          id: `escrow_demo_${padSerial(sequence)}`,
          amount: 180000 + sequence * 9000,
          currency: 'USD',
          status: ['PENDING', 'HELD', 'RELEASED', 'DISPUTED'][sequence % 4],
          deliveryConfirmed: sequence % 4 === 0,
          qualityApproved: sequence % 5 === 0,
          documentsVerified: true,
          releaseConditions: [
            {
              id: `rc_demo_${padSerial(sequence)}_1`,
              type: 'DELIVERY_CONFIRMED',
              description: 'Delivery confirmed by buyer',
              satisfied: sequence % 4 === 0,
            },
            {
              id: `rc_demo_${padSerial(sequence)}_2`,
              type: 'DOCUMENTS_VERIFIED',
              description: 'Documents verified by admin',
              satisfied: true,
            },
          ],
        },
        milestones: [
          {
            id: `ms_demo_${padSerial(sequence)}_1`,
            status: 'IN_TRANSIT',
            description: 'Shipment is in transit to destination port.',
            timestamp: toIso(-2),
          },
          {
            id: `ms_demo_${padSerial(sequence)}_2`,
            status: 'ESCROW_HELD',
            description: 'Payment secured in escrow.',
            timestamp: toIso(-4),
          },
        ],
        documents: [
          {
            id: `doc_demo_${padSerial(sequence)}_1`,
            name: 'Commercial Invoice',
            type: 'INVOICE',
            url: '#',
            uploadedAt: toIso(-3),
          },
        ],
        payments: [
          {
            id: `pay_demo_${padSerial(sequence)}_1`,
            amount: 180000 + sequence * 9000,
            currency: 'USD',
            method: 'BANK_TRANSFER',
            status: 'COMPLETED',
            createdAt: toIso(-4),
          },
        ],
        references: {
          requirementReference: `REQ-DEMO${padSerial(((sequence - 1) % 20) + 1, 4)}`,
          quotationReference: `QUO-DEMO${padSerial(((sequence - 1) % 24) + 1, 4)}`,
          transactionReference: `TXN-DEMO${padSerial(sequence, 4)}`,
          buyerOrderId: `BUY-ORD-${padSerial(sequence, 5)}`,
          supplierOrderId: `SUP-ORD-${padSerial(sequence, 5)}`,
        },
      },
    },
  };
}

export function getDemoProcurementRequirementByIdPayload(id: string) {
  const queuePayload = getDemoProcurementRequirementsApiPayload();
  const selected = pickDemoRecordById(queuePayload.requirements as Array<any>, id);

  const suppliers = Array.from({ length: 6 }, (_, index) => ({
    id: `card_demo_${padSerial(index + 1)}`,
    supplierId: `sup_demo_${padSerial(index + 1)}`,
    supplierName: `Supplier ${index + 1} Metals Ltd.`,
    contactEmail: `supplier${index + 1}@tradewave-demo.example`,
    region: ['Asia', 'Europe', 'Middle East'][index % 3],
    invitedAt: toIso(-(index + 2)),
    respondedAt: index % 2 === 0 ? toIso(-(index + 1)) : null,
    status: ['INVITED', 'VIEWED_RFQ', 'QUOTATION_SUBMITTED', 'DECLINED'][index % 4],
    quotedAmount: index % 2 === 0 ? selected.budget - (index + 1) * 2500 : null,
  }));

  return {
    requirement: {
      id,
      requirementReference: selected.requirementReference || `REQ-DEMO${padSerial(1, 4)}`,
      buyerCompany: selected.buyerName || 'Demo Buyer Company',
      productType: selected.title || 'Demo Product',
      category: selected.category || 'Metals',
      quantity: selected.quantity || 200,
      unit: selected.unit || 'MT',
      deliveryLocation: selected.deliveryLocation || 'Demo Port',
      deliveryDeadline: selected.deadline || toIso(20),
      procurementOwner: selected.procurementOwner || 'Unassigned',
      createdAt: selected.createdAt || toIso(-3),
      status: selected.status || 'pending_match',
      rawStatus: selected.rawStatus || 'VERIFIED',
      suppliersInvited: selected.suppliersContacted || suppliers.length,
      quotationsReceived: selected.quotesReceived || 0,
      suppliers,
    },
  };
}
