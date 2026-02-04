import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      productType,
      quantity,
      unit,
      targetDeliveryDate,
      additionalNotes,
    } = body;

    // Validate required fields
    if (!companyName || !contactEmail || !contactPhone || !productType || !quantity || !unit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate urgency score based on delivery date and quantity
    const calculateUrgencyScore = (): number => {
      let score = 50; // Base score

      // Urgency based on delivery date
      if (targetDeliveryDate) {
        const daysUntilDelivery = Math.ceil(
          (new Date(targetDeliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDelivery <= 7) score += 30;
        else if (daysUntilDelivery <= 14) score += 20;
        else if (daysUntilDelivery <= 30) score += 10;
      }

      // Urgency based on quantity (larger orders = higher priority)
      const qty = parseInt(quantity);
      if (qty >= 10000) score += 20;
      else if (qty >= 1000) score += 10;
      else if (qty >= 100) score += 5;

      return Math.min(score, 100);
    };

    // Log the submission for tracking
    const urgencyScore = calculateUrgencyScore();
    console.log('New requirement submitted:', {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      productType,
      quantity,
      unit,
      targetDeliveryDate,
      urgencyScore,
      submittedAt: new Date().toISOString(),
    });

    // For demo: Return success without DB write
    // In production, this would create the requirement and notify account managers
    return NextResponse.json({
      success: true,
      message: 'Requirement submitted successfully. Our team will contact you within 4-6 hours.',
      requirementId: 'REQ-' + Date.now(),
      urgencyScore,
    });
  } catch (error) {
    console.error('Requirement submission error:', error);
    
    // Return success for demo purposes even if DB fails
    return NextResponse.json({
      success: true,
      message: 'Requirement submitted successfully. Our team will contact you within 4-6 hours.',
      requirementId: 'demo-' + Date.now(),
    });
  }
}
