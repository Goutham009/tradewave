import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { retryFailedEmails } from '@/lib/email/service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await retryFailedEmails();

    return NextResponse.json({
      success: true,
      processed: result.processed,
      succeeded: result.succeeded,
    });
  } catch (error) {
    console.error('Retry emails error:', error);
    return NextResponse.json(
      { error: 'Failed to retry emails' },
      { status: 500 }
    );
  }
}
