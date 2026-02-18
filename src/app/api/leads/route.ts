import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/leads - Create a new lead from enquiry form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      fullName,
      companyName,
      phoneNumber,
      category,
      productName,
      quantity,
      unit,
      location,
      timeline,
      targetPrice,
      additionalReqs,
    } = body;

    // Validate required fields
    if (!email || !fullName || !companyName || !phoneNumber || !category || !productName || !quantity || !unit || !location || !timeline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if lead with this email already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'An enquiry with this email already exists. Our team will contact you soon.' },
        { status: 409 }
      );
    }

    // Calculate lead score based on completeness
    let leadScore = 'MEDIUM';
    const hasPhone = !!phoneNumber;
    const hasCompany = !!companyName;
    const hasTargetPrice = !!targetPrice;
    const hasAdditionalReqs = !!additionalReqs;
    const completenessCount = [hasPhone, hasCompany, hasTargetPrice, hasAdditionalReqs].filter(Boolean).length;
    if (completenessCount >= 3) leadScore = 'HIGH';
    else if (completenessCount <= 1) leadScore = 'LOW';

    const lead = await prisma.lead.create({
      data: {
        email,
        fullName,
        companyName,
        phoneNumber,
        category,
        productName,
        quantity: parseInt(quantity),
        unit,
        location,
        timeline,
        targetPrice: targetPrice || null,
        additionalReqs: additionalReqs || null,
        source: 'LANDING_PAGE_FORM',
        leadScore,
        status: 'NEW_LEAD',
      },
    });

    // TODO: Send confirmation email to buyer
    // TODO: Send notification to admin dashboard

    return NextResponse.json(
      {
        status: 'success',
        data: {
          id: lead.id,
          email: lead.email,
          fullName: lead.fullName,
          companyName: lead.companyName,
          phoneNumber: lead.phoneNumber,
          requirement: {
            category: lead.category,
            productName: lead.productName,
            quantity: lead.quantity,
            unit: lead.unit,
            location: lead.location,
            timeline: lead.timeline,
          },
          createdAt: lead.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create enquiry. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/leads - List leads (admin/AM only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
