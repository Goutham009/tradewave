import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Mock templates storage (in production, use database)
const templatesStore: Map<string, any[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supplierId = session.user?.id || 'supplier-001';
    
    // In production, fetch from database
    const templates = templatesStore.get(supplierId) || [
      {
        id: 'tpl-001',
        supplierId,
        name: 'Standard Electronics Quote',
        productCategory: 'Electronics',
        basePrice: 25.50,
        deliveryTime: 14,
        paymentTerms: '30% Advance, 70% on Delivery',
        notes: 'Includes standard warranty. MOQ applies.',
        usageCount: 24,
        lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tpl-002',
        supplierId,
        name: 'Bulk Order Template',
        productCategory: 'Industrial',
        basePrice: 18.75,
        deliveryTime: 21,
        paymentTerms: '50% Advance, 50% on Delivery',
        notes: 'Volume discounts available for orders over 10,000 units.',
        usageCount: 12,
        lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Fetch templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      name,
      productCategory,
      basePrice,
      deliveryTime,
      paymentTerms,
      notes,
    } = await request.json();

    if (!name || !productCategory || !basePrice || !deliveryTime || !paymentTerms) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const supplierId = session.user?.id || 'supplier-001';

    // In production, save to database
    const template = {
      id: `tpl-${Date.now()}`,
      supplierId,
      name,
      productCategory,
      basePrice: parseFloat(basePrice),
      deliveryTime: parseInt(deliveryTime),
      paymentTerms,
      notes: notes || '',
      usageCount: 0,
      lastUsedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Store in memory (demo)
    const existing = templatesStore.get(supplierId) || [];
    templatesStore.set(supplierId, [...existing, template]);

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
