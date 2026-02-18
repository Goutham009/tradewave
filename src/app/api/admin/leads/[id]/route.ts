import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/leads/[id] - Get lead details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

// PATCH /api/admin/leads/[id] - Update lead (status, notes, call scheduling, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (callScheduledAt) updateData.callScheduledAt = new Date(callScheduledAt);
    if (callCompletedAt) updateData.callCompletedAt = new Date(callCompletedAt);
    if (callNotes !== undefined) updateData.callNotes = callNotes;
    if (callChecklist) updateData.callChecklist = callChecklist;
    if (lastContactedAt) updateData.lastContactedAt = new Date(lastContactedAt);

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ status: 'success', lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
