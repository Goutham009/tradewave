import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// Tax ID validation patterns by country
const TAX_ID_PATTERNS: Record<string, { pattern: RegExp; type: string; name: string }> = {
  US: { pattern: /^\d{2}-\d{7}$/, type: 'EIN', name: 'Employer Identification Number' },
  GB: { pattern: /^GB\d{9}$|^GB\d{12}$|^GBGD\d{3}$|^GBHA\d{3}$/, type: 'VAT', name: 'VAT Number' },
  DE: { pattern: /^DE\d{9}$/, type: 'VAT', name: 'Umsatzsteuer-ID' },
  FR: { pattern: /^FR[A-Z0-9]{2}\d{9}$/, type: 'VAT', name: 'TVA' },
  IN: { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, type: 'GST', name: 'GST Number' },
  AU: { pattern: /^\d{11}$/, type: 'ABN', name: 'Australian Business Number' },
  CA: { pattern: /^\d{9}[A-Z]{2}\d{4}$/, type: 'BN', name: 'Business Number' },
  CN: { pattern: /^[0-9A-Z]{18}$/, type: 'USCC', name: 'Unified Social Credit Code' },
  JP: { pattern: /^\d{13}$/, type: 'CN', name: 'Corporate Number' },
  BR: { pattern: /^\d{14}$/, type: 'CNPJ', name: 'CNPJ' },
  MX: { pattern: /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/, type: 'RFC', name: 'RFC' },
  SG: { pattern: /^\d{9}[A-Z]$/, type: 'UEN', name: 'Unique Entity Number' },
  AE: { pattern: /^\d{15}$/, type: 'TRN', name: 'Tax Registration Number' },
  NL: { pattern: /^NL\d{9}B\d{2}$/, type: 'VAT', name: 'BTW-nummer' },
  ES: { pattern: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/, type: 'VAT', name: 'NIF/CIF' },
  IT: { pattern: /^IT\d{11}$/, type: 'VAT', name: 'Partita IVA' },
  KR: { pattern: /^\d{10}$/, type: 'BRN', name: 'Business Registration Number' },
  ZA: { pattern: /^\d{10}$/, type: 'VAT', name: 'VAT Number' },
  NZ: { pattern: /^\d{8,9}$/, type: 'IRD', name: 'IRD Number' },
  CH: { pattern: /^CHE-\d{3}\.\d{3}\.\d{3}$/, type: 'UID', name: 'UID' },
  SE: { pattern: /^SE\d{12}$/, type: 'VAT', name: 'Momsnummer' },
  PL: { pattern: /^PL\d{10}$/, type: 'VAT', name: 'NIP' },
  AT: { pattern: /^ATU\d{8}$/, type: 'VAT', name: 'UID-Nummer' },
  BE: { pattern: /^BE0\d{9}$/, type: 'VAT', name: 'BTW-nummer' },
  DK: { pattern: /^DK\d{8}$/, type: 'VAT', name: 'CVR-nummer' },
  FI: { pattern: /^FI\d{8}$/, type: 'VAT', name: 'ALV-numero' },
  NO: { pattern: /^NO\d{9}MVA$/, type: 'VAT', name: 'MVA-nummer' },
  IE: { pattern: /^IE\d{7}[A-Z]{1,2}$/, type: 'VAT', name: 'VAT Number' },
  PT: { pattern: /^PT\d{9}$/, type: 'VAT', name: 'NIF' },
  RU: { pattern: /^\d{10}$|^\d{12}$/, type: 'INN', name: 'INN' },
  HK: { pattern: /^\d{8}$/, type: 'BRN', name: 'Business Registration Number' },
  MY: { pattern: /^\d{12}$/, type: 'SST', name: 'SST Number' },
  TH: { pattern: /^\d{13}$/, type: 'TIN', name: 'Tax ID Number' },
  ID: { pattern: /^\d{15}$/, type: 'NPWP', name: 'NPWP' },
  PH: { pattern: /^\d{12}$/, type: 'TIN', name: 'Tax Identification Number' },
  VN: { pattern: /^\d{10}$|^\d{13}$/, type: 'MST', name: 'Mã số thuế' }
};

// Mock tax verification API (in production, use actual country-specific APIs)
async function verifyTaxWithAPI(
  taxId: string,
  country: string,
  taxIdType: string
): Promise<{
  valid: boolean;
  data?: {
    taxId: string;
    businessName: string;
    registrationDate: string;
    status: string;
    country: string;
    taxIdType: string;
  };
  error?: string;
}> {
  const countryConfig = TAX_ID_PATTERNS[country];
  
  if (!countryConfig) {
    // For unknown countries, accept any format
    return {
      valid: true,
      data: {
        taxId,
        businessName: 'Verified Business Entity',
        registrationDate: '2020-01-15',
        status: 'Active',
        country,
        taxIdType: taxIdType || 'TAX_ID'
      }
    };
  }

  // Validate format
  if (!countryConfig.pattern.test(taxId)) {
    return { valid: false, error: `Invalid ${countryConfig.name} format for ${country}` };
  }

  // Mock successful verification
  return {
    valid: true,
    data: {
      taxId,
      businessName: 'Verified Business Entity',
      registrationDate: '2020-01-15',
      status: 'Active',
      country,
      taxIdType: countryConfig.type
    }
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { taxIdNumber, taxIdCountry, taxIdType } = await req.json();

    if (!taxIdNumber || !taxIdCountry) {
      return NextResponse.json({ error: 'Tax ID number and country are required' }, { status: 400 });
    }

    const normalizedTaxId = taxIdNumber.toUpperCase().trim();
    const normalizedCountry = taxIdCountry.toUpperCase().trim();

    // Get user's KYB
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB not found' }, { status: 404 });
    }

    // Verify tax ID
    const result = await verifyTaxWithAPI(normalizedTaxId, normalizedCountry, taxIdType);

    if (!result.valid) {
      // Create verification log for failed attempt
      await prisma.verificationLog.create({
        data: {
          kybId: kyb.id,
          action: 'TAX_VERIFICATION_FAILED',
          actionDetails: `Tax ID verification failed: ${result.error}`
        }
      });

      return NextResponse.json(
        { verified: false, error: result.error },
        { status: 400 }
      );
    }

    // Update KYB with verified tax info
    await prisma.supplierKYB.update({
      where: { id: kyb.id },
      data: {
        taxIdNumber: normalizedTaxId,
        taxIdCountry: normalizedCountry,
        taxIdType: result.data?.taxIdType || taxIdType
      }
    });

    // Update tax compliance item
    await prisma.complianceItem.updateMany({
      where: {
        kybId: kyb.id,
        itemType: 'TAX_REGISTRATION'
      },
      data: {
        status: 'COMPLETED',
        completedDate: new Date()
      }
    });

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        kybId: kyb.id,
        action: 'TAX_VERIFIED',
        actionDetails: `Tax ID ${normalizedTaxId} (${normalizedCountry}) verified successfully`
      }
    });

    return NextResponse.json({
      verified: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error verifying tax ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');

  if (!country) {
    // Return all supported tax ID types
    const supported = Object.entries(TAX_ID_PATTERNS).map(([code, config]) => ({
      countryCode: code,
      taxIdType: config.type,
      taxIdName: config.name
    }));
    return NextResponse.json({ supported });
  }

  const config = TAX_ID_PATTERNS[country.toUpperCase()];
  if (!config) {
    return NextResponse.json({
      countryCode: country.toUpperCase(),
      taxIdType: 'TAX_ID',
      taxIdName: 'Tax Identification Number',
      message: 'Generic tax ID accepted for this country'
    });
  }

  return NextResponse.json({
    countryCode: country.toUpperCase(),
    taxIdType: config.type,
    taxIdName: config.name
  });
}
