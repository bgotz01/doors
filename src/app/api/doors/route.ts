import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategoryId');
    
    if (!subcategoryId) {
      return NextResponse.json(
        { error: 'Subcategory ID is required' },
        { status: 400 }
      );
    }
    
    const doors = await prisma.door.findMany({
      where: { 
        subcategoryId,
        isActive: true 
      },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(doors);
  } catch (error) {
    console.error('Error fetching doors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doors' },
      { status: 500 }
    );
  }
}