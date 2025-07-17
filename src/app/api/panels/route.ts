//app/api/panels/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');
    const collection = searchParams.get('collection');
    const supplierId = searchParams.get('supplierId');

    // Base query for panel models
    const where: Prisma.PanelModelWhereInput = {};

    if (material) {
      where.material = material;
    }

    if (collection) {
      where.collection = collection;
    }

    // If supplierId is provided, we need to filter panels that have a relationship with this supplier
    if (supplierId) {
      where.supplierPanels = {
        some: {
          supplierId: supplierId,
          isActive: true,
        }
      };
    }

    const panels = await prisma.panelModel.findMany({
      where,
      include: {
        supplierPanels: {
          include: {
            supplier: true,
          },
          // If supplierId is provided, only include panels from that supplier
          ...(supplierId ? { where: { supplierId } } : {}),
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(panels);
  } catch (error) {
    console.error('Error fetching panels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch panels' },
      { status: 500 }
    );
  }
}
