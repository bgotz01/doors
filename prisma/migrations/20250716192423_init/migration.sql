-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "sizes" TEXT[],
    "basePrice" DOUBLE PRECISION,
    "pricePerSize" JSONB,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "door_images" (
    "id" TEXT NOT NULL,
    "doorId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "door_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "installation" BOOLEAN NOT NULL DEFAULT false,
    "installationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delivery" BOOLEAN NOT NULL DEFAULT false,
    "deliveryCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "doorId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "finish" TEXT,
    "hardware" TEXT,
    "glassInsert" BOOLEAN NOT NULL DEFAULT false,
    "glassType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_categoryId_name_key" ON "subcategories"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "doors_subcategoryId_name_key" ON "doors"("subcategoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quoteNumber_key" ON "quotes"("quoteNumber");

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doors" ADD CONSTRAINT "doors_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "door_images" ADD CONSTRAINT "door_images_doorId_fkey" FOREIGN KEY ("doorId") REFERENCES "doors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_doorId_fkey" FOREIGN KEY ("doorId") REFERENCES "doors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
