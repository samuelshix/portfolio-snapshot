/*
  Warnings:

  - Added the required column `timestamp` to the `TokenPrice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenPrice" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;
