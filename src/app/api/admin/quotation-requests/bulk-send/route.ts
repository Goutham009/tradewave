import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'PROCUREMENT_TEAM'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requirementId, supplierIds } = await request.json();

    if (!requirementId || !supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json(
        { error: 'requirementId and supplierIds array are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Fetch the requirement details from the database
    // 2. Create quotation invitations for each supplier
    // 3. Send email notifications to each supplier
    // 4. Update the requirement status

    // Mock response for demo
    const invitations = supplierIds.map((supplierId: string, index: number) => ({
      id: `inv-${Date.now()}-${index}`,
      requirementId,
      supplierId,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: `Quotation requests sent to ${supplierIds.length} suppliers`,
      invitations,
    });
  } catch (error) {
    console.error('Bulk quotation request error:', error);
    return NextResponse.json(
      { error: 'Failed to send quotation requests' },
      { status: 500 }
    );
  }
}
