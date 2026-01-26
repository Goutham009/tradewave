import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await prisma.deviceFingerprint.findMany({
      where: { userId: session.user.id },
      orderBy: { lastSeenAt: 'desc' }
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
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
      fingerprint,
      deviceType,
      osType,
      osVersion,
      browserType,
      browserVersion,
      screenResolution,
      timezone,
      language,
      country,
      region,
      city
    } = body;

    if (!fingerprint || !deviceType || !osType || !browserType || !country) {
      return NextResponse.json(
        { error: 'Missing required device info' },
        { status: 400 }
      );
    }

    // Check if fingerprint already exists
    let device = await prisma.deviceFingerprint.findUnique({
      where: { fingerprint }
    });

    if (device) {
      // Update last seen
      device = await prisma.deviceFingerprint.update({
        where: { id: device.id },
        data: { 
          lastSeenAt: new Date(),
          transactionCount: { increment: 1 }
        }
      });
    } else {
      // Create new device record
      device = await prisma.deviceFingerprint.create({
        data: {
          userId: session.user.id,
          fingerprint,
          deviceType,
          osType,
          osVersion,
          browserType,
          browserVersion,
          screenResolution,
          timezone,
          language,
          country,
          region,
          city,
          firstSeenAt: new Date(),
          lastSeenAt: new Date()
        }
      });
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Register device error:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}
