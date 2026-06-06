-- E22/E23 Phase 2: API telemetry + tenant subscriptions

CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED');

CREATE TABLE "platform_api_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "user_id" TEXT,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_api_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_tier" "PlanTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "monthly_price_minor" INTEGER NOT NULL,
    "billing_cycle_start" TIMESTAMP(3) NOT NULL,
    "billing_cycle_end" TIMESTAMP(3) NOT NULL,
    "next_bill_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "usage_metrics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscriptions_tenant_id_key" ON "subscriptions"("tenant_id");
CREATE INDEX "platform_api_logs_tenant_id_created_at_idx" ON "platform_api_logs"("tenant_id", "created_at");
CREATE INDEX "platform_api_logs_created_at_idx" ON "platform_api_logs"("created_at");
CREATE INDEX "platform_api_logs_endpoint_idx" ON "platform_api_logs"("endpoint");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "subscriptions_next_bill_date_idx" ON "subscriptions"("next_bill_date");

ALTER TABLE "platform_api_logs" ADD CONSTRAINT "platform_api_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill subscriptions for existing tenants
INSERT INTO "subscriptions" (
    "id",
    "tenant_id",
    "plan_tier",
    "status",
    "monthly_price_minor",
    "billing_cycle_start",
    "billing_cycle_end",
    "next_bill_date",
    "auto_renew",
    "created_at",
    "updated_at"
)
SELECT
    concat('sub_', t."id"),
    t."id",
    t."plan_tier",
    CASE
        WHEN t."plan_status" = 'TRIAL' THEN 'TRIAL'::"SubscriptionStatus"
        WHEN t."plan_status" = 'SUSPENDED' THEN 'SUSPENDED'::"SubscriptionStatus"
        WHEN t."plan_status" = 'CANCELLED' THEN 'CANCELLED'::"SubscriptionStatus"
        WHEN t."plan_tier" = 'FREE' THEN 'TRIAL'::"SubscriptionStatus"
        ELSE 'ACTIVE'::"SubscriptionStatus"
    END,
    CASE t."plan_tier"
        WHEN 'PRO' THEN 990000
        WHEN 'ENTERPRISE' THEN 2990000
        ELSE 0
    END,
    date_trunc('month', NOW()),
    (date_trunc('month', NOW()) + interval '1 month' - interval '1 millisecond'),
    CASE
        WHEN t."plan_tier" = 'FREE' THEN NULL
        ELSE (date_trunc('month', NOW()) + interval '1 month')
    END,
    true,
    NOW(),
    NOW()
FROM "tenants" t
WHERE NOT EXISTS (
    SELECT 1 FROM "subscriptions" s WHERE s."tenant_id" = t."id"
);
