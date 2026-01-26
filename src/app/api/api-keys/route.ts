import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generateApiKey(): string {
  return `tw_${crypto.randomBytes(32).toString('hex')}`;
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await prisma.aPIKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        scopes: true,
        requestsPerMinute: true,
        requestsPerDay: true,
        ipWhitelist: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      scopes = [],
      requestsPerMinute = 60,
      requestsPerDay = 10000,
      ipWhitelist = [],
      expiresAt
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate new API key
    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);
    const keyPreview = `${rawKey.slice(0, 7)}...${rawKey.slice(-4)}`;

    const apiKey = await prisma.aPIKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
        keyPreview,
        scopes,
        requestsPerMinute,
        requestsPerDay,
        ipWhitelist,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey, // Only returned once!
        keyPreview: apiKey.keyPreview,
        scopes: apiKey.scopes,
        createdAt: apiKey.createdAt
      },
      message: 'Save this key now - it will not be shown again'
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    // Verify ownership
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id: keyId }
    });

    if (!apiKey || apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.aPIKey.delete({ where: { id: keyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
