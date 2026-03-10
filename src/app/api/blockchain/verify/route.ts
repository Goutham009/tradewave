import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyDocumentHash } from '@/lib/services/blockchainService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, contractAddress: requestedContractAddress } = body;

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

    const contractAddress = requestedContractAddress || document?.contractAddress || undefined;

    let onChainResult: { verified: boolean; details?: any } | null = null;
    if (contractAddress) {
      try {
        onChainResult = await verifyDocumentHash(hash, contractAddress);
      } catch (onChainError) {
        console.error('On-chain document verification failed:', onChainError);
      }
    }

    const databaseVerified = Boolean(document);
    const verified = databaseVerified || Boolean(onChainResult?.verified);

    return NextResponse.json({
      verified,
      source: {
        database: databaseVerified,
        blockchain: Boolean(onChainResult?.verified),
      },
      document: document
        ? {
            id: document.id,
            documentType: document.documentType,
            originalName: document.originalName,
            transactionId: document.transactionId,
            registeredAt: document.verifiedAt,
            blockchainTxHash: document.blockchainTxHash,
            contractAddress: document.contractAddress,
          }
        : null,
      onChain: onChainResult
        ? {
            verified: onChainResult.verified,
            contractAddress,
            details: onChainResult.details || null,
          }
        : null,
      message: verified ? 'Document verification successful' : 'Document hash not found in records',
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
