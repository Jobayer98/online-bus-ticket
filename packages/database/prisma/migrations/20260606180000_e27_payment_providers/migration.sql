-- CreateEnum
CREATE TYPE "PaymentProviderCode" AS ENUM ('BKASH', 'SSLCOMMERZ');

-- CreateEnum
CREATE TYPE "PaymentSettlementRoute" AS ENUM ('TENANT_DIRECT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "LedgerReferenceType" AS ENUM ('BOOKING_PAYMENT', 'WITHDRAWAL', 'WITHDRAWAL_REVERSAL');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateTable
CREATE TABLE "system_payment_providers" (
    "id" TEXT NOT NULL,
    "code" "PaymentProviderCode" NOT NULL,
    "display_name" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "credentials_encrypted" TEXT,
    "sandbox_mode" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_payment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_payment_providers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" "PaymentProviderCode" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "credentials_encrypted" TEXT,
    "sandbox_mode" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_payment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_wallets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "balance_minor" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_ledger_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "balance_after_minor" INTEGER NOT NULL,
    "reference_type" "LedgerReferenceType" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_bank_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number_encrypted" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_payment_providers_code_key" ON "system_payment_providers"("code");

CREATE UNIQUE INDEX "tenant_payment_providers_tenant_id_code_key" ON "tenant_payment_providers"("tenant_id", "code");

CREATE INDEX "tenant_payment_providers_tenant_id_idx" ON "tenant_payment_providers"("tenant_id");

CREATE UNIQUE INDEX "tenant_wallets_tenant_id_key" ON "tenant_wallets"("tenant_id");

CREATE INDEX "tenant_ledger_entries_tenant_id_created_at_idx" ON "tenant_ledger_entries"("tenant_id", "created_at");

CREATE INDEX "tenant_bank_accounts_tenant_id_idx" ON "tenant_bank_accounts"("tenant_id");

CREATE INDEX "withdrawal_requests_tenant_id_status_idx" ON "withdrawal_requests"("tenant_id", "status");

-- AlterTable payments
ALTER TABLE "payments" ADD COLUMN "platform_invoice_id" TEXT,
ADD COLUMN "provider_code" "PaymentProviderCode",
ADD COLUMN "settlement_route" "PaymentSettlementRoute",
ADD COLUMN "provider_session_id" TEXT,
ADD COLUMN "system_provider_id" TEXT,
ADD COLUMN "tenant_provider_id" TEXT;

ALTER TABLE "payments" ALTER COLUMN "booking_id" DROP NOT NULL;

CREATE UNIQUE INDEX "payments_platform_invoice_id_key" ON "payments"("platform_invoice_id");

CREATE UNIQUE INDEX "payments_provider_ref_key" ON "payments"("provider_ref");

-- AddForeignKey
ALTER TABLE "tenant_payment_providers" ADD CONSTRAINT "tenant_payment_providers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_wallets" ADD CONSTRAINT "tenant_wallets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_ledger_entries" ADD CONSTRAINT "tenant_ledger_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_bank_accounts" ADD CONSTRAINT "tenant_bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "tenant_bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_platform_invoice_id_fkey" FOREIGN KEY ("platform_invoice_id") REFERENCES "platform_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_system_provider_id_fkey" FOREIGN KEY ("system_provider_id") REFERENCES "system_payment_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_provider_id_fkey" FOREIGN KEY ("tenant_provider_id") REFERENCES "tenant_payment_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default system providers (disabled until configured)
INSERT INTO "system_payment_providers" ("id", "code", "display_name", "is_enabled", "sandbox_mode", "created_at", "updated_at")
VALUES
  ('sys_prov_bkash', 'BKASH', 'bKash', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sys_prov_ssl', 'SSLCOMMERZ', 'SSLCommerz', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
