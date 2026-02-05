import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const draftId = params.id;

    // In production, delete from database
    // await prisma.quotationDraft.delete({ where: { id: draftId } });

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
      deletedId: draftId,
    });
  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
