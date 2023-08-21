/*
  Warnings:

  - You are about to drop the column `apiKey` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `passphrase` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `secretKey` on the `Exchange` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exchange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "credentials" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_Exchange" ("id", "name", "url") SELECT "id", "name", "url" FROM "Exchange";
DROP TABLE "Exchange";
ALTER TABLE "new_Exchange" RENAME TO "Exchange";
CREATE UNIQUE INDEX "Exchange_name_key" ON "Exchange"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
