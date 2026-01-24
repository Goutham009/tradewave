import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendQuoteExpiringEmail } from '@/lib/email/triggers';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const now = new Date();

    const expiringQuotes = await prisma.quotation.findMany({
      where: {
        status: 'PENDING',
        validUntil: { gte: now, lte: tomorrow },
      },
      select: { id: true },
    });

    const results = [];
    for (const quote of expiringQuotes) {
      try {
        const result = await sendQuoteExpiringEmail(quote.id);
        results.push({ id: quote.id, success: result.success });
      } catch (error) {
        results.push({ id: quote.id, success: false, error: String(error) });
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
