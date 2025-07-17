import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface CSVRow {
  Category: string;
  Subcategory: string;
  Height: string;
  Name: string;
  Widths: string;
  Price: string;
}

async function main() {
  console.log('🌱 Starting fresh seed...');

  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.doorImage.deleteMany();
  await prisma.door.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  const csvPath = path.join(process.cwd(), 'public', 'data', 'collection.csv');
  const results: CSVRow[] = [];

  // Read CSV file using proper parser
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: CSVRow) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Processing ${results.length} doors from CSV...`);

  for (const row of results) {
    const { Category: category, Subcategory: subcategory, Height: height, Name: name, Widths: widths, Price: price } = row;
    
    // Skip if we don't have required data
    if (!category || !subcategory || !height || !name) {
      console.log(`⚠️ Skipping incomplete row: ${JSON.stringify(row)}`);
      continue;
    }
    
    // Parse widths - handle both quoted arrays and single values
    let widthArray: string[] = [];
    if (widths) {
      if (widths.includes(',')) {
        // It's an array like "32, 34, 36, 40, 42"
        widthArray = widths.split(',').map(s => s.trim());
      } else {
        // It's a single value like "36"
        widthArray = [widths.trim()];
      }
    }
    
    // Parse price (remove $ and any extra spaces, convert to number)
    const basePrice = price ? parseFloat(price.replace(/[$\s]/g, '')) : 500;
    
    try {
      // Create or find category
      const categoryRecord = await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { name: category },
      });
      
      // Create or find subcategory (just the material name)
      const subcategoryRecord = await prisma.subcategory.upsert({
        where: { 
          categoryId_name: { 
            categoryId: categoryRecord.id, 
            name: subcategory 
          } 
        },
        update: {},
        create: { 
          name: subcategory,
          categoryId: categoryRecord.id 
        },
      });
      
      // Create door
      await prisma.door.upsert({
        where: { 
          subcategoryId_name: { 
            subcategoryId: subcategoryRecord.id, 
            name: name 
          } 
        },
        update: {
          widths: widthArray,
          subcategoryName: subcategory,
          categoryName: category,
          material: subcategory.toLowerCase(),
          height: height,
          basePrice: basePrice,
        },
        create: {
          name: name,
          subcategoryId: subcategoryRecord.id,
          subcategoryName: subcategory,
          categoryName: category,
          material: subcategory.toLowerCase(),
          height: height,
          widths: widthArray,
          basePrice: basePrice,
        },
      });
      
      console.log(`✅ Created door: ${name} (${category} > ${subcategory} > ${height}) - Widths: [${widthArray.join(', ')}] - $${basePrice}`);
    } catch (error) {
      console.error(`❌ Error creating door ${name}:`, error);
    }
  }
  
  console.log('🎉 Fresh seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });