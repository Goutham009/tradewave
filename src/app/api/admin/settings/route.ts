import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const settings = await (prisma as any).adminSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    
    const formattedSettings = settings.map((setting: any) => ({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      category: setting.category,
      updatedBy: setting.updatedBy,
      updatedAt: setting.updatedAt.toISOString(),
    }));
    
    return successResponse(formattedSettings);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    
    const body = await request.json();
    const { settings } = body;
    
    if (!settings || !Array.isArray(settings)) {
      return errorResponse(new Error('Settings array is required'), 400);
    }
    
    const validKeys = [
      'TRANSACTION_FEE',
      'KYC_REQUIRED',
      'DISPUTE_RESOLUTION_DAYS',
      'ESCROW_REQUIRED',
      'MIN_TRANSACTION_AMOUNT',
      'MAX_TRANSACTION_AMOUNT',
      'KYC_THRESHOLD',
    ];
    
    const updatedSettings = [];
    const changes: any[] = [];
    
    for (const setting of settings) {
      if (!setting.key || !validKeys.includes(setting.key)) {
        continue;
      }
      
      // Get current value
      const currentSetting = await (prisma as any).adminSetting.findUnique({
        where: { key: setting.key },
      });
      
      const previousValue = currentSetting?.value || null;
      
      // Upsert setting
      const updated = await (prisma as any).adminSetting.upsert({
        where: { key: setting.key },
        update: {
          value: String(setting.value),
          description: setting.description,
          category: setting.category,
          updatedBy: admin.id,
        },
        create: {
          key: setting.key,
          value: String(setting.value),
          description: setting.description || `${setting.key} setting`,
          category: setting.category || 'GENERAL',
          updatedBy: admin.id,
        },
      });
      
      updatedSettings.push(updated);
      
      if (previousValue !== String(setting.value)) {
        changes.push({
          key: setting.key,
          previousValue,
          newValue: setting.value,
        });
      }
    }
    
    // Log activity
    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM',
          action: 'SETTINGS_UPDATED',
          description: `Updated ${changes.length} admin settings`,
          resourceType: 'settings',
          metadata: { changes },
        },
      });
      
      // Log security event
      await (prisma as any).securityLog.create({
        data: {
          userId: admin.id,
          eventType: 'SETTINGS_CHANGED',
          details: { changes, updatedBy: admin.email },
        },
      });
    }
    
    return successResponse({
      updated: updatedSettings.length,
      settings: updatedSettings.map((s: any) => ({
        id: s.id,
        key: s.key,
        value: s.value,
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
