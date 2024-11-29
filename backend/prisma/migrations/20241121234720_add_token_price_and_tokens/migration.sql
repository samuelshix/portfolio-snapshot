/*
  Warnings:

  - You are about to drop the column `price` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "TokenPrice" (
    "tokenMint" TEXT NOT NULL,

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("tokenMint")
);

-- AddForeignKey
ALTER TABLE "TokenPrice" ADD CONSTRAINT "TokenPrice_tokenMint_fkey" FOREIGN KEY ("tokenMint") REFERENCES "Token"("mint") ON DELETE RESTRICT ON UPDATE CASCADE;
