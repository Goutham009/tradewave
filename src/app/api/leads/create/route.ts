import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { leadCaptureFormSchema } from '@/lib/validations/leadSchema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validatedData = leadCaptureFormSchema.parse(body);
    
    // Check if email already exists in Lead table
    const existingLead = await prisma.lead.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingLead) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'A requirement with this email already exists. Our team will contact you shortly.',
          type: 'EMAIL_EXISTS'
        },
        { status: 400 }
      );
    }
    
    // Check if user account already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'An account with this email already exists. Please login to create a requirement.',
          type: 'USER_EXISTS',
          redirectTo: '/login'
        },
        { status: 400 }
      );
    }
    
    // Create lead record
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
        status: 'NEW_LEAD'
      }
    });
    
    // TODO: Send email to sales team
    // await sendEmailToSalesTeam({ ... });
    
    // TODO: Send confirmation email to user
    // await sendConfirmationEmail({ ... });
    
    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Requirement created! Our team will contact you within 24 hours.',
      leadId: lead.id,
      nextSteps: 'Please keep your phone nearby. Our sales representative will call you shortly.',
      data: {
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
          timeline: lead.timeline
        },
        createdAt: lead.createdAt
      }
    });
    
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Please check the form for errors',
          errors: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }
    
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create requirement. Please try again.' },
      { status: 500 }
    );
  }
}
