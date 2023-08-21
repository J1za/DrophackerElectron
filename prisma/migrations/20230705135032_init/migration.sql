/*
  Warnings:

  - You are about to drop the column `accountId` on the `CoinBalance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chain,address]` on the table `Coin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `CoinBalance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "apiKey" TEXT,
    "secretKey" TEXT,
    "passphrase" TEXT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoinBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance" TEXT NOT NULL DEFAULT '0',
    "updatedAt" DATETIME NOT NULL,
    "coinId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    CONSTRAINT "CoinBalance_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoinBalance_address_fkey" FOREIGN KEY ("address") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CoinBalance" ("balance", "coinId", "id", "updatedAt") SELECT "balance", "coinId", "id", "updatedAt" FROM "CoinBalance";
DROP TABLE "CoinBalance";
ALTER TABLE "new_CoinBalance" RENAME TO "CoinBalance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Exchange_name_key" ON "Exchange"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_chain_address_key" ON "Coin"("chain", "address");
