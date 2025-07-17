/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `door_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quote_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quotes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subcategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('PANEL', 'FRAME', 'TRANSOM', 'SIDE_LITE', 'GLASS_LITE', 'HARDWARE', 'FINISH', 'ADDITIONAL', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "door_images" DROP CONSTRAINT "door_images_doorId_fkey";

-- DropForeignKey
ALTER TABLE "doors" DROP CONSTRAINT "doors_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_doorId_fkey";

-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "subcategories" DROP CONSTRAINT "subcategories_categoryId_fkey";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "door_images";

-- DropTable
DROP TABLE "doors";

-- DropTable
DROP TABLE "quote_items";

-- DropTable
DROP TABLE "quotes";

-- DropTable
DROP TABLE "subcategories";

-- DropEnum
DROP TYPE "QuoteStatus";

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panel_models" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "widths" TEXT[],
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panel_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_panels" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "panelModelId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION,
    "pricePerWidth" JSONB,
    "leadTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glass_designs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "privacyRating" INTEGER NOT NULL,
    "camingOptions" TEXT[],
    "styleFeatures" TEXT,
    "compatibleWith" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glass_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ComponentType" NOT NULL,
    "pricingType" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_options" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "leadTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "door_systems" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "panelId" TEXT NOT NULL,
    "glassId" TEXT,
    "width" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "door_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GlassDesignToPanelModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GlassDesignToPanelModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DoorSystemToSupplierOption" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DoorSystemToSupplierOption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "panel_models_code_key" ON "panel_models"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_panels_supplierId_panelModelId_key" ON "supplier_panels"("supplierId", "panelModelId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_options_supplierId_optionId_key" ON "supplier_options"("supplierId", "optionId");

-- CreateIndex
CREATE INDEX "_GlassDesignToPanelModel_B_index" ON "_GlassDesignToPanelModel"("B");

-- CreateIndex
CREATE INDEX "_DoorSystemToSupplierOption_B_index" ON "_DoorSystemToSupplierOption"("B");

-- AddForeignKey
ALTER TABLE "supplier_panels" ADD CONSTRAINT "supplier_panels_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_panels" ADD CONSTRAINT "supplier_panels_panelModelId_fkey" FOREIGN KEY ("panelModelId") REFERENCES "panel_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_options" ADD CONSTRAINT "supplier_options_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_options" ADD CONSTRAINT "supplier_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "custom_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "door_systems" ADD CONSTRAINT "door_systems_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "door_systems" ADD CONSTRAINT "door_systems_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "supplier_panels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "door_systems" ADD CONSTRAINT "door_systems_glassId_fkey" FOREIGN KEY ("glassId") REFERENCES "glass_designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlassDesignToPanelModel" ADD CONSTRAINT "_GlassDesignToPanelModel_A_fkey" FOREIGN KEY ("A") REFERENCES "glass_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlassDesignToPanelModel" ADD CONSTRAINT "_GlassDesignToPanelModel_B_fkey" FOREIGN KEY ("B") REFERENCES "panel_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoorSystemToSupplierOption" ADD CONSTRAINT "_DoorSystemToSupplierOption_A_fkey" FOREIGN KEY ("A") REFERENCES "door_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoorSystemToSupplierOption" ADD CONSTRAINT "_DoorSystemToSupplierOption_B_fkey" FOREIGN KEY ("B") REFERENCES "supplier_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
