/*
  Warnings:

  - A unique constraint covering the columns `[executionId,address]` on the table `ExecutionAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Provider" ADD COLUMN "gasPercent" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionAccount_executionId_address_key" ON "ExecutionAccount"("executionId", "address");
