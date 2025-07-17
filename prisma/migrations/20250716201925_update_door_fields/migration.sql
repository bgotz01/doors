/*
  Warnings:

  - You are about to drop the column `sizes` on the `doors` table. All the data in the column will be lost.
  - Added the required column `height` to the `doors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `doors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryName` to the `doors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doors" DROP COLUMN "sizes",
ADD COLUMN     "height" TEXT NOT NULL,
ADD COLUMN     "material" TEXT NOT NULL,
ADD COLUMN     "subcategoryName" TEXT NOT NULL,
ADD COLUMN     "widths" TEXT[];
