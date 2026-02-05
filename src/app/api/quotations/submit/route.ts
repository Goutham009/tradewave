import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      invitationId,
      requirementId,
      unitPrice,
      totalPrice,
      deliveryTime,
      paymentTerms,
      specifications,
      notes,
    } = await request.json();

    if (!invitationId || !requirementId || !unitPrice || !deliveryTime || !paymentTerms) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const supplierId = session.user?.id || 'supplier-001';

    // In production, this would:
    // 1. Create quotation in database
    // 2. Update invitation status to RESPONDED
    // 3. Notify procurement team
    // 4. Delete any existing draft

    const quotation = {
      id: `quote-${Date.now()}`,
      invitationId,
      requirementId,
      supplierId,
      unitPrice: parseFloat(unitPrice),
      totalPrice: parseFloat(totalPrice),
      deliveryTime: parseInt(deliveryTime),
      paymentTerms,
      specifications: specifications || '',
      notes: notes || '',
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Quotation submitted successfully',
      quotation,
    });
  } catch (error) {
    console.error('Submit quotation error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quotation' },
      { status: 500 }
    );
  }
}
