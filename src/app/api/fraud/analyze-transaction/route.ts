import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        supplier: true
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check for existing analysis
    let analysis = await prisma.transactionRiskAnalysis.findUnique({
      where: { transactionId }
    });

    if (analysis) {
      return NextResponse.json({ analysis });
    }

    // Perform fraud analysis
    const buyerId = transaction.buyerId;
    
    // Get buyer's transaction history
    const buyerTransactions = await prisma.transaction.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Check if first transaction
    const isFirstTransaction = buyerTransactions.length === 1;

    // Calculate average transaction amount
    const avgAmount = buyerTransactions.length > 1
      ? buyerTransactions.slice(1).reduce((sum, t) => sum + Number(t.amount), 0) / (buyerTransactions.length - 1)
      : Number(transaction.amount);

    // Check for unusual amount (>3x average)
    const unusualAmount = Number(transaction.amount) > avgAmount * 3;
    const highValueTransaction = Number(transaction.amount) > 10000;

    // Check velocity (multiple transactions in short time)
    const recentTransactions = buyerTransactions.filter(t => {
      const timeDiff = Date.now() - new Date(t.createdAt).getTime();
      return timeDiff < 3600000; // Last hour
    });
    const velocityAnomalyDetected = recentTransactions.length > 5;

    // Check for timing anomaly (unusual hour)
    const hour = new Date(transaction.createdAt).getHours();
    const timingAnomalyDetected = hour >= 2 && hour <= 5;

    // Calculate risk score (0-1)
    let riskScore = 0.3; // Base score
    
    if (isFirstTransaction) riskScore += 0.1;
    if (unusualAmount) riskScore += 0.2;
    if (highValueTransaction) riskScore += 0.1;
    if (velocityAnomalyDetected) riskScore += 0.2;
    if (timingAnomalyDetected) riskScore += 0.1;

    // Cap at 1.0
    riskScore = Math.min(riskScore, 1.0);

    // Determine risk level
    let riskLevel = 'LOW';
    if (riskScore >= 0.7) riskLevel = 'CRITICAL';
    else if (riskScore >= 0.5) riskLevel = 'HIGH';
    else if (riskScore >= 0.3) riskLevel = 'MEDIUM';

    // Determine recommended action
    let recommendedAction = 'ALLOW';
    if (riskScore >= 0.85) recommendedAction = 'DECLINE';
    else if (riskScore >= 0.7) recommendedAction = 'REQUIRE_VERIFICATION';
    else if (riskScore >= 0.5) recommendedAction = 'REVIEW';

    // Create analysis record
    analysis = await prisma.transactionRiskAnalysis.create({
      data: {
        transactionId,
        deviceFingerprintMatch: true,
        velocityAnomalyDetected,
        paymentMethodMismatch: false,
        addressMismatch: false,
        amountAnomalyDetected: unusualAmount,
        timingAnomalyDetected,
        isFirstTransaction,
        newPaymentMethod: isFirstTransaction,
        unusualAmount,
        highValueTransaction,
        riskScore,
        riskLevel,
        recommendedAction,
        analysisDetails: JSON.stringify({
          avgAmount,
          transactionCount: buyerTransactions.length,
          recentTransactionCount: recentTransactions.length,
          hour,
          factors: {
            isFirstTransaction,
            unusualAmount,
            highValueTransaction,
            velocityAnomalyDetected,
            timingAnomalyDetected
          }
        })
      }
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Fraud analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transaction' },
      { status: 500 }
    );
  }
}
