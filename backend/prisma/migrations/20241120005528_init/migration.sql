-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "TokenAccount" (
    "userAddress" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TokenAccount_pkey" PRIMARY KEY ("userAddress")
);

-- CreateTable
CREATE TABLE "Token" (
    "mint" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "logoUri" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("mint")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAccount_userAddress_key" ON "TokenAccount"("userAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Token_mint_key" ON "Token"("mint");

-- AddForeignKey
ALTER TABLE "TokenAccount" ADD CONSTRAINT "TokenAccount_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
