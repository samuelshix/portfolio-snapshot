/*
  Warnings:

  - The primary key for the `TokenAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "TokenAccount_tokenMint_key";

-- AlterTable
ALTER TABLE "TokenAccount" DROP CONSTRAINT "TokenAccount_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "TokenAccount_pkey" PRIMARY KEY ("id");
