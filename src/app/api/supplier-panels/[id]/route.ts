// src/app/api/supplier-panels/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { basePrice, pricePerWidth, isActive } = body;

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Supplier panel ID is required' },
        { status: 400 }
      );
    }

    // Get the current supplier panel
    const supplierPanel = await prisma.supplierPanel.findUnique({
      where: { id },
    });

    if (!supplierPanel) {
      return NextResponse.json(
        { error: 'Supplier panel not found' },
        { status: 404 }
      );
    }

    // Update the supplier panel
    const updatedSupplierPanel = await prisma.supplierPanel.update({
      where: { id },
      data: {
        basePrice,
        pricePerWidth,
        isActive,
      },
    });

    return NextResponse.json(updatedSupplierPanel);
  } catch (error) {
    console.error('Error updating supplier panel:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier panel' },
      { status: 500 }
    );
  }
}