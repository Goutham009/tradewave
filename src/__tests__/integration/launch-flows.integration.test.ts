/** @jest-environment node */
import { beforeEach, describe, expect, test, jest } from '@jest/globals';

const mockPrisma = {
  quotation: {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  transaction: {
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  escrowTransaction: {
    create: jest.fn(),
  },
  releaseCondition: {
    createMany: jest.fn(),
  },
  requirement: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  negotiationThread: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  negotiationMessage: {
    create: jest.fn(),
  },
  supplierRequirementCard: {
    create: jest.fn(),
  },
  supplier: {
    findMany: jest.fn(),
  },
  procurementTask: {
    updateMany: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    update: jest.fn(),
  },
  review: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth-options', () => ({
  authOptions: {},
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockPrisma,
  default: mockPrisma,
}));

jest.mock('@/lib/db', () => ({
  __esModule: true,
  prisma: mockPrisma,
  default: mockPrisma,
}));

jest.mock('@/lib/services/goodStandingService', () => ({
  checkBuyerGoodStanding: jest.fn(),
}));

const { POST: adminCreateTransaction } = require('@/app/api/admin/transactions/create/route');
const { POST: buyerAcceptQuote } = require('@/app/api/buyer/quotations/[id]/accept/route');
const { POST: buyerStartNegotiation } = require('@/app/api/buyer/negotiations/route');
const { POST: procurementMatchSuppliers } = require('@/app/api/procurement/requirements/[id]/match-suppliers/route');

const { getServerSession: mockGetServerSession } = jest.requireMock('next-auth') as {
  getServerSession: {
    mockResolvedValue: (value: any) => void;
  };
};

const mockSession = (value: any) =>
  (mockGetServerSession as {
    mockResolvedValue: (payload: any) => void;
  }).mockResolvedValue(value);

const asJsonRequest = (body: any) =>
  ({
    json: async () => body,
  } as any);

describe('Launch Flow Integration Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('admin transaction creation rejects unauthenticated requests', async () => {
    mockSession(null);

    const response = await adminCreateTransaction(asJsonRequest({ quotationId: 'quote-1' }));

    expect(response.status).toBe(401);
  });

  test('admin transaction creation rejects non-admin role', async () => {
    mockSession({
      user: { id: 'user-1', role: 'BUYER' },
    });

    const response = await adminCreateTransaction(asJsonRequest({ quotationId: 'quote-1' }));

    expect(response.status).toBe(403);
  });

  test('buyer quote acceptance rejects non-buyer role', async () => {
    mockSession({
      user: { id: 'user-1', role: 'SUPPLIER' },
    });

    const response = await buyerAcceptQuote(asJsonRequest({}), { params: { id: 'quote-1' } });

    expect(response.status).toBe(403);
  });

  test('buyer quote acceptance rejects when quote does not belong to session buyer', async () => {
    mockSession({
      user: { id: 'buyer-1', role: 'BUYER' },
    });

    (mockPrisma.quotation.findUnique as any).mockResolvedValue({
      id: 'quote-1',
      visibleToBuyer: true,
      requirementId: 'req-1',
      requirement: {
        id: 'req-1',
        buyerId: 'buyer-2',
        title: 'Steel Coils',
        quantity: 100,
        unit: 'tons',
        category: 'Metals',
        deliveryLocation: 'Mumbai',
      },
      supplier: { id: 'supplier-1', companyName: 'Acme Supply' },
      total: 1000,
      currency: 'USD',
    });

    const response = await buyerAcceptQuote(asJsonRequest({}), { params: { id: 'quote-1' } });

    expect(response.status).toBe(403);
  });

  test('buyer negotiation start rejects requirement ownership mismatch', async () => {
    mockSession({
      user: { id: 'buyer-1', role: 'BUYER' },
    });

    (mockPrisma.requirement.findUnique as any).mockResolvedValue({
      assignedAccountManagerId: 'am-1',
      buyerId: 'buyer-2',
    });

    const response = await buyerStartNegotiation(
      asJsonRequest({
        requirementId: 'req-1',
        quotationIds: ['quote-1'],
      })
    );

    expect(response.status).toBe(403);
  });

  test('procurement supplier matching rejects wrong role', async () => {
    mockSession({
      user: { id: 'buyer-1', role: 'BUYER' },
    });

    const response = await procurementMatchSuppliers(
      asJsonRequest({ supplierIds: ['supplier-1'] }),
      { params: { id: 'req-1' } }
    );

    expect(response.status).toBe(403);
  });

  test('procurement supplier matching validates supplierIds payload', async () => {
    mockSession({
      user: { id: 'proc-1', role: 'PROCUREMENT_OFFICER' },
    });

    const response = await procurementMatchSuppliers(asJsonRequest({ supplierIds: [] }), {
      params: { id: 'req-1' },
    });

    expect(response.status).toBe(400);
  });
});
