import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash } = body;

    if (!hash) {
      return NextResponse.json(
        { error: 'Document hash is required' },
        { status: 400 }
      );
    }

    // Check if document hash exists in database
    const document = await prisma.documentHash.findFirst({
      where: { hash },
      include: {
        transaction: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (document) {
      return NextResponse.json({
        verified: true,
        document: {
          id: document.id,
          documentType: document.documentType,
          originalName: document.originalName,
          transactionId: document.transactionId,
          registeredAt: document.verifiedAt,
          blockchainTxHash: document.blockchainTxHash,
          contractAddress: document.contractAddress,
        },
      });
    }

    return NextResponse.json({
      verified: false,
      message: 'Document hash not found in records',
    });
  } catch (error) {
    console.error('Failed to verify document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const documents = await prisma.documentHash.findMany({
      where: { transactionId },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
