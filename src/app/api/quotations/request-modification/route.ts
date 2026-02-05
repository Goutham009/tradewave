import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      quotationId,
      modificationType,
      targetPrice,
      targetDeliveryTime,
      additionalRequirements,
      notes,
    } = await request.json();

    if (!quotationId || !modificationType || !notes) {
      return NextResponse.json(
        { error: 'quotationId, modificationType, and notes are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Create a modification request in the database
    // 2. Notify the procurement team via email
    // 3. Update the quotation status

    // Mock response for demo
    const modificationRequest = {
      id: `mod-${Date.now()}`,
      quotationId,
      buyerId: session.user?.id || 'buyer-001',
      modificationType,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      targetDeliveryTime: targetDeliveryTime ? parseInt(targetDeliveryTime) : null,
      additionalRequirements,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Modification request submitted successfully',
      modificationRequest,
    });
  } catch (error) {
    console.error('Modification request error:', error);
    return NextResponse.json(
      { error: 'Failed to create modification request' },
      { status: 500 }
    );
  }
}
