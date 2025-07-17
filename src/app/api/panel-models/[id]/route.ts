// src/app/api/panel-models/[id]/route.ts

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
    const { widths } = body;

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Panel model ID is required' },
        { status: 400 }
      );
    }

    if (!widths || !Array.isArray(widths)) {
      return NextResponse.json(
        { error: 'Widths must be an array' },
        { status: 400 }
      );
    }

    // Get the current panel model
    const panelModel = await prisma.panelModel.findUnique({
      where: { id },
    });

    if (!panelModel) {
      return NextResponse.json(
        { error: 'Panel model not found' },
        { status: 404 }
      );
    }

    // Update the panel model with the new widths
    // Make sure we don't have duplicates
    const uniqueWidths = [...new Set([...panelModel.widths, ...widths])];

    const updatedPanelModel = await prisma.panelModel.update({
      where: { id },
      data: {
        widths: uniqueWidths,
      },
    });

    return NextResponse.json(updatedPanelModel);
  } catch (error) {
    console.error('Error updating panel model:', error);
    return NextResponse.json(
      { error: 'Failed to update panel model' },
      { status: 500 }
    );
  }
}