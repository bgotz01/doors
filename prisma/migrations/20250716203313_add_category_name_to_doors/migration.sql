/*
  Warnings:

  - Added the required column `categoryName` to the `doors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doors" ADD COLUMN     "categoryName" TEXT NOT NULL;
