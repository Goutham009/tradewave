import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

// POST /api/auth/register - Universal registration for Buyer, Supplier, or Both
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      companyName,
      phone,
      country,
      region,
      city,
      accountType,   // 'BUYER' | 'SUPPLIER' | 'BOTH'
      source,        // 'BUSINESS_DEVELOPMENT' | 'ORGANIC' | 'REFERRAL' | etc.
      referralCode,  // Optional BD referral code
    } = body;

    // Validation
    if (!name || !email || !companyName || !password) {
      return NextResponse.json(
        { message: 'Name, email, company name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { message: 'Country is required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Determine role from accountType
    const validRoles = ['BUYER', 'SUPPLIER', 'BOTH'] as const;
    const selectedType = accountType?.toUpperCase() || 'BUYER';
    // For 'BOTH', we use BUYER role but track dual intent via source/metadata
    const role = selectedType === 'BOTH' ? 'BUYER' : (validRoles.includes(selectedType) ? selectedType : 'BUYER');

    // Determine source
    const registrationSource = referralCode ? 'BUSINESS_DEVELOPMENT' : (source || 'ORGANIC');

    // Lookup referral code if provided
    let referralData: any = null;
    let autoAssignAM = false;

    if (referralCode) {
      referralData = await (prisma as any).referralCode.findUnique({
        where: { code: referralCode },
      });

      if (referralData && referralData.isActive) {
        // Check expiry
        if (referralData.expiresAt && new Date(referralData.expiresAt) < new Date()) {
          return NextResponse.json(
            { message: 'Referral code has expired' },
            { status: 400 }
          );
        }
        // Check max usages
        if (referralData.maxUsages && referralData.usageCount >= referralData.maxUsages) {
          return NextResponse.json(
            { message: 'Referral code has reached maximum usage' },
            { status: 400 }
          );
        }
        // BD team member referral → auto-assign as AM
        if (referralData.type === 'BD_TEAM_MEMBER') {
          autoAssignAM = true;
        }
      } else if (referralCode) {
        // Invalid referral code - don't block registration, just ignore
        referralData = null;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // For suppliers, status starts as PENDING_VERIFICATION (need email verification + KYB)
    // For buyers, keep existing behavior (ACTIVE immediately)
    const isSupplier = role === 'SUPPLIER' || selectedType === 'BOTH';
    const userStatus = isSupplier ? 'PENDING_VERIFICATION' : 'ACTIVE';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        companyName,
        password: hashedPassword,
        phone,
        country,
        region: region || null,
        city: city || null,
        role: role as any,
        status: userStatus as any,
        source: registrationSource,
        referralCode: referralCode || null,
        referredBy: referralData?.ownerId || null,
        // AM assignment
        accountManagerId: autoAssignAM ? referralData.ownerId : null,
        assignedBy: autoAssignAM ? 'SYSTEM_AUTO_BD' : null,
        assignmentReason: autoAssignAM ? 'BD team member who onboarded' : null,
        assignedAt: autoAssignAM ? new Date() : null,
        // KYB
        kybStatus: isSupplier ? 'PENDING' : null,
        // Supplier fields
        supplierTier: isSupplier ? 'REVIEW' : null,
        verificationLevel: 'NONE',
        acceptingRequirements: false,
        firstLogin: true,
      } as any,
    });

    // Increment referral code usage
    if (referralData) {
      await (prisma as any).referralCode.update({
        where: { id: referralData.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // TODO: Send email verification email
    // TODO: If BD referral, notify the BD/AM member
    // TODO: If organic, notify admin for AM assignment

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          role: user.role,
          status: user.status,
        },
        accountType: selectedType,
        isSupplier,
        hasReferral: !!referralData,
        amAssigned: autoAssignAM,
        amName: autoAssignAM ? referralData?.ownerName : null,
        nextSteps: isSupplier
          ? ['Verify your email', 'Complete KYB verification', 'Wait for admin approval', 'Start receiving requirements']
          : ['Verify your email', 'Complete your profile', 'Start creating requirements'],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
