import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/am/leads/[id]/create-account - AM creates buyer account from lead
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ACCOUNT_MANAGER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      companyName,
      country,
      region,
      role, // BUYER, SUPPLIER, BOTH
      notes,
      sendWelcomeEmail,
    } = body;
    const accountManagerId = session.user.id;

    // Validate required fields
    if (!name || !email || !companyName) {
      return NextResponse.json(
        { error: 'Name, email, and company name are required' },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (
      session.user.role === 'ACCOUNT_MANAGER' &&
      lead.assignedTo &&
      lead.assignedTo !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Generate temporary password
    const year = new Date().getFullYear();
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tempPassword = `TW-${year}-${suffix}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Determine user role
    let userRole: 'BUYER' | 'SUPPLIER' = 'BUYER';
    if (role === 'SUPPLIER') userRole = 'SUPPLIER';

    // Create user account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || lead.phoneNumber,
        password: hashedPassword,
        companyName,
        country: country || null,
        region: region || null,
        role: userRole,
        status: 'ACTIVE',
        source: 'ACCOUNT_MANAGER',
        createdByUserId: accountManagerId,
        accountManagerId,
        firstLogin: true,
      },
    });

    // Update lead to CONVERTED
    await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
        convertedUserId: user.id,
        notes: notes ? `${lead.notes || ''}\n\nConversion Notes: ${notes}`.trim() : lead.notes,
      },
    });

    // TODO: Send welcome email with temporary password if sendWelcomeEmail is true
    // In production, use a proper email service (e.g., SendGrid, Resend)

    return NextResponse.json({
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        country: user.country,
        region: user.region,
        role: user.role,
        accountManagerId: user.accountManagerId,
      },
      tempPassword, // Return to AM so they can share with buyer
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Error creating buyer account:', error);
    return NextResponse.json(
      { error: 'Failed to create buyer account' },
      { status: 500 }
    );
  }
}
