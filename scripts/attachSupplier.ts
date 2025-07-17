// scripts/attachSupplier.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// Define the supplier ID
const SUPPLIER_ID = 'de068a2e-823e-4ac4-9587-c5f0c0053060';

interface SupplierPanelCsvRow {
  supplier: string;
  model_code: string;
  material: string;
  collection: string;
  height: string;
  widths: string;
  price: string;
}

async function parseCsv(filePath: string): Promise<SupplierPanelCsvRow[]> {
  return new Promise((resolve, reject) => {
    const records: SupplierPanelCsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

// Parse price string like "$1,000 " to number 1000
function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[$,\s]/g, ''));
}

async function main() {
  console.log('🏭 Using existing supplier with ID:', SUPPLIER_ID);
  
  // Verify the supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: { id: SUPPLIER_ID },
  });
  
  if (!supplier) {
    throw new Error(`Supplier with ID ${SUPPLIER_ID} not found`);
  }
  
  console.log(`✅ Found supplier: ${supplier.name}`);
  
  // Read supplier panels from CSV
  const filePath = path.join(__dirname, '../public/data/CobraPanels.csv');
  const records = await parseCsv(filePath);
  console.log(`📋 Found ${records.length} supplier panels in CSV`);
  
  // Process each record
  let count = 0;
  for (const row of records) {
    // Find the panel model by code
    const panelModel = await prisma.panelModel.findUnique({
      where: { code: row.model_code },
    });
    
    if (!panelModel) {
      console.warn(`⚠️ Panel model with code ${row.model_code} not found, skipping`);
      continue;
    }
    
    // Parse the price from the CSV
    const basePrice = parsePrice(row.price);
    
    // Parse widths
    const widths = row.widths.split(',').map(w => w.trim());
    
    // Create price per width as a JSON object
    const pricePerWidth = createPricePerWidth(widths, basePrice);
    
    // Create or update the supplier panel
    await prisma.supplierPanel.upsert({
      where: {
        supplierId_panelModelId: {
          supplierId: SUPPLIER_ID,
          panelModelId: panelModel.id,
        },
      },
      update: {
        basePrice,
        pricePerWidth,
        leadTime: '2-3 weeks',
        isActive: true,
      },
      create: {
        supplierId: SUPPLIER_ID,
        panelModelId: panelModel.id,
        basePrice,
        pricePerWidth,
        leadTime: '2-3 weeks',
        isActive: true,
      },
    });
    
    count++;
    if (count % 10 === 0) {
      console.log(`✅ Processed ${count}/${records.length} supplier panels`);
    }
  }
  
  console.log(`🎉 Successfully created/updated ${count} supplier panels for ${supplier.name}`);
}

// Helper function to create price per width JSON
function createPricePerWidth(widths: string[], basePrice: number): Record<string, number> {
  const pricePerWidth: Record<string, number> = {};
  
  widths.forEach(width => {
    // For now, use the same base price for all widths
    // You can adjust this logic if different widths have different prices
    pricePerWidth[width] = basePrice;
  });
  
  return pricePerWidth;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });