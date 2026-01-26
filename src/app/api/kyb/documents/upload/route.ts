import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

const ALLOWED_DOCUMENT_TYPES = [
  'BUSINESS_LICENSE',
  'TAX_CERTIFICATE',
  'REGISTRATION_CERTIFICATE',
  'INCORPORATION_CERTIFICATE',
  'BANK_STATEMENT',
  'IDENTIFICATION',
  'UTILITY_BILL',
  'ARTICLES_OF_INCORPORATION',
  'MEMORANDUM_OF_ASSOCIATION',
  'PARTNERSHIP_DEED',
  'TRUST_DEED',
  'PROOF_OF_OWNERSHIP',
  'INSURANCE_CERTIFICATE',
  'PRODUCT_CERTIFICATION',
  'EXPORT_LICENSE',
  'IMPORT_LICENSE',
  'ISO_CERTIFICATION',
  'POLLUTION_CERTIFICATE',
  'AUDITED_ACCOUNTS',
  'VAT_CERTIFICATE',
  'OTHER'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string;
    const expiryDate = formData.get('expiryDate') as string | null;
    const issueDate = formData.get('issueDate') as string | null;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and documentType are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Check if user has KYB
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id }
    });

    if (!kyb) {
      return NextResponse.json(
        { error: 'KYB not found. Please submit KYB application first.' },
        { status: 404 }
      );
    }

    // In production, upload to S3/cloud storage
    // For demo, we'll store as a placeholder URL
    const fileName = `kyb/${kyb.id}/${documentType}/${Date.now()}-${file.name}`;
    const storageUrl = `https://storage.example.com/${fileName}`;

    // Create document record
    const document = await prisma.verificationDocument.create({
      data: {
        kybId: kyb.id,
        documentType,
        documentName: file.name,
        storageUrl,
        fileSize: file.size,
        verificationStatus: 'PENDING',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issueDate: issueDate ? new Date(issueDate) : null
      }
    });

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        kybId: kyb.id,
        action: 'DOCUMENT_UPLOADED',
        actionDetails: `Document uploaded: ${documentType} - ${file.name}`
      }
    });

    // Link to matching compliance item
    const complianceItemMap: Record<string, string> = {
      'TAX_CERTIFICATE': 'TAX_REGISTRATION',
      'VAT_CERTIFICATE': 'TAX_REGISTRATION',
      'BUSINESS_LICENSE': 'BUSINESS_LICENSE',
      'REGISTRATION_CERTIFICATE': 'BUSINESS_LICENSE',
      'INCORPORATION_CERTIFICATE': 'BUSINESS_LICENSE',
      'BANK_STATEMENT': 'BANK_ACCOUNT',
      'UTILITY_BILL': 'ADDRESS_PROOF',
      'INSURANCE_CERTIFICATE': 'BUSINESS_INSURANCE',
      'PRODUCT_CERTIFICATION': 'QUALITY_CERTIFICATION',
      'ISO_CERTIFICATION': 'QUALITY_CERTIFICATION',
      'EXPORT_LICENSE': 'EXPORT_LICENSE',
      'IMPORT_LICENSE': 'IMPORT_LICENSE',
      'AUDITED_ACCOUNTS': 'AUDITED_FINANCIAL_STATEMENTS'
    };

    const complianceItemType = complianceItemMap[documentType];
    if (complianceItemType) {
      await prisma.complianceItem.updateMany({
        where: {
          kybId: kyb.id,
          itemType: complianceItemType
        },
        data: {
          documentId: document.id,
          status: 'IN_PROGRESS'
        }
      });
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
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
      where: { userId: session.user.id }
    });

    if (!kyb) {
      return NextResponse.json({ documents: [] });
    }

    const documents = await prisma.verificationDocument.findMany({
      where: { kybId: kyb.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
