//scripts/seedPanels.ts

// scripts/seedPanels.ts

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
  const filePath = path.join(__dirname, '../public/data/panels.csv');
  const records = await parseCsv(filePath);

  for (const row of records) {
    if (!row.model_code) {
      console.warn('⚠️ Skipping row with missing model_code:', row);
      continue;
    }
  
    const widthsArray = row.widths.split(',').map((w) => w.trim());
    
    // Parse heights as an array if they contain commas
    const heightsArray = row.height.includes(',') 
      ? row.height.split(',').map((h) => h.trim()) 
      : [row.height.trim()];
    
    // Create a separate panel model for each height
    for (const height of heightsArray) {
      const code = heightsArray.length > 1 
        ? `${row.model_code}-${height.replace("'", "").replace('"', "").replace('.', "")}` 
        : row.model_code;
        
      await prisma.panelModel.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: row.model_code, // Using model_code as name since name isn't in CSV
          material: row.material,
          collection: row.collection,
          height,
          widths: widthsArray,
          description: null,
          imageUrl: null,
        },
      });
    }
  }
  

  console.log(`✅ Seeded ${records.length} panel models.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
