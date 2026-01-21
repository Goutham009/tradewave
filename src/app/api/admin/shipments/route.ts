import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse, getPagination, validateFilters } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const filters = validateFilters(searchParams, ['status', 'carrier', 'dateFrom', 'dateTo', 'search']);
    
    // Build where clause
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.carrier) {
      where.carrier = filters.carrier;
    }
    
    if (filters.search) {
      where.OR = [
        { trackingNumber: { contains: filters.search, mode: 'insensitive' } },
        { originLocation: { contains: filters.search, mode: 'insensitive' } },
        { destinationLocation: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }
    
    const [shipments, total] = await Promise.all([
      (prisma as any).shipment.findMany({
        where,
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              currency: true,
              buyer: { select: { name: true, companyName: true } },
              supplier: { select: { companyName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      (prisma as any).shipment.count({ where }),
    ]);
    
    const formattedShipments = shipments.map((ship: any) => ({
      id: ship.id,
      transactionId: ship.transactionId,
      trackingNumber: ship.trackingNumber,
      carrier: ship.carrier,
      status: ship.status,
      originLocation: ship.originLocation,
      currentLocation: ship.currentLocation,
      destinationLocation: ship.destinationLocation,
      estimatedDelivery: ship.estimatedDelivery?.toISOString() || null,
      actualDelivery: ship.actualDelivery?.toISOString() || null,
      updates: ship.updates || [],
      transaction: ship.transaction ? {
        id: ship.transaction.id,
        amount: Number(ship.transaction.amount),
        currency: ship.transaction.currency,
        buyerName: ship.transaction.buyer?.name || ship.transaction.buyer?.companyName,
        supplierName: ship.transaction.supplier?.companyName,
      } : null,
      createdAt: ship.createdAt.toISOString(),
      updatedAt: ship.updatedAt.toISOString(),
    }));
    
    return successResponse(formattedShipments, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    
    const body = await request.json();
    const { id, status, currentLocation, actualDelivery, updateNote } = body;
    
    if (!id) {
      return errorResponse(new Error('Shipment ID is required'), 400);
    }
    
    // Get current shipment
    const currentShipment = await (prisma as any).shipment.findUnique({
      where: { id },
    });
    
    if (!currentShipment) {
      return errorResponse(new Error('Shipment not found'), 404);
    }
    
    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (status) {
      updateData.status = status;
    }
    
    if (currentLocation) {
      updateData.currentLocation = currentLocation;
    }
    
    if (actualDelivery) {
      updateData.actualDelivery = new Date(actualDelivery);
    }
    
    // Add tracking update
    const currentUpdates = currentShipment.updates || [];
    const newUpdate = {
      timestamp: new Date().toISOString(),
      status: status || currentShipment.status,
      location: currentLocation || currentShipment.currentLocation,
      note: updateNote || `Status updated to ${status}`,
      updatedBy: admin.email,
    };
    updateData.updates = [...currentUpdates, newUpdate];
    
    // Update shipment
    const updatedShipment = await (prisma as any).shipment.update({
      where: { id },
      data: updateData,
    });
    
    // Log activity
    await prisma.activity.create({
      data: {
        userId: admin.id,
        type: 'SHIPMENT',
        action: 'SHIPMENT_STATUS_UPDATED',
        description: `Updated shipment ${updatedShipment.trackingNumber} status to ${status}`,
        resourceType: 'shipment',
        resourceId: id,
        metadata: {
          previousStatus: currentShipment.status,
          newStatus: status,
          updatedBy: admin.email,
        },
      },
    });
    
    return successResponse({
      id: updatedShipment.id,
      trackingNumber: updatedShipment.trackingNumber,
      status: updatedShipment.status,
      currentLocation: updatedShipment.currentLocation,
      updatedAt: updatedShipment.updatedAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
