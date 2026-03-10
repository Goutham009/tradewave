/** @jest-environment node */
import { beforeEach, describe, expect, test, jest } from '@jest/globals';

const mockPrisma = {
  quotation: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  requirement: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  negotiationThread: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  negotiationMessage: {
    create: jest.fn(),
  },
  notification: {
    createMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
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

const { GET: listNegotiations } = require('@/app/api/negotiations/route');
const { POST: buyerStartNegotiation } = require('@/app/api/buyer/negotiations/route');
const {
  GET: getNegotiationThread,
  POST: postNegotiationMessage,
  PATCH: patchNegotiationThread,
} = require('@/app/api/negotiations/[id]/route');

const { getServerSession: mockGetServerSession } = jest.requireMock('next-auth') as {
  getServerSession: {
    mockResolvedValue: (value: any) => void;
  };
};

const mockSession = (value: any) =>
  (mockGetServerSession as {
    mockResolvedValue: (payload: any) => void;
  }).mockResolvedValue(value);

const asGetRequest = (url: string) => ({ url } as any);

const asJsonRequest = (body: any) =>
  ({
    json: async () => body,
  } as any);

const baseThread = {
  id: 'thread-1',
  buyerId: 'buyer-1',
  accountManagerId: 'am-1',
  status: 'ACTIVE',
  quotationsInNegotiation: [] as string[],
  selectedQuotationId: null,
  negotiationPoints: ['PRICE'],
  buyerComments: null,
  buyerTargets: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  lastActivity: new Date('2026-01-01T00:00:00.000Z'),
  requirement: {
    id: 'req-1',
    title: 'Steel Components',
    category: 'Metals',
    quantity: 100,
    unit: 'kg',
    buyerId: 'buyer-1',
    assignedAccountManagerId: 'am-1',
    assignedProcurementOfficerId: 'proc-1',
    buyer: {
      id: 'buyer-1',
      name: 'Buyer User',
      companyName: 'Buyer Corp',
    },
  },
  messages: [],
};

const baseQuotation = {
  id: 'quote-1',
  userId: 'supplier-user-1',
  total: 12000,
  currency: 'USD',
  status: 'IN_NEGOTIATION',
  leadTime: 14,
  deliveryTimeline: 14,
  supplier: {
    id: 'supplier-1',
    companyName: 'Supplier Co',
    location: 'Mumbai',
    email: 'supplier@example.com',
  },
};

describe('Negotiations API integration smoke tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('list negotiations rejects unauthenticated requests', async () => {
    mockSession(null);

    const response = await listNegotiations(asGetRequest('http://localhost/api/negotiations'));

    expect(response.status).toBe(401);
  });

  test('list negotiations rejects unsupported role', async () => {
    mockSession({ user: { id: 'user-1', role: 'GUEST' } });

    const response = await listNegotiations(asGetRequest('http://localhost/api/negotiations'));

    expect(response.status).toBe(403);
  });

  test('list negotiations scopes procurement officer by assigned requirement', async () => {
    mockSession({ user: { id: 'proc-1', role: 'PROCUREMENT_OFFICER' } });
    (mockPrisma.negotiationThread.findMany as any).mockResolvedValue([]);

    const response = await listNegotiations(asGetRequest('http://localhost/api/negotiations'));

    expect(response.status).toBe(200);
    expect(mockPrisma.negotiationThread.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          requirement: {
            assignedProcurementOfficerId: 'proc-1',
          },
        }),
      })
    );
  });

  test('thread detail returns 404 when negotiation does not exist', async () => {
    mockSession({ user: { id: 'buyer-1', role: 'BUYER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue(null);

    const response = await getNegotiationThread(asGetRequest('http://localhost/api/negotiations/thread-1'), {
      params: { id: 'thread-1' },
    });

    expect(response.status).toBe(404);
  });

  test('posting negotiation message validates empty content', async () => {
    mockSession({ user: { id: 'buyer-1', role: 'BUYER' } });

    const response = await postNegotiationMessage(asJsonRequest({ content: '   ' }), {
      params: { id: 'thread-1' },
    });

    expect(response.status).toBe(400);
  });

  test('patch negotiation rejects invalid action', async () => {
    mockSession({ user: { id: 'buyer-1', role: 'BUYER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);

    const response = await patchNegotiationThread(asJsonRequest({ action: 'INVALID_ACTION' }), {
      params: { id: 'thread-1' },
    });

    expect(response.status).toBe(400);
  });

  test('thread detail denies access for non-participants', async () => {
    mockSession({ user: { id: 'buyer-2', role: 'BUYER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);

    const response = await getNegotiationThread(asGetRequest('http://localhost/api/negotiations/thread-1'), {
      params: { id: 'thread-1' },
    });

    expect(response.status).toBe(403);
  });

  test('posting negotiation message succeeds for participant', async () => {
    mockSession({ user: { id: 'buyer-1', role: 'BUYER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);
    (mockPrisma.$transaction as any).mockImplementation(async (callback: any) =>
      callback({
        negotiationMessage: {
          create: async () =>
            ({
              id: 'msg-1',
              senderId: 'buyer-1',
              senderRole: 'BUYER',
              messageType: 'TEXT',
              content: 'Please improve delivery timeline.',
              metadata: null,
              createdAt: new Date('2026-01-02T00:00:00.000Z'),
            } as any),
        },
        negotiationThread: {
          update: async () => ({ id: 'thread-1' } as any),
        },
      })
    );
    (mockPrisma.notification.createMany as any).mockResolvedValue({ count: 1 });

    const response = await postNegotiationMessage(
      asJsonRequest({ content: 'Please improve delivery timeline.', messageType: 'TEXT' }),
      {
        params: { id: 'thread-1' },
      }
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.status).toBe('success');
    expect(payload.message.content).toBe('Please improve delivery timeline.');
  });

  test('patch negotiation rejects selecting quotation outside thread', async () => {
    mockSession({ user: { id: 'buyer-1', role: 'BUYER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);

    const response = await patchNegotiationThread(
      asJsonRequest({ action: 'SELECT_QUOTATION', selectedQuotationId: 'quote-2' }),
      {
        params: { id: 'thread-1' },
      }
    );

    expect(response.status).toBe(400);
  });

  test('patch negotiation updates status for account manager participant', async () => {
    mockSession({ user: { id: 'am-1', role: 'ACCOUNT_MANAGER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);
    (mockPrisma.negotiationThread.update as any).mockResolvedValue({
      id: 'thread-1',
      status: 'COMPLETED',
      selectedQuotationId: null,
      lastActivity: new Date('2026-01-03T00:00:00.000Z'),
    });

    const response = await patchNegotiationThread(
      asJsonRequest({ action: 'SET_STATUS', status: 'COMPLETED' }),
      {
        params: { id: 'thread-1' },
      }
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.status).toBe('success');
    expect(payload.thread.status).toBe('COMPLETED');
  });

  test('patch negotiation updates status for assigned procurement officer participant', async () => {
    mockSession({ user: { id: 'proc-1', role: 'PROCUREMENT_OFFICER' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);
    (mockPrisma.negotiationThread.update as any).mockResolvedValue({
      id: 'thread-1',
      status: 'ACTIVE',
      selectedQuotationId: null,
      lastActivity: new Date('2026-01-03T00:00:00.000Z'),
    });

    const response = await patchNegotiationThread(
      asJsonRequest({ action: 'SET_STATUS', status: 'ACTIVE' }),
      {
        params: { id: 'thread-1' },
      }
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.status).toBe('success');
    expect(payload.thread.status).toBe('ACTIVE');
  });

  test('buyer negotiation start rejects quotation ids not valid for requirement', async () => {
    mockSession({ user: { id: 'buyer-1', role: 'BUYER' } });
    (mockPrisma.requirement.findUnique as any).mockResolvedValue({
      assignedAccountManagerId: 'am-1',
      buyerId: 'buyer-1',
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([
      {
        id: 'quote-1',
        userId: 'supplier-user-1',
        supplierId: 'supplier-1',
      },
    ]);

    const response = await buyerStartNegotiation(
      asJsonRequest({
        requirementId: 'req-1',
        quotationIds: ['quote-1', 'quote-2'],
      })
    );

    expect(response.status).toBe(400);
  });

  test('supplier participant can post message when mapped by supplier email', async () => {
    mockSession({ user: { id: 'supplier-user-2', role: 'SUPPLIER', email: 'supplier@example.com' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([
      {
        ...baseQuotation,
        userId: null,
      },
    ]);
    (mockPrisma.$transaction as any).mockImplementation(async (callback: any) =>
      callback({
        negotiationMessage: {
          create: async () =>
            ({
              id: 'msg-2',
              senderId: 'supplier-user-2',
              senderRole: 'SUPPLIER',
              messageType: 'TEXT',
              content: 'We can offer improved shipping timeline.',
              metadata: null,
              createdAt: new Date('2026-01-03T00:00:00.000Z'),
            } as any),
        },
        negotiationThread: {
          update: async () => ({ id: 'thread-1' } as any),
        },
      })
    );
    (mockPrisma.user.findMany as any).mockResolvedValue([{ id: 'supplier-user-2' }]);
    (mockPrisma.notification.createMany as any).mockResolvedValue({ count: 1 });

    const response = await postNegotiationMessage(
      asJsonRequest({ content: 'We can offer improved shipping timeline.', messageType: 'TEXT' }),
      { params: { id: 'thread-1' } }
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.status).toBe('success');
    expect(payload.message.senderRole).toBe('SUPPLIER');
  });

  test('supplier outside negotiation is denied from posting message', async () => {
    mockSession({ user: { id: 'supplier-user-3', role: 'SUPPLIER', email: 'other-supplier@example.com' } });
    (mockPrisma.negotiationThread.findUnique as any).mockResolvedValue({
      ...baseThread,
      quotationsInNegotiation: ['quote-1'],
    });
    (mockPrisma.quotation.findMany as any).mockResolvedValue([baseQuotation]);

    const response = await postNegotiationMessage(
      asJsonRequest({ content: 'I should not be able to post.', messageType: 'TEXT' }),
      { params: { id: 'thread-1' } }
    );

    expect(response.status).toBe(403);
  });

  test('supplier cannot update negotiation status', async () => {
    mockSession({ user: { id: 'supplier-user-1', role: 'SUPPLIER', email: 'supplier@example.com' } });

    const response = await patchNegotiationThread(
      asJsonRequest({ action: 'SET_STATUS', status: 'COMPLETED' }),
      { params: { id: 'thread-1' } }
    );

    expect(response.status).toBe(403);
  });
});
