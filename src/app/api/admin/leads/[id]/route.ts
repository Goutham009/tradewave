import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  getDemoLeadByIdPayload,
  isLikelyDemoIdentifier,
  shouldUseDemoFallback,
} from '@/lib/demo/fallback';

// GET /api/admin/leads/[id] - Get lead details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      if (isLikelyDemoIdentifier(params.id, ['lead_demo_', 'lead-'])) {
        return NextResponse.json(getDemoLeadByIdPayload(params.id));
      }

      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);

    if (shouldUseDemoFallback(error)) {
      return NextResponse.json(getDemoLeadByIdPayload(params.id));
    }

    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

// PATCH /api/admin/leads/[id] - Update lead (status, notes, call scheduling, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      status,
      notes,
      callScheduledAt,
      callCompletedAt,
      callNotes,
      callChecklist,
      lastContactedAt,
    } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (callScheduledAt) updateData.callScheduledAt = new Date(callScheduledAt);
    if (callCompletedAt) updateData.callCompletedAt = new Date(callCompletedAt);
    if (callNotes !== undefined) updateData.callNotes = callNotes;
    if (callChecklist) updateData.callChecklist = callChecklist;
    if (lastContactedAt) updateData.lastContactedAt = new Date(lastContactedAt);

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      if (isLikelyDemoIdentifier(params.id, ['lead_demo_', 'lead-'])) {
        const demoLeadPayload = getDemoLeadByIdPayload(params.id);
        return NextResponse.json({
          status: 'success',
          lead: {
            ...demoLeadPayload.lead,
            ...updateData,
            id: params.id,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ status: 'success', lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);

    if (shouldUseDemoFallback(error) && isLikelyDemoIdentifier(params.id, ['lead_demo_', 'lead-'])) {
      return NextResponse.json({
        status: 'success',
        lead: {
          ...getDemoLeadByIdPayload(params.id).lead,
          id: params.id,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
