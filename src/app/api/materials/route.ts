import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get distinct materials from panel models
    const panelModels = await prisma.panelModel.findMany({
      select: {
        material: true,
      },
      distinct: ['material'],
      orderBy: {
        material: 'asc',
      },
    });
    
    // Format the response
    const materials = panelModels.map(panel => ({
      id: panel.material, // Using material name as ID
      name: panel.material,
    }));
    
    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}