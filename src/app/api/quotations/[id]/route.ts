import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import * as paymentService from '@/lib/services/paymentService';

// Standard response helpers
function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number, details?: any) {
  return NextResponse.json({ status: 'error', error: message, details }, { status });
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

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                phone: true,
              },
            },
            attachments: true,
          },
        },
        supplier: {
          include: {
            certifications: {
              where: { verified: true },
            },
          },
        },
        transactions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!quotation) {
      return errorResponse('Quotation not found', 404);
    }

    // Check authorization
    const isOwner = quotation.requirement.buyerId === session.user.id;
    const isSubmitter = quotation.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isSubmitter && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    // Add computed fields
    const isExpired = quotation.validUntil < new Date();
    const daysUntilExpiry = Math.ceil((quotation.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const canAccept = !isExpired && ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(quotation.status);
    const hasTransaction = quotation.transactions.length > 0;

    return successResponse({
      quotation: {
        ...quotation,
        isExpired,
        daysUntilExpiry,
        canAccept,
        hasTransaction,
      },
    });
  } catch (error) {
    console.error('Failed to fetch quotation:', error);
    return errorResponse('Internal server error', 500);
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
    const { action, rejectionReason, ...updateData } = body;

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: true,
        supplier: true,
      },
    });

    if (!quotation) {
      return errorResponse('Quotation not found', 404);
    }

    // Check authorization - buyer can accept/reject, supplier can update their quote
    const isBuyer = quotation.requirement.buyerId === session.user.id;
    const isSubmitter = quotation.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isBuyer && !isSubmitter && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    // Handle specific actions
    switch (action) {
      case 'ACCEPT': {
        // Only buyer can accept
        if (!isBuyer && !isAdmin) {
          return errorResponse('Forbidden: Only the buyer can accept quotations', 403);
        }

        // Check if already accepted
        if (quotation.status === 'ACCEPTED') {
          return errorResponse('Quotation has already been accepted', 409);
        }

        // Check if expired
        if (quotation.validUntil < new Date()) {
          return errorResponse('Cannot accept expired quotation', 400);
        }

        // Check if requirement can accept quotations
        if (!['SUBMITTED', 'SOURCING', 'QUOTATIONS_READY', 'NEGOTIATING'].includes(quotation.requirement.status)) {
          return errorResponse('Requirement is not in a state to accept quotations', 400);
        }

        // Accept quotation and create transaction
        const result = await prisma.$transaction(async (tx) => {
          // Update quotation status
          const accepted = await tx.quotation.update({
            where: { id: params.id },
            data: { status: 'ACCEPTED' },
          });

          // Reject other quotations
          await tx.quotation.updateMany({
            where: {
              requirementId: quotation.requirementId,
              id: { not: params.id },
              status: { in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'] },
            },
            data: { status: 'REJECTED' },
          });

          // Update requirement status
          await tx.requirement.update({
            where: { id: quotation.requirementId },
            data: { status: 'ACCEPTED' },
          });

          // Create transaction
          const autoReleaseDate = new Date();
          autoReleaseDate.setDate(autoReleaseDate.getDate() + 30);

          const transaction = await tx.transaction.create({
            data: {
              requirementId: quotation.requirementId,
              quotationId: quotation.id,
              buyerId: quotation.requirement.buyerId,
              supplierId: quotation.supplierId,
              status: 'PAYMENT_PENDING',
              amount: quotation.total,
              currency: quotation.currency,
              destination: quotation.requirement.deliveryLocation,
              estimatedDelivery: new Date(Date.now() + quotation.leadTime * 24 * 60 * 60 * 1000),
            },
          });

          // Create escrow
          const escrow = await tx.escrowTransaction.create({
            data: {
              transactionId: transaction.id,
              amount: quotation.total,
              currency: quotation.currency,
              status: 'PENDING',
              deliveryConfirmed: false,
              qualityApproved: false,
              documentsVerified: false,
            },
          });

          // Create release conditions
          await tx.releaseCondition.createMany({
            data: [
              { escrowId: escrow.id, type: 'DELIVERY_CONFIRMED', description: 'Delivery confirmed by buyer' },
              { escrowId: escrow.id, type: 'QUALITY_APPROVED', description: 'Quality approved by buyer' },
              { escrowId: escrow.id, type: 'DOCUMENTS_VERIFIED', description: 'Documents verified' },
            ],
          });

          // Create milestone
          await tx.transactionMilestone.create({
            data: {
              transactionId: transaction.id,
              status: 'PAYMENT_PENDING',
              description: 'Quotation accepted, awaiting payment',
              actor: session.user.id,
            },
          });

          return { accepted, transaction, escrow };
        });

        // Create payment intent
        let paymentIntent = null;
        try {
          const paymentResult = await paymentService.createPaymentIntent({
            amount: Number(quotation.total),
            currency: quotation.currency,
            transactionId: result.transaction.id,
            buyerId: session.user.id,
            metadata: {
              quotationId: quotation.id,
              requirementId: quotation.requirementId,
              supplierId: quotation.supplierId,
            },
          });

          if (paymentResult.success) {
            await prisma.payment.create({
              data: {
                transactionId: result.transaction.id,
                amount: quotation.total,
                currency: quotation.currency,
                method: 'STRIPE',
                status: 'PENDING',
                providerPaymentId: paymentResult.paymentIntentId,
                clientSecret: paymentResult.clientSecret,
              },
            });

            paymentIntent = {
              clientSecret: paymentResult.clientSecret,
              paymentIntentId: paymentResult.paymentIntentId,
            };
          }
        } catch (e) {
          console.error('Payment intent creation failed:', e);
        }

        // Notify supplier
        try {
          await prisma.notification.create({
            data: {
              userId: quotation.userId || '',
              type: 'QUOTATION_ACCEPTED',
              title: 'Quotation Accepted!',
              message: `Your quotation for "${quotation.requirement.title}" has been accepted`,
              resourceType: 'transaction',
              resourceId: result.transaction.id,
            },
          });
        } catch (e) {}

        return successResponse({
          quotation: result.accepted,
          transaction: {
            id: result.transaction.id,
            status: result.transaction.status,
            amount: result.transaction.amount,
          },
          escrow: {
            id: result.escrow.id,
            status: result.escrow.status,
          },
          paymentIntent,
          message: 'Quotation accepted and transaction created',
        });
      }

      case 'REJECT': {
        // Only buyer can reject
        if (!isBuyer && !isAdmin) {
          return errorResponse('Forbidden: Only the buyer can reject quotations', 403);
        }

        if (quotation.status === 'ACCEPTED') {
          return errorResponse('Cannot reject an accepted quotation', 400);
        }

        if (quotation.status === 'REJECTED') {
          return errorResponse('Quotation has already been rejected', 409);
        }

        const rejected = await prisma.quotation.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            notes: rejectionReason ? `${quotation.notes || ''}\n\nRejection reason: ${rejectionReason}` : quotation.notes,
          },
        });

        // Notify supplier
        try {
          await prisma.notification.create({
            data: {
              userId: quotation.userId || '',
              type: 'QUOTATION_RECEIVED', // Using existing type
              title: 'Quotation Not Selected',
              message: `Your quotation for "${quotation.requirement.title}" was not selected${rejectionReason ? `: ${rejectionReason}` : ''}`,
              resourceType: 'quotation',
              resourceId: quotation.id,
            },
          });
        } catch (e) {}

        return successResponse({
          quotation: rejected,
          message: 'Quotation rejected',
        });
      }

      case 'SHORTLIST': {
        // Buyer can shortlist
        if (!isBuyer && !isAdmin) {
          return errorResponse('Forbidden', 403);
        }

        const shortlisted = await prisma.quotation.update({
          where: { id: params.id },
          data: { status: 'SHORTLISTED' },
        });

        return successResponse({
          quotation: shortlisted,
          message: 'Quotation shortlisted',
        });
      }

      case 'WITHDRAW': {
        // Only submitter can withdraw
        if (!isSubmitter && !isAdmin) {
          return errorResponse('Forbidden: Only the supplier can withdraw their quotation', 403);
        }

        if (quotation.status === 'ACCEPTED') {
          return errorResponse('Cannot withdraw an accepted quotation', 400);
        }

        const withdrawn = await prisma.quotation.update({
          where: { id: params.id },
          data: { status: 'EXPIRED' }, // Using EXPIRED as withdrawn status
        });

        return successResponse({
          quotation: withdrawn,
          message: 'Quotation withdrawn',
        });
      }

      case 'UPDATE': {
        // Only submitter can update (if not accepted)
        if (!isSubmitter && !isAdmin) {
          return errorResponse('Forbidden: Only the supplier can update their quotation', 403);
        }

        if (quotation.status === 'ACCEPTED') {
          return errorResponse('Cannot update an accepted quotation', 400);
        }

        // Recalculate totals if price changed
        let newTotal = quotation.total;
        if (updateData.unitPrice || updateData.quantity) {
          const unitPrice = updateData.unitPrice || Number(quotation.unitPrice);
          const quantity = updateData.quantity || quotation.quantity;
          const subtotal = unitPrice * quantity;
          const shipping = updateData.shipping ?? Number(quotation.shipping) ?? 0;
          const insurance = updateData.insurance ?? Number(quotation.insurance) ?? 0;
          const customs = updateData.customs ?? Number(quotation.customs) ?? 0;
          const taxes = updateData.taxes ?? Number(quotation.taxes) ?? 0;
          const fee = updateData.platformFee ?? Number(quotation.platformFee) ?? subtotal * 0.02;
          newTotal = subtotal + shipping + insurance + customs + taxes + fee;
          updateData.subtotal = subtotal;
          updateData.total = newTotal;
        }

        const updated = await prisma.quotation.update({
          where: { id: params.id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          include: {
            requirement: { select: { id: true, title: true } },
            supplier: { select: { id: true, name: true, companyName: true } },
          },
        });

        return successResponse({
          quotation: updated,
          message: 'Quotation updated',
        });
      }

      default:
        return errorResponse('Invalid action. Use: ACCEPT, REJECT, SHORTLIST, WITHDRAW, or UPDATE', 400);
    }
  } catch (error) {
    console.error('Failed to update quotation:', error);
    return errorResponse('Internal server error', 500);
  }
}
