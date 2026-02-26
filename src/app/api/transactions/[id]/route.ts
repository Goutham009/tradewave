import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import * as escrowService from '@/lib/services/escrowService';
import {
  buildOrderReferences,
  formatQuotationReference,
  formatRequirementReference,
  formatTransactionReference,
} from '@/lib/flow-references';

// Standard response helpers
function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number, details?: any) {
  return NextResponse.json({ status: 'error', error: message, details }, { status });
}

// Helper to check and release escrow funds if all conditions met
async function checkAndReleaseFunds(transactionId: string, escrowId: string) {
  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    include: { releaseConditions: true },
  });

  if (!escrow) return { released: false, reason: 'Escrow not found' };

  const allConditionsMet = 
    escrow.deliveryConfirmed && 
    escrow.qualityApproved && 
    escrow.documentsVerified;

  if (allConditionsMet && escrow.status === 'HELD') {
    // Release funds
    await prisma.$transaction(async (tx) => {
      // Update escrow status
      await tx.escrowTransaction.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
          releaseDate: new Date(),
        },
      });

      // Update transaction status
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED' },
      });

      // Add milestone
      await tx.transactionMilestone.create({
        data: {
          transactionId,
          status: 'COMPLETED',
          description: 'All conditions met - escrow funds released to supplier',
        },
      });
    });

    // Call blockchain escrow release (non-blocking)
    try {
      await escrowService.releaseFunds(escrowId);
    } catch (e) {
      console.error('Blockchain escrow release failed:', e);
    }

    return { released: true };
  }

  return { 
    released: false, 
    reason: 'Not all conditions met',
    conditions: {
      deliveryConfirmed: escrow.deliveryConfirmed,
      qualityApproved: escrow.qualityApproved,
      documentsVerified: escrow.documentsVerified,
    }
  };
}

