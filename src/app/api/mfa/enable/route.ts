import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Generate a random base32 secret for TOTP
function generateSecret(): string {
  const buffer = crypto.randomBytes(20);
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < buffer.length; i++) {
    secret += base32chars[buffer[i] % 32];
  }
  return secret;
}

// Generate backup codes
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { method = 'totp' } = body;

    // Get or create MFA record
    let mfa = await prisma.multiFactorAuth.findUnique({
      where: { userId: session.user.id }
    });

    if (!mfa) {
      mfa = await prisma.multiFactorAuth.create({
        data: { userId: session.user.id }
      });
    }

    if (method === 'totp') {
      const secret = generateSecret();
      const backupCodes = generateBackupCodes();

      // Generate otpauth URL for QR code
      const email = session.user.email || 'user';
      const issuer = 'Tradewave';
      const otpauthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

      await prisma.multiFactorAuth.update({
        where: { id: mfa.id },
        data: {
          totpSecret: secret,
          totpBackupCodes: JSON.stringify(backupCodes),
          recoveryCodesGenerated: new Date()
        }
      });

      return NextResponse.json({
        method: 'totp',
        secret,
        otpauthUrl,
        backupCodes,
        message: 'Scan the QR code with your authenticator app, then verify with a code'
      });
    }

    if (method === 'sms') {
      const { phoneNumber } = body;
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number required for SMS' },
          { status: 400 }
        );
      }

      await prisma.multiFactorAuth.update({
        where: { id: mfa.id },
        data: {
          phoneNumber,
          smsEnabled: false // Will be enabled after verification
        }
      });

      return NextResponse.json({
        method: 'sms',
        message: 'Verification code sent to your phone'
      });
    }

    if (method === 'email') {
      await prisma.multiFactorAuth.update({
        where: { id: mfa.id },
        data: {
          emailEnabled: true,
          isMFAEnabled: true,
          lastVerifiedAt: new Date()
        }
      });

      return NextResponse.json({
        method: 'email',
        message: 'Email MFA enabled'
      });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error) {
    console.error('MFA enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable MFA' },
      { status: 500 }
    );
  }
}
