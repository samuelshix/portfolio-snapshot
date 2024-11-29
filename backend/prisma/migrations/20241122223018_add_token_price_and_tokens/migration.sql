/*
  Warnings:

  - The primary key for the `TokenPrice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `price` to the `TokenPrice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenPrice" DROP CONSTRAINT "TokenPrice_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("id");
