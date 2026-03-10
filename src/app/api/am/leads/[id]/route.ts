import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatAccountReference } from '@/lib/flow-references';

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function parseQuantity(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
}

async function fetchLeadForSession(leadId: string, userId: string, role?: string | null) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    return { error: NextResponse.json({ error: 'Lead not found' }, { status: 404 }) };
  }

  const isAdmin = role === 'ADMIN';
  const isAccountManager = role === 'ACCOUNT_MANAGER';
  if (!isAdmin && !isAccountManager) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  if (isAccountManager && lead.assignedTo !== userId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { lead };
}

// GET /api/am/leads/[id] - Lead details for AM/admin
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await fetchLeadForSession(params.id, session.user.id, session.user.role);
    if (result.error) {
      return result.error;
    }

    let convertedUser = null;
    if (result.lead?.convertedUserId) {
      const convertedUserRecord = await prisma.user.findUnique({
        where: { id: result.lead.convertedUserId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          accountManagerId: true,
          createdAt: true,
        },
      });

      convertedUser = convertedUserRecord
        ? {
            ...convertedUserRecord,
            accountNumber: formatAccountReference(convertedUserRecord.id),
          }
        : null;
    }

    return NextResponse.json({
      lead: result.lead,
      convertedUser,
    });
  } catch (error) {
    console.error('Error fetching AM lead detail:', error);
    return NextResponse.json({ error: 'Failed to fetch lead details' }, { status: 500 });
  }
}

// PATCH /api/am/leads/[id] - Update assigned lead details/status from AM panel
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await fetchLeadForSession(params.id, session.user.id, session.user.role);
    if (result.error) {
      return result.error;
    }

    const body = await req.json();
    const quantity = parseQuantity(body.quantity);

    if (body.quantity !== undefined && quantity === null) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    const requiredStringFields = [
      'fullName',
      'companyName',
      'phoneNumber',
      'category',
      'productName',
      'unit',
      'location',
      'timeline',
    ] as const;

    for (const field of requiredStringFields) {
      if (body[field] !== undefined) {
        updateData[field] = String(body[field]);
      }
    }

    const nullableStringFields = [
      'additionalReqs',
      'notes',
      'callNotes',
    ] as const;

    for (const field of nullableStringFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] || null;
      }
    }

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.callChecklist !== undefined) {
      updateData.callChecklist = body.callChecklist;
    }

    if (body.callScheduledAt !== undefined) {
      updateData.callScheduledAt = toDate(body.callScheduledAt);
    }

    if (body.callCompletedAt !== undefined) {
      updateData.callCompletedAt = toDate(body.callCompletedAt);
    }

    if (body.lastContactedAt !== undefined) {
      updateData.lastContactedAt = toDate(body.lastContactedAt);
    }

    if (quantity !== null) {
      updateData.quantity = quantity;
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      status: 'success',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating AM lead detail:', error);
    return NextResponse.json({ error: 'Failed to update lead details' }, { status: 500 });
  }
}
