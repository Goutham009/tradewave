import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requirementId = params.id;

    // In production, this would fetch the timeline from the database
    // Mock response for demo
    const timeline = [
      {
        id: 'tl-001',
        status: 'SUBMITTED',
        note: 'Requirement submitted by buyer',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: null,
      },
      {
        id: 'tl-002',
        status: 'PENDING_VERIFICATION',
        note: 'Assigned to account manager for verification',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        updatedBy: {
          id: 'system',
          name: 'System',
          role: 'Automated',
        },
      },
      {
        id: 'tl-003',
        status: 'VERIFIED',
        note: 'Buyer consultation completed. Requirements confirmed.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: {
          id: 'am-001',
          name: 'Sarah Johnson',
          role: 'Account Manager',
        },
      },
      {
        id: 'tl-004',
        status: 'SUPPLIER_SELECTION',
        note: 'Sent to procurement team for supplier selection',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        updatedBy: {
          id: 'am-001',
          name: 'Sarah Johnson',
          role: 'Account Manager',
        },
      },
      {
        id: 'tl-005',
        status: 'AWAITING_QUOTES',
        note: 'Quotation requests sent to 8 suppliers',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: {
          id: 'proc-001',
          name: 'David Chen',
          role: 'Procurement Team',
        },
      },
      {
        id: 'tl-006',
        status: 'QUOTATIONS_RECEIVED',
        note: '6 quotations received from suppliers',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: {
          id: 'system',
          name: 'System',
          role: 'Automated',
        },
      },
    ];

    return NextResponse.json({
      requirementId,
      currentStatus: 'QUOTATIONS_RECEIVED',
      timeline,
    });
  } catch (error) {
    console.error('Timeline fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
