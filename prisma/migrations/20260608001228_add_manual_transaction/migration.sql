-- CreateEnum
CREATE TYPE "ManualTransactionMethod" AS ENUM ('BANK', 'EWALLET', 'PULSA');

-- CreateEnum
CREATE TYPE "ManualTransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ManualTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'DEPOSIT',
    "method" "ManualTransactionMethod" NOT NULL,
    "status" "ManualTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,2) NOT NULL,
    "originAccount" TEXT,
    "targetBankId" TEXT,
    "targetAccount" TEXT,
    "serialNumber" TEXT,
    "adminFee" TEXT,
    "proofUrl" TEXT,
    "rejectReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualTransaction_tenantId_status_idx" ON "ManualTransaction"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ManualTransaction_tenantId_username_idx" ON "ManualTransaction"("tenantId", "username");

-- AddForeignKey
ALTER TABLE "ManualTransaction" ADD CONSTRAINT "ManualTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualTransaction" ADD CONSTRAINT "ManualTransaction_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