// Mock transaction data for demo/fallback
function getMockTransaction(id: string) {
  const references = {
    requirementReference: 'REQ-DEMO0001',
    quotationReference: 'QUO-DEMO0001',
    transactionReference: formatTransactionReference(id),
    ...buildOrderReferences(id),
  };

  return {
    id,
    status: 'IN_TRANSIT',
    amount: 237500,
    currency: 'USD',
    destination: 'Los Angeles, CA, USA',
    estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    actualDelivery: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    requirement: {
      id: 'req-001',
      title: 'Industrial Steel Components - Q1 2024',
      description: 'High-quality steel components for manufacturing line upgrade',
      category: 'Industrial Materials',
      quantity: 5000,
      unit: 'pieces',
      deliveryLocation: 'Los Angeles, CA',
      attachments: [
        { id: 'att-1', name: 'specifications.pdf', url: '#', size: 245000 },
      ],
    },
    quotation: {
      id: 'quote-001',
      unitPrice: 45.00,
      quantity: 5000,
      total: 237500,
      leadTime: 21,
      supplier: {
        id: 'supplier-001',
        name: 'Global Steel Supplies',
        companyName: 'Global Steel Supplies Ltd.',
        location: 'Shanghai, China',
        email: 'sales@globalsteel.com',
        phone: '+86 21 5555-0199',
        verified: true,
        overallRating: 4.8,
        totalReviews: 156,
      },
    },
    buyer: {
      id: 'buyer-001',
      name: 'John Smith',
      email: 'john@techcorp.com',
      companyName: 'TechCorp Industries',
      phone: '+1 555-0123',
    },
    supplier: {
      id: 'supplier-001',
      name: 'Global Steel Supplies',
      companyName: 'Global Steel Supplies Ltd.',
      location: 'Shanghai, China',
      email: 'sales@globalsteel.com',
      phone: '+86 21 5555-0199',
      verified: true,
      overallRating: 4.8,
    },
    escrow: {
      id: 'escrow-001',
      amount: 237500,
      currency: 'USD',
      status: 'HELD',
      deliveryConfirmed: false,
      qualityApproved: false,
      documentsVerified: true,
      releaseConditions: [
        { id: 'rc-1', type: 'DELIVERY_CONFIRMED', description: 'Delivery confirmed by buyer', satisfied: false },
        { id: 'rc-2', type: 'QUALITY_APPROVED', description: 'Quality approved by buyer', satisfied: false },
        { id: 'rc-3', type: 'DOCUMENTS_VERIFIED', description: 'Documents verified', satisfied: true, satisfiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      ],
    },
    milestones: [
      { id: 'ms-1', status: 'IN_TRANSIT', description: 'Shipment in transit to destination', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: 'ms-2', status: 'SHIPPED', description: 'Order shipped from supplier warehouse', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: 'ms-3', status: 'PRODUCTION', description: 'Production completed, quality check passed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: 'ms-4', status: 'ESCROW_HELD', description: 'Payment received, funds held in escrow', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { id: 'ms-5', status: 'PAYMENT_RECEIVED', description: 'Payment confirmed', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
    ],
    documents: [
      { id: 'doc-1', name: 'Commercial Invoice', type: 'INVOICE', url: '#', uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: 'doc-2', name: 'Packing List', type: 'PACKING_LIST', url: '#', uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: 'doc-3', name: 'Bill of Lading', type: 'BILL_OF_LADING', url: '#', uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ],
    payments: [
      { id: 'pay-1', amount: 237500, currency: 'USD', method: 'BANK_TRANSFER', status: 'COMPLETED', createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
    ],
    shipment: {
      id: 'ship-001',
      trackingNumber: 'GLBL-2024-78543',
      carrier: 'Global Freight',
      status: 'IN_TRANSIT',
      estimatedArrival: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    references,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    let transaction;
    try {
      transaction = await prisma.transaction.findUnique({
        where: { id: params.id },
        include: {
          requirement: {
            include: {
              attachments: true,
            },
          },
          quotation: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  location: true,
                  email: true,
                  phone: true,
                  verified: true,
                  overallRating: true,
                  totalReviews: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              phone: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              location: true,
              email: true,
              phone: true,
              verified: true,
              overallRating: true,
            },
          },
          escrow: {
            include: {
              releaseConditions: {
                orderBy: { type: 'asc' },
              },
            },
          },
          milestones: {
            orderBy: { timestamp: 'desc' },
          },
          documents: {
            orderBy: { uploadedAt: 'desc' },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (dbError) {
      console.error('Database error, using mock data:', dbError);
      transaction = null;
    }

    // Use mock data if no transaction found
    if (!transaction) {
      const mockTransaction = getMockTransaction(params.id);
      return successResponse({ transaction: mockTransaction });
    }

    // Authorization check
    const isAdminOrAM = ['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user.role || '');
    const isBuyerOwner = transaction.buyerId === session.user.id;
    const isSupplierOwner = !!session.user.email && transaction.supplier?.email === session.user.email;

    if (!isAdminOrAM && !isBuyerOwner && !isSupplierOwner) {
      return errorResponse('Forbidden: You can only view transactions linked to your account', 403);
    }

    const references = {
      requirementReference: formatRequirementReference(transaction.requirementId),
      quotationReference: formatQuotationReference(transaction.quotationId),
      transactionReference: formatTransactionReference(transaction.id),
      ...buildOrderReferences(transaction.id),
    };

    const roleVisibleReferences = isAdminOrAM
      ? references
      : {
          requirementReference: references.requirementReference,
          quotationReference: references.quotationReference,
          transactionReference: references.transactionReference,
          ...(isBuyerOwner ? { buyerOrderId: references.buyerOrderId } : {}),
          ...(isSupplierOwner ? { supplierOrderId: references.supplierOrderId } : {}),
        };

    return successResponse({
      transaction: {
        ...transaction,
        references: roleVisibleReferences,
      },
    });
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    // Return mock data on error
    const mockTransaction = getMockTransaction(params.id);
    return successResponse({ transaction: mockTransaction });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { action, status: newStatus, ...updateData } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { 
        escrow: {
          include: { releaseConditions: true },
        },
        requirement: true,
      },
    });

    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Authorization: Buyer can only update their own transactions
    if (session.user.role === 'BUYER' && transaction.buyerId !== session.user.id) {
      return errorResponse('Forbidden: You can only update your own transactions', 403);
    }

    // Handle specific actions
    switch (action) {
      case 'CONFIRMDELIVERY':
      case 'CONFIRM_DELIVERY': {
        // Only buyer can confirm delivery
        if (transaction.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
          return errorResponse('Forbidden: Only the buyer can confirm delivery', 403);
        }

        // Validate transaction state
        if (!['DELIVERED', 'IN_TRANSIT', 'SHIPPED'].includes(transaction.status)) {
          return errorResponse('Invalid state: Cannot confirm delivery in current status', 400);
        }

        if (!transaction.escrow) {
          return errorResponse('No escrow found for this transaction', 400);
        }

        if (transaction.escrow.deliveryConfirmed) {
          return errorResponse('Delivery has already been confirmed', 409);
        }

        // Update in transaction
        const updatedTx = await prisma.$transaction(async (tx) => {
          // Update escrow
          await tx.escrowTransaction.update({
            where: { id: transaction.escrow!.id },
            data: {
              deliveryConfirmed: true,
              deliveryConfirmedAt: new Date(),
            },
          });

          // Update release condition
          await tx.releaseCondition.updateMany({
            where: {
              escrowId: transaction.escrow!.id,
              type: 'DELIVERY_CONFIRMED',
            },
            data: {
              satisfied: true,
              satisfiedAt: new Date(),
              satisfiedBy: session.user.id,
            },
          });

          // Update transaction status
          const updated = await tx.transaction.update({
            where: { id: params.id },
            data: { 
              status: 'DELIVERED',
              actualDelivery: new Date(),
            },
          });

          // Add milestone
          await tx.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: 'DELIVERED',
              description: 'Delivery confirmed by buyer',
              actor: session.user.id,
            },
          });

          return updated;
        });

        // Check if we can auto-release funds
        const releaseResult = await checkAndReleaseFunds(params.id, transaction.escrow.id);

        // Fetch updated escrow state
        const updatedEscrow = await prisma.escrowTransaction.findUnique({
          where: { id: transaction.escrow.id },
        });

        return successResponse({
          transaction: {
            id: updatedTx.id,
            status: releaseResult.released ? 'COMPLETED' : updatedTx.status,
            deliveryConfirmedAt: new Date(),
          },
          escrow: {
            id: updatedEscrow?.id,
            status: updatedEscrow?.status,
            deliveryConfirmed: true,
            qualityApproved: updatedEscrow?.qualityApproved,
            documentsVerified: updatedEscrow?.documentsVerified,
            releasedAt: releaseResult.released ? new Date() : null,
          },
          fundsReleased: releaseResult.released,
        });
      }

      case 'APPROVEQUALITY':
      case 'APPROVE_QUALITY': {
        // Only buyer can approve quality
        if (transaction.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
          return errorResponse('Forbidden: Only the buyer can approve quality', 403);
        }

        if (!transaction.escrow) {
          return errorResponse('No escrow found for this transaction', 400);
        }

        if (transaction.escrow.qualityApproved) {
          return errorResponse('Quality has already been approved', 409);
        }

        // Update in transaction
        await prisma.$transaction(async (tx) => {
          // Update escrow
          await tx.escrowTransaction.update({
            where: { id: transaction.escrow!.id },
            data: {
              qualityApproved: true,
              qualityApprovedAt: new Date(),
            },
          });

          // Update release condition
          await tx.releaseCondition.updateMany({
            where: {
              escrowId: transaction.escrow!.id,
              type: 'QUALITY_APPROVED',
            },
            data: {
              satisfied: true,
              satisfiedAt: new Date(),
              satisfiedBy: session.user.id,
            },
          });

          // Add milestone
          await tx.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: transaction.status,
              description: 'Quality approved by buyer',
              actor: session.user.id,
            },
          });
        });

        // Check if we can auto-release funds
        const releaseResult = await checkAndReleaseFunds(params.id, transaction.escrow.id);

        // Fetch updated state
        const updatedTransaction = await prisma.transaction.findUnique({
          where: { id: params.id },
          include: { escrow: true },
        });

        return successResponse({
          transaction: {
            id: updatedTransaction?.id,
            status: updatedTransaction?.status,
            qualityApprovedAt: new Date(),
          },
          escrow: {
            id: updatedTransaction?.escrow?.id,
            status: updatedTransaction?.escrow?.status,
            deliveryConfirmed: updatedTransaction?.escrow?.deliveryConfirmed,
            qualityApproved: true,
            documentsVerified: updatedTransaction?.escrow?.documentsVerified,
            releasedAt: releaseResult.released ? new Date() : null,
          },
          fundsReleased: releaseResult.released,
        });
      }

      case 'VERIFYDOCUMENTS':
      case 'VERIFY_DOCUMENTS': {
        // Admin or system can verify documents
        if (session.user.role !== 'ADMIN') {
          return errorResponse('Forbidden: Only admin can verify documents', 403);
        }

        if (!transaction.escrow) {
          return errorResponse('No escrow found for this transaction', 400);
        }

        if (transaction.escrow.documentsVerified) {
          return errorResponse('Documents have already been verified', 409);
        }

        // Update in transaction
        await prisma.$transaction(async (tx) => {
          // Update escrow
          await tx.escrowTransaction.update({
            where: { id: transaction.escrow!.id },
            data: {
              documentsVerified: true,
              documentsVerifiedAt: new Date(),
            },
          });

          // Update release condition
          await tx.releaseCondition.updateMany({
            where: {
              escrowId: transaction.escrow!.id,
              type: 'DOCUMENTS_VERIFIED',
            },
            data: {
              satisfied: true,
              satisfiedAt: new Date(),
              satisfiedBy: session.user.id,
            },
          });

          // Add milestone
          await tx.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: transaction.status,
              description: 'Documents verified by admin',
              actor: session.user.id,
            },
          });
        });

        // Check if we can auto-release funds
        const releaseResult = await checkAndReleaseFunds(params.id, transaction.escrow.id);

        // Fetch updated state
        const updatedTransaction = await prisma.transaction.findUnique({
          where: { id: params.id },
          include: { escrow: true },
        });

        return successResponse({
          transaction: {
            id: updatedTransaction?.id,
            status: updatedTransaction?.status,
          },
          escrow: {
            id: updatedTransaction?.escrow?.id,
            status: updatedTransaction?.escrow?.status,
            deliveryConfirmed: updatedTransaction?.escrow?.deliveryConfirmed,
            qualityApproved: updatedTransaction?.escrow?.qualityApproved,
            documentsVerified: true,
            releasedAt: releaseResult.released ? new Date() : null,
          },
          fundsReleased: releaseResult.released,
        });
      }

      case 'RELEASEFUNDS':
      case 'RELEASE_FUNDS': {
        // Admin can force release
        if (session.user.role !== 'ADMIN') {
          return errorResponse('Forbidden: Only admin can force release funds', 403);
        }

        if (!transaction.escrow) {
          return errorResponse('No escrow found for this transaction', 400);
        }

        if (transaction.escrow.status === 'RELEASED') {
          return errorResponse('Funds have already been released', 409);
        }

        await prisma.$transaction(async (tx) => {
          await tx.escrowTransaction.update({
            where: { id: transaction.escrow!.id },
            data: {
              status: 'RELEASED',
              releaseDate: new Date(),
            },
          });

          await tx.transaction.update({
            where: { id: params.id },
            data: { status: 'COMPLETED' },
          });

          await tx.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: 'COMPLETED',
              description: 'Funds force-released by admin',
              actor: session.user.id,
            },
          });
        });

        // Call blockchain release
        try {
          await escrowService.releaseFunds(transaction.escrow.id);
        } catch (e) {
          console.error('Blockchain release failed:', e);
        }

        return successResponse({
          transaction: { id: params.id, status: 'COMPLETED' },
          escrow: { status: 'RELEASED', releasedAt: new Date() },
          fundsReleased: true,
        });
      }

      case 'REFUND': {
        // Admin can refund
        if (session.user.role !== 'ADMIN') {
          return errorResponse('Forbidden: Only admin can process refunds', 403);
        }

        if (!transaction.escrow) {
          return errorResponse('No escrow found for this transaction', 400);
        }

        if (transaction.escrow.status === 'RELEASED') {
          return errorResponse('Cannot refund - funds already released', 400);
        }

        if (transaction.escrow.status === 'REFUNDED') {
          return errorResponse('Transaction has already been refunded', 409);
        }

        await prisma.$transaction(async (tx) => {
          await tx.escrowTransaction.update({
            where: { id: transaction.escrow!.id },
            data: { status: 'REFUNDED' },
          });

          await tx.transaction.update({
            where: { id: params.id },
            data: { status: 'REFUNDED' },
          });

          await tx.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: 'REFUNDED',
              description: 'Transaction refunded by admin',
              actor: session.user.id,
            },
          });
        });

        return successResponse({
          transaction: { id: params.id, status: 'REFUNDED' },
          escrow: { status: 'REFUNDED' },
        });
      }

      case 'DISPUTE': {
        // Buyer or Admin can open dispute
        if (transaction.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
          return errorResponse('Forbidden', 403);
        }

        if (!transaction.escrow) {
          return errorResponse('No escrow found for this transaction', 400);
        }

        await prisma.$transaction(async (tx) => {
          await tx.escrowTransaction.update({
            where: { id: transaction.escrow!.id },
            data: { status: 'DISPUTED' },
          });

          await tx.transaction.update({
            where: { id: params.id },
            data: { status: 'DISPUTED' },
          });

          await tx.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: 'DISPUTED',
              description: updateData.reason || 'Dispute opened',
              actor: session.user.id,
            },
          });
        });

        return successResponse({
          transaction: { id: params.id, status: 'DISPUTED' },
          escrow: { status: 'DISPUTED' },
        });
      }

      default: {
        // Generic status update (for shipping updates, etc.)
        if (newStatus) {
          // Validate status transition
          const validTransitions: Record<string, string[]> = {
            PAYMENT_PENDING: ['PAYMENT_RECEIVED', 'CANCELLED'],
            PAYMENT_RECEIVED: ['ESCROW_HELD', 'CANCELLED'],
            ESCROW_HELD: ['PRODUCTION', 'CANCELLED'],
            PRODUCTION: ['QUALITY_CHECK', 'CANCELLED'],
            QUALITY_CHECK: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['IN_TRANSIT'],
            IN_TRANSIT: ['CUSTOMS', 'DELIVERED'],
            CUSTOMS: ['DELIVERED'],
            DELIVERED: ['CONFIRMED', 'DISPUTED'],
            CONFIRMED: ['COMPLETED'],
          };

          const allowed = validTransitions[transaction.status] || [];
          if (!allowed.includes(newStatus) && session.user.role !== 'ADMIN') {
            return errorResponse(
              `Invalid status transition from ${transaction.status} to ${newStatus}`,
              400
            );
          }

          const updatedTransaction = await prisma.transaction.update({
            where: { id: params.id },
            data: { 
              status: newStatus,
              ...updateData,
            },
            include: {
              escrow: true,
              supplier: { select: { id: true, name: true, companyName: true } },
            },
          });

          await prisma.transactionMilestone.create({
            data: {
              transactionId: params.id,
              status: newStatus,
              description: updateData.description || `Status updated to ${newStatus}`,
              actor: session.user.id,
            },
          });

          return successResponse({ transaction: updatedTransaction });
        }

        return errorResponse('No valid action or status specified', 400);
      }
    }
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return errorResponse('Internal server error', 500);
  }
}
