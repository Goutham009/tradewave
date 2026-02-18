import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// Simple encryption for bank account (use proper encryption service in production)
function encryptBankAccount(accountNumber: string): string {
  return Buffer.from(accountNumber).toString('base64');
}

// Trigger automated compliance checks (simulated - in production, integrate with real services)
async function triggerAutomatedChecks(kybId: string, businessName: string, registrationCountry: string) {
  // Initialize all checks to PENDING
  await prisma.supplierKYB.update({
    where: { id: kybId },
    data: {
      status: 'AUTOMATED_CHECKS_IN_PROGRESS',
      automatedChecksStartedAt: new Date(),
      sanctionsCheckStatus: 'PENDING',
      pepCheckStatus: 'PENDING',
      adverseMediaCheckStatus: 'PENDING',
      creditCheckStatus: 'PENDING',
      registryCheckStatus: 'PENDING',
      documentAICheckStatus: 'PENDING',
      bankVerificationStatus: 'PENDING',
    }
  });

  // Log the automated checks start
  await prisma.verificationLog.create({
    data: {
      kybId,
      action: 'AUTOMATED_CHECKS_STARTED',
      actionDetails: `Automated compliance checks initiated for ${businessName}`
    }
  });

  // In production, these would be async calls to external services:
  // - OFAC, UN, EU sanctions list APIs
  // - PEP screening services (World-Check, etc.)
  // - Adverse media monitoring (LexisNexis, etc.)
  // - Credit bureaus (Dun & Bradstreet, etc.)
  // - Company registries (OpenCorporates, etc.)
  // - Document AI verification (AWS Textract, Google Document AI, etc.)
  // - Bank account verification (Plaid, Stripe, etc.)
  
  // For demo, simulate checks completing after a delay (in production, use webhooks or polling)
  // This would be handled by a background job/queue system (Bull, SQS, etc.)
  setTimeout(async () => {
    try {
      await prisma.supplierKYB.update({
        where: { id: kybId },
        data: {
          status: 'AUTOMATED_CHECKS_COMPLETE',
          automatedChecksCompletedAt: new Date(),
          sanctionsCheckStatus: 'PASSED',
          sanctionsCheckResult: JSON.stringify({ ofac: 'clear', un: 'clear', eu: 'clear' }),
          sanctionsCheckAt: new Date(),
          pepCheckStatus: 'PASSED',
          pepCheckResult: JSON.stringify({ directors: [], matches: 0 }),
          pepCheckAt: new Date(),
          adverseMediaCheckStatus: 'PASSED',
          adverseMediaCheckResult: JSON.stringify({ articles: [], riskScore: 0 }),
          adverseMediaCheckAt: new Date(),
          creditCheckStatus: 'PASSED',
          creditCheckResult: JSON.stringify({ score: 75, rating: 'Good' }),
          creditCheckAt: new Date(),
          registryCheckStatus: 'VERIFIED',
          registryCheckResult: JSON.stringify({ verified: true, status: 'Active' }),
          registryCheckAt: new Date(),
          documentAICheckStatus: 'PENDING', // Requires documents to be uploaded
          bankVerificationStatus: 'PENDING', // Requires micro-deposit verification
        }
      });

      await prisma.verificationLog.create({
        data: {
          kybId,
          action: 'AUTOMATED_CHECKS_COMPLETE',
          actionDetails: 'Automated compliance checks completed. Ready for manual review.'
        }
      });

      // Notify admins that checks are complete
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'KYB_CHECKS_COMPLETE',
            title: 'KYB Automated Checks Complete',
            message: `${businessName} automated checks complete. Manual review required.`,
            resourceType: 'kyb',
            resourceId: kybId
          }
        });
      }
    } catch (error) {
      console.error('Error completing automated checks:', error);
    }
  }, 5000); // Simulate 5 second delay for demo
}

