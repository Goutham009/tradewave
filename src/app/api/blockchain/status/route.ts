import { NextRequest, NextResponse } from 'next/server';
import { getNetworkStatus } from '@/lib/blockchain/web3Client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = (searchParams.get('network') || 'sepolia') as 'sepolia' | 'polygon' | 'mainnet';

    const status = await getNetworkStatus(network);

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Failed to get blockchain status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get blockchain status' },
      { status: 500 }
    );
  }
}
