import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');
    
    if (!material) {
      return NextResponse.json(
        { error: 'Material is required' },
        { status: 400 }
      );
    }
    
    // Get distinct collections for the specified material
    const panelModels = await prisma.panelModel.findMany({
      where: {
        material: material,
      },
      select: {
        collection: true,
      },
      distinct: ['collection'],
      orderBy: {
        collection: 'asc',
      },
    });
    
    // Format the response
    const collections = panelModels.map(panel => ({
      id: panel.collection, // Using collection name as ID
      name: panel.collection,
      materialId: material,
    }));
    
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}