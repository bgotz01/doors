// scripts/fixPanelHeights.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface PanelCsvRow {
  model_code: string;
  material: string;
  collection: string;
  height: string;
  widths: string;
}

const prisma = new PrismaClient();

async function parseCsv(filePath: string): Promise<PanelCsvRow[]> {
  return new Promise((resolve, reject) => {
    const records: PanelCsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

async function main() {
  try {
    const filePath = path.join(__dirname, '../public/data/modify.csv');
    const records = await parseCsv(filePath);
    
    // Get the model codes to delete
    const modelCodesToDelete = records.map(row => row.model_code);
    console.log(`🔍 Found ${modelCodesToDelete.length} panel models to fix:`, modelCodesToDelete);
    
    // First, find all panel models to get their IDs
    const panelModels = await prisma.panelModel.findMany({
      where: {
        code: {
          in: modelCodesToDelete
        }
      },
      include: {
        supplierPanels: true
      }
    });
    
    console.log(`📊 Found ${panelModels.length} panel models in database`);
    
    // Delete related supplier panels first
    for (const panel of panelModels) {
      if (panel.supplierPanels.length > 0) {
        console.log(`🔗 Deleting ${panel.supplierPanels.length} supplier panels for ${panel.code}`);
        await prisma.supplierPanel.deleteMany({
          where: {
            panelModelId: panel.id
          }
        });
      }
    }
    
    // Now delete the panel models
    const deleteResult = await prisma.panelModel.deleteMany({
      where: {
        code: {
          in: modelCodesToDelete
        }
      }
    });
    
    console.log(`🗑️ Deleted ${deleteResult.count} panel models`);
    
    // Create new panel models with proper height arrays
    for (const row of records) {
      const widthsArray = row.widths.split(',').map(w => w.trim());
      const heightsArray = row.height.split(',').map(h => h.trim());
      
      console.log(`📝 Processing ${row.model_code} with heights: ${heightsArray.join(', ')}`);
      
      // Create a separate panel model for each height
      for (const height of heightsArray) {
        // Create a unique code for each height variant
        // For example: "HAR BS05-68" for 6'8" and "HAR BS05-80" for 8'0"
        const heightCode = height.replace(/[^0-9]/g, '');
        const code = `${row.model_code}-${heightCode}`;
        
        await prisma.panelModel.create({
          data: {
            code,
            name: row.model_code, // Using model_code as name
            material: row.material,
            collection: row.collection,
            height,
            widths: widthsArray,
            description: null,
            imageUrl: null,
          },
        });
        
        console.log(`✅ Created panel model: ${code} with height ${height}`);
      }
    }
    
    console.log('✨ Panel height fix completed successfully');
  } catch (error) {
    console.error('❌ Error fixing panel heights:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();