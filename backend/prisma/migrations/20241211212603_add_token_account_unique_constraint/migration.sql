/*
  Warnings:

  - A unique constraint covering the columns `[userAddress,tokenMint]` on the table `TokenAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TokenAccount_userAddress_tokenMint_key" ON "TokenAccount"("userAddress", "tokenMint");
