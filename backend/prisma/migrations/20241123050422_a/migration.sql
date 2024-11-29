/*
  Warnings:

  - The primary key for the `TokenAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[tokenMint]` on the table `TokenAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TokenAccount_userAddress_key";

-- AlterTable
ALTER TABLE "TokenAccount" DROP CONSTRAINT "TokenAccount_pkey",
ADD CONSTRAINT "TokenAccount_pkey" PRIMARY KEY ("tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAccount_tokenMint_key" ON "TokenAccount"("tokenMint");
