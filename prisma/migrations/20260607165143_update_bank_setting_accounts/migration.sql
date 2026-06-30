-- AlterEnum
ALTER TYPE "BankType" ADD VALUE 'PULSA';

-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "adminFee" TEXT;