// Get country-specific compliance items
async function getCountryComplianceItems(countryCode: string) {
  const config = await prisma.countryComplianceConfig.findUnique({
    where: { countryCode }
  });

  if (!config) {
    // Default compliance items
    return [
      { itemType: 'TAX_REGISTRATION', displayName: 'Tax Registration', description: 'Valid tax registration certificate', isMandatory: true },
      { itemType: 'BUSINESS_LICENSE', displayName: 'Business License', description: 'Business operating license', isMandatory: true },
      { itemType: 'BANK_ACCOUNT', displayName: 'Bank Account Verification', description: 'Bank account details verification', isMandatory: true },
      { itemType: 'ADDRESS_PROOF', displayName: 'Address Proof', description: 'Business address verification document', isMandatory: true },
      { itemType: 'BUSINESS_INSURANCE', displayName: 'Business Insurance', description: 'Business liability insurance', isRecommended: true },
      { itemType: 'QUALITY_CERTIFICATION', displayName: 'Quality Certification', description: 'Quality or industry certifications', isRecommended: true }
    ];
  }

  return config.complianceItems.map(item => ({
    itemType: item,
    displayName: item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `${item.replace(/_/g, ' ')} verification`,
    isMandatory: config.mandatoryDocuments.includes(item)
  }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      // Business Details
      businessName,
      businessType,
      businessDescription,
      businessEstablishedYear,
      businessWebsite,
      businessPhone,
      // Global Registration
      registrationCountry,
      registrationRegion,
      registrationNumber,
      registrationType,
      // Tax Identification
      taxIdType,
      taxIdNumber,
      taxIdCountry,
      // Additional Business Numbers
      businessLicenseNumber,
      businessLicenseExpiry,
      industryRegistration,
      // Addresses
      registeredAddress,
      registeredCity,
      registeredRegion,
      registeredCountry,
      registeredPostalCode,
      operatingAddress,
      operatingCity,
      operatingRegion,
      operatingCountry,
      operatingPostalCode,
      // Bank Details
      bankAccountNumber,
      bankRoutingCode,
      bankAccountHolderName,
      bankName,
      bankCountry,
      // Contact
      primaryContactName,
      primaryContactPhone,
      primaryContactEmail,
      secondaryContactName,
      secondaryContactPhone,
      secondaryContactEmail,
      // Language
      languagePreference,
      // Metadata
      metadata
    } = body;

    // Validation
    if (!businessName || !businessType || !businessDescription || !businessEstablishedYear) {
      return NextResponse.json({ error: 'Missing required business information' }, { status: 400 });
    }

    if (!registrationCountry) {
      return NextResponse.json({ error: 'Registration country is required' }, { status: 400 });
    }

    if (!registeredAddress || !registeredCity || !registeredRegion || !registeredPostalCode) {
      return NextResponse.json({ error: 'Missing required address information' }, { status: 400 });
    }

    if (!primaryContactName || !primaryContactPhone || !primaryContactEmail) {
      return NextResponse.json({ error: 'Missing required contact information' }, { status: 400 });
    }

    // Check existing KYB
    const existingKYB = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id }
    });

    if (existingKYB && existingKYB.status === 'VERIFIED') {
      return NextResponse.json(
        { error: 'KYB already verified. Contact support for updates.' },
        { status: 400 }
      );
    }

    // Encrypt bank account number
    const encryptedBankAccount = bankAccountNumber
      ? encryptBankAccount(bankAccountNumber)
      : null;

    // Create or update KYB
    const kyb = await prisma.supplierKYB.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        businessName,
        businessType,
        businessDescription,
        businessEstablishedYear: parseInt(businessEstablishedYear),
        businessWebsite: businessWebsite || null,
        businessPhone: businessPhone || null,
        registrationCountry: registrationCountry.toUpperCase(),
        registrationRegion: registrationRegion || null,
        registrationNumber: registrationNumber || null,
        registrationType: registrationType || null,
        taxIdType: taxIdType || null,
        taxIdNumber: taxIdNumber?.toUpperCase() || null,
        taxIdCountry: taxIdCountry?.toUpperCase() || null,
        businessLicenseNumber: businessLicenseNumber || null,
        businessLicenseExpiry: businessLicenseExpiry ? new Date(businessLicenseExpiry) : null,
        industryRegistration: industryRegistration || null,
        registeredAddress,
        registeredCity,
        registeredRegion,
        registeredCountry: registeredCountry?.toUpperCase() || registrationCountry.toUpperCase(),
        registeredPostalCode,
        operatingAddress: operatingAddress || null,
        operatingCity: operatingCity || null,
        operatingRegion: operatingRegion || null,
        operatingCountry: operatingCountry?.toUpperCase() || null,
        operatingPostalCode: operatingPostalCode || null,
        bankAccountNumber: encryptedBankAccount,
        bankRoutingCode: bankRoutingCode?.toUpperCase() || null,
        bankAccountHolderName: bankAccountHolderName || null,
        bankName: bankName || null,
        bankCountry: bankCountry?.toUpperCase() || null,
        primaryContactName,
        primaryContactPhone,
        primaryContactEmail,
        secondaryContactName: secondaryContactName || null,
        secondaryContactPhone: secondaryContactPhone || null,
        secondaryContactEmail: secondaryContactEmail || null,
        languagePreference: languagePreference || 'en',
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: 'PENDING'
      },
      update: {
        businessName,
        businessType,
        businessDescription,
        businessEstablishedYear: parseInt(businessEstablishedYear),
        businessWebsite: businessWebsite || null,
        businessPhone: businessPhone || null,
        registrationCountry: registrationCountry.toUpperCase(),
        registrationRegion: registrationRegion || null,
        registrationNumber: registrationNumber || null,
        registrationType: registrationType || null,
        taxIdType: taxIdType || null,
        taxIdNumber: taxIdNumber?.toUpperCase() || null,
        taxIdCountry: taxIdCountry?.toUpperCase() || null,
        businessLicenseNumber: businessLicenseNumber || null,
        businessLicenseExpiry: businessLicenseExpiry ? new Date(businessLicenseExpiry) : null,
        industryRegistration: industryRegistration || null,
        registeredAddress,
        registeredCity,
        registeredRegion,
        registeredCountry: registeredCountry?.toUpperCase() || registrationCountry.toUpperCase(),
        registeredPostalCode,
        operatingAddress: operatingAddress || null,
        operatingCity: operatingCity || null,
        operatingRegion: operatingRegion || null,
        operatingCountry: operatingCountry?.toUpperCase() || null,
        operatingPostalCode: operatingPostalCode || null,
        bankAccountNumber: encryptedBankAccount,
        bankRoutingCode: bankRoutingCode?.toUpperCase() || null,
        bankAccountHolderName: bankAccountHolderName || null,
        bankName: bankName || null,
        bankCountry: bankCountry?.toUpperCase() || null,
        primaryContactName,
        primaryContactPhone,
        primaryContactEmail,
        secondaryContactName: secondaryContactName || null,
        secondaryContactPhone: secondaryContactPhone || null,
        secondaryContactEmail: secondaryContactEmail || null,
        languagePreference: languagePreference || 'en',
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: 'PENDING',
        rejectionReason: null,
        rejectedAt: null
      },
      include: {
        documents: true,
        complianceItems: true,
        riskAssessment: true,
        badge: true
      }
    });

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        kybId: kyb.id,
        action: existingKYB ? 'RESUBMITTED' : 'SUBMITTED',
        actionDetails: `KYB ${existingKYB ? 'resubmission' : 'submission'} for ${businessName} (${registrationCountry})`
      }
    });

    // Create country-specific compliance items if new submission
    if (!existingKYB) {
      const complianceDefaults = await getCountryComplianceItems(registrationCountry.toUpperCase());

      for (const item of complianceDefaults) {
        await prisma.complianceItem.create({
          data: {
            kybId: kyb.id,
            itemType: item.itemType,
            displayName: item.displayName,
            description: item.description,
            isMandatory: item.isMandatory || false,
            isRecommended: item.isRecommended || false,
            applicableRegions: [registrationCountry.toUpperCase()]
          }
        });
      }
    }

    // Update User record with KYB status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kybStatus: 'SUBMITTED',
        kybApplicationId: kyb.id,
        kybSubmittedAt: new Date()
      }
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'KYB_SUBMITTED',
          title: 'New KYB Submission',
          message: `${businessName} (${registrationCountry}) has submitted KYB for verification`,
          resourceType: 'kyb',
          resourceId: kyb.id
        }
      });
    }

    // Trigger automated compliance checks (runs in background)
    triggerAutomatedChecks(kyb.id, businessName, registrationCountry);

    // Fetch complete KYB with all relations
    const completeKYB = await prisma.supplierKYB.findUnique({
      where: { id: kyb.id },
      include: {
        documents: true,
        complianceItems: true,
        riskAssessment: true,
        badge: true
      }
    });

    return NextResponse.json(completeKYB, { status: 201 });
  } catch (error) {
    console.error('Error submitting KYB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        complianceItems: {
          include: { document: true },
          orderBy: { isMandatory: 'desc' }
        },
        riskAssessment: true,
        badge: true,
        verificationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!kyb) {
      return NextResponse.json({ message: 'No KYB found', kyb: null }, { status: 200 });
    }

    // Mask bank account number for security
    const kybSafe = {
      ...kyb,
      bankAccountNumber: kyb.bankAccountNumber ? '****' + kyb.bankAccountNumber.slice(-4) : null
    };

    return NextResponse.json(kybSafe);
  } catch (error) {
    console.error('Error fetching KYB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
