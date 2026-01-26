import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Get or create fraud score
    let fraudScore = await prisma.fraudScore.findUnique({
      where: { userId }
    });

    if (!fraudScore) {
      // Calculate initial fraud score
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          buyerTransactions: {
            include: { riskAnalysis: true }
          }
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Calculate component scores
      const transactions = user.buyerTransactions || [];
      
      // Payment fraud score based on failed payments
      const failedPayments = transactions.filter(t => t.paymentStatus === 'FAILED').length;
      const paymentFraudScore = Math.min(0.3 + (failedPayments * 0.1), 1);

      // Transaction fraud score based on risk analyses
      const highRiskTransactions = transactions.filter(
        t => t.riskAnalysis && Number(t.riskAnalysis.riskScore) >= 0.7
      ).length;
      const transactionFraudScore = Math.min(0.3 + (highRiskTransactions * 0.15), 1);

      // Identity fraud score (placeholder - would check KYB status)
      const identityFraudScore = 0.3;

      // Behavioral fraud score
      const behavioralFraudScore = 0.3;

      // Overall score
      const overallFraudScore = (
        paymentFraudScore * 0.3 +
        transactionFraudScore * 0.3 +
        identityFraudScore * 0.2 +
        behavioralFraudScore * 0.2
      );

      // Determine risk level
      let riskLevel = 'LOW';
      if (overallFraudScore >= 0.7) riskLevel = 'CRITICAL';
      else if (overallFraudScore >= 0.5) riskLevel = 'HIGH';
      else if (overallFraudScore >= 0.3) riskLevel = 'MEDIUM';

      // Determine fraud indicators
      const fraudIndicators: string[] = [];
      if (paymentFraudScore >= 0.5) fraudIndicators.push('HIGH_PAYMENT_FAILURE_RATE');
      if (transactionFraudScore >= 0.5) fraudIndicators.push('RISKY_TRANSACTION_HISTORY');
      if (failedPayments > 3) fraudIndicators.push('MULTIPLE_FAILED_PAYMENTS');

      fraudScore = await prisma.fraudScore.create({
        data: {
          userId,
          overallFraudScore,
          paymentFraudScore,
          identityFraudScore,
          transactionFraudScore,
          behavioralFraudScore,
          riskLevel,
          fraudIndicators,
          isFlaggedForReview: overallFraudScore >= 0.7
        }
      });
    }

    return NextResponse.json({ fraudScore });
  } catch (error) {
    console.error('Get user fraud risk error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud risk' },
      { status: 500 }
    );
  }
}
