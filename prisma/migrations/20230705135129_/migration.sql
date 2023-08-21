/*
  Warnings:

  - A unique constraint covering the columns `[chain,address]` on the table `Coin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Coin_chain_address_key" ON "Coin"("chain", "address");
