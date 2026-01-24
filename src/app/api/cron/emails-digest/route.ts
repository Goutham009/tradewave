import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendWeeklyDigestEmail } from '@/lib/email/triggers';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersWithDigest = await prisma.emailPreference.findMany({
      where: { weeklyDigest: true, unsubscribedAt: null },
      select: { userId: true },
    });

    const results = [];
    for (const pref of usersWithDigest) {
      try {
        const result = await sendWeeklyDigestEmail(pref.userId);
        results.push({ userId: pref.userId, success: result.success });
      } catch (error) {
        results.push({ userId: pref.userId, success: false, error: String(error) });
      }
    }

    return NextResponse.json({
      processed: results.length,
      succeeded: results.filter(r => r.success).length,
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
