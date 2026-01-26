import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/[id]/blacklist - Check blacklist status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: buyerId } = await params;

    const blacklist = await prisma.buyerBlacklist.findUnique({
      where: { buyerId },
      include: {
        buyer: { select: { id: true, name: true, email: true, companyName: true } },
        blacklistedByAdmin: { select: { id: true, name: true } },
        appeal: { select: { id: true, status: true, submittedAt: true } },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!blacklist) {
      return NextResponse.json({ isBlacklisted: false });
    }

    // Check if temporary blacklist has expired
    if (blacklist.severity === 'TEMPORARY' && blacklist.expiresAt && new Date(blacklist.expiresAt) < new Date()) {
      await prisma.buyerBlacklist.update({
        where: { id: blacklist.id },
        data: { status: 'EXPIRED' }
      });
      return NextResponse.json({ isBlacklisted: false, expired: true });
    }

    return NextResponse.json({
      isBlacklisted: blacklist.status === 'ACTIVE',
      ...blacklist
    });
  } catch (error) {
    console.error('Error checking blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/buyer-trust/[id]/blacklist - Add to blacklist (Admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id: buyerId } = await params;
    const body = await req.json();
    const { reason, description, severity, globalBlacklist, affectedSellerIds, expiresAt, adminNotes } = body;

    if (!reason || !description || !severity) {
      return NextResponse.json({ error: 'reason, description, and severity required' }, { status: 400 });
    }

    // Check if already blacklisted
    const existing = await prisma.buyerBlacklist.findUnique({
      where: { buyerId }
    });

    if (existing && existing.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Buyer is already blacklisted' }, { status: 400 });
    }

    const blacklist = await prisma.buyerBlacklist.upsert({
      where: { buyerId },
      create: {
        buyerId,
        reason,
        description,
        severity,
        globalBlacklist: globalBlacklist ?? true,
        affectedSellerIds: affectedSellerIds || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        blacklistedByAdminId: session.user.id,
        adminNotes
      },
      update: {
        reason,
        description,
        severity,
        status: 'ACTIVE',
        globalBlacklist: globalBlacklist ?? true,
        affectedSellerIds: affectedSellerIds || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        blacklistedByAdminId: session.user.id,
        adminNotes,
        blacklistedAt: new Date(),
        unblacklistedAt: null
      }
    });

    // Create log
    await prisma.blacklistLog.create({
      data: {
        blacklistId: blacklist.id,
        action: 'BLACKLISTED',
        details: `Reason: ${reason}. ${description}`,
        performedByAdminId: session.user.id
      }
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: 'SYSTEM',
        title: 'Account Blacklisted',
        message: `Your account has been blacklisted. Reason: ${reason}. Please contact support for more information.`,
        resourceType: 'blacklist',
        resourceId: blacklist.id
      }
    });

    return NextResponse.json(blacklist, { status: 201 });
  } catch (error) {
    console.error('Error blacklisting buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/buyer-trust/[id]/blacklist - Remove from blacklist (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id: buyerId } = await params;
    const body = await req.json().catch(() => ({}));

    const blacklist = await prisma.buyerBlacklist.findUnique({
      where: { buyerId }
    });

    if (!blacklist) {
      return NextResponse.json({ error: 'Blacklist entry not found' }, { status: 404 });
    }

    await prisma.buyerBlacklist.update({
      where: { id: blacklist.id },
      data: {
        status: 'REMOVED',
        unblacklistedAt: new Date()
      }
    });

    // Create log
    await prisma.blacklistLog.create({
      data: {
        blacklistId: blacklist.id,
        action: 'UNBLACKLISTED',
        details: body.reason || 'Removed by admin',
        performedByAdminId: session.user.id
      }
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: 'SYSTEM',
        title: 'Blacklist Removed',
        message: 'Your account has been removed from the blacklist. You can now transact normally.',
        resourceType: 'blacklist',
        resourceId: blacklist.id
      }
    });

    return NextResponse.json({ success: true, message: 'Buyer removed from blacklist' });
  } catch (error) {
    console.error('Error removing from blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
