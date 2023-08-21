-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "privateKey" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "groupId" TEXT,
    CONSTRAINT "Account_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AccountsGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountsGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "CoinBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance" TEXT NOT NULL DEFAULT '0',
    "updatedAt" DATETIME NOT NULL,
    "coinId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "CoinBalance_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoinBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaskStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "chain" TEXT,
    "protocol" TEXT,
    "exchange" TEXT,
    "method" TEXT NOT NULL,
    "args" TEXT NOT NULL,
    CONSTRAINT "TaskStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending'
);

-- CreateTable
CREATE TABLE "ExecutionStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "chain" TEXT,
    "protocol" TEXT,
    "exchange" TEXT,
    "args" TEXT NOT NULL,
    CONSTRAINT "ExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecutionAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    CONSTRAINT "ExecutionAccount_address_fkey" FOREIGN KEY ("address") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExecutionAccount_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "args" TEXT,
    "logs" TEXT,
    "accountExecutionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "previosStepId" TEXT,
    "currentAction" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "StepState_accountExecutionId_fkey" FOREIGN KEY ("accountExecutionId") REFERENCES "ExecutionAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepState_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ExecutionStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepState_previosStepId_fkey" FOREIGN KEY ("previosStepId") REFERENCES "StepState" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepActionState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actionNumber" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "logs" TEXT,
    "stepStateId" TEXT NOT NULL,
    "previosActionId" TEXT,
    CONSTRAINT "StepActionState_stepStateId_fkey" FOREIGN KEY ("stepStateId") REFERENCES "StepState" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepActionState_previosActionId_fkey" FOREIGN KEY ("previosActionId") REFERENCES "StepActionState" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_privateKey_key" ON "Account"("privateKey");

-- CreateIndex
CREATE UNIQUE INDEX "Account_address_key" ON "Account"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_chain_key" ON "Provider"("chain");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_chain_protocol_name_key" ON "Contract"("chain", "protocol", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_chain_symbol_key" ON "Coin"("chain", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStep_taskId_stepNumber_key" ON "TaskStep"("taskId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StepState_previosStepId_key" ON "StepState"("previosStepId");

-- CreateIndex
CREATE UNIQUE INDEX "StepActionState_previosActionId_key" ON "StepActionState"("previosActionId");

-- CreateIndex
CREATE UNIQUE INDEX "StepActionState_stepStateId_actionNumber_key" ON "StepActionState"("stepStateId", "actionNumber");
