import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// POST /api/kyb/appeal/document - Upload document for appeal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { appealId, documentName, fileName, fileUrl, fileSize, mimeType } = body;

    if (!appealId || !documentName || !fileName || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify appeal belongs to user
    const appeal = await prisma.kYBAppeal.findFirst({
      where: {
        id: appealId,
        kyb: { userId: session.user.id }
      }
    });

    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    if (appeal.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Cannot add documents to a processed appeal' 
      }, { status: 400 });
    }

    // Create document
    const document = await prisma.kYBAppealDocument.create({
      data: {
        appealId,
        documentName,
        fileName,
        fileUrl,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream'
      }
    });

    return NextResponse.json({ 
      success: true,
      document,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Appeal Document Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

// DELETE /api/kyb/appeal/document - Delete appeal document
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Verify document belongs to user's appeal
    const document = await prisma.kYBAppealDocument.findFirst({
      where: {
        id: documentId,
        appeal: {
          kyb: { userId: session.user.id },
          status: 'PENDING'
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await prisma.kYBAppealDocument.delete({
      where: { id: documentId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete Appeal Document Error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
