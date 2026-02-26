import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { leadCaptureFormSchema } from '@/lib/validations/leadSchema';

// POST /api/leads - Create a new lead from enquiry form (single consolidated endpoint)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate with Zod schema
    const validatedData = leadCaptureFormSchema.parse(body);

    // Check if lead with this email already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: validatedData.email },
    });

    if (existingLead) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'A requirement with this email already exists. Our team will contact you shortly.',
          type: 'EMAIL_EXISTS',
        },
        { status: 409 }
      );
    }

    // Check if user account already exists (redirect to login)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'An account with this email already exists. Please login to create a requirement.',
          type: 'USER_EXISTS',
          redirectTo: '/login',
        },
        { status: 400 }
      );
    }

    // Calculate lead score based on completeness
    let leadScore = 'MEDIUM';
    const hasPhone = !!validatedData.phoneNumber;
    const hasCompany = !!validatedData.companyName;
    const hasAdditionalReqs = !!validatedData.additionalReqs;
    const completenessCount = [hasPhone, hasCompany, hasAdditionalReqs].filter(Boolean).length;
    if (completenessCount >= 3) leadScore = 'HIGH';
    else if (completenessCount <= 1) leadScore = 'LOW';

    const lead = await prisma.lead.create({
      data: {
        email: validatedData.email,
        fullName: validatedData.fullName,
        companyName: validatedData.companyName,
        phoneNumber: validatedData.phoneNumber,
        category: validatedData.category,
        productName: validatedData.productName,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        location: validatedData.location,
        timeline: validatedData.timeline,
        additionalReqs: validatedData.additionalReqs || null,
        source: 'LANDING_PAGE_FORM',
        leadScore,
        status: 'NEW_LEAD',
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Requirement created! Our team will contact you within 24 hours.',
        leadId: lead.id,
        nextSteps: 'Please keep your phone nearby. Our sales representative will call you shortly.',
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Please check the form for errors',
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating lead:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create enquiry. Please try again.' },
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
