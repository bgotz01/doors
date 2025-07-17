// scripts/reattachSupplierPanels.ts

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
    
    // Get all suppliers
    const suppliers = await prisma.supplier.findMany();
    
    if (suppliers.length === 0) {
      console.log('⚠️ No suppliers found in the database');
      return;
    }
    
    // Use the first supplier for simplicity (you can modify this logic as needed)
    const supplier = suppliers[0];
    console.log(`🏢 Using supplier: ${supplier.name} (${supplier.id})`);
    
    // For each original model code, find the new panel models and create supplier panels
    for (const row of records) {
      const originalCode = row.model_code;
      const heightsArray = row.height.split(',').map(h => h.trim());
      
      console.log(`📝 Processing ${originalCode} with heights: ${heightsArray.join(', ')}`);
      
      // For each height variant
      for (const height of heightsArray) {
        const heightCode = height.replace(/[^0-9]/g, '');
        const newCode = `${originalCode}-${heightCode}`;
        
        // Find the panel model with the new code
        const panelModel = await prisma.panelModel.findUnique({
          where: { code: newCode }
        });
        
        if (!panelModel) {
          console.log(`⚠️ Panel model not found: ${newCode}`);
          continue;
        }
        
        // Create supplier panel
        const supplierPanel = await prisma.supplierPanel.create({
          data: {
            supplierId: supplier.id,
            panelModelId: panelModel.id,
            basePrice: 100.00, // Default price, adjust as needed
            isActive: true
          }
        });
        
        console.log(`✅ Created supplier panel for ${newCode} with height ${height}`);
      }
    }
    
    console.log('✨ Supplier panels reattached successfully');
  } catch (error) {
    console.error('❌ Error reattaching supplier panels:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();