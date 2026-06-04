-- E16-01: Add SUPER_ADMIN to Role enum + PlanTier, PlanStatus, TenantMemberRole enums
-- E16-02: Add Tenant + TenantMembership models + tenantId to all scoped models

-- AlterEnum: Add SUPER_ADMIN to Role
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenantMemberRole" AS ENUM ('ADMIN', 'COUNTER_SELLER');

-- CreateTable: tenants
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subdomain_prefix" TEXT NOT NULL,
    "custom_domain" TEXT,
    "plan_tier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "plan_status" "PlanStatus" NOT NULL DEFAULT 'TRIAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: tenant_memberships
CREATE TABLE "tenant_memberships" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "TenantMemberRole" NOT NULL,

    CONSTRAINT "tenant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for tenants
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "tenants_subdomain_prefix_key" ON "tenants"("subdomain_prefix");
CREATE UNIQUE INDEX "tenants_custom_domain_key" ON "tenants"("custom_domain");
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX "tenants_subdomain_prefix_idx" ON "tenants"("subdomain_prefix");

-- CreateIndex for tenant_memberships
CREATE UNIQUE INDEX "tenant_memberships_tenant_id_user_id_key" ON "tenant_memberships"("tenant_id", "user_id");
CREATE INDEX "tenant_memberships_tenant_id_idx" ON "tenant_memberships"("tenant_id");
CREATE INDEX "tenant_memberships_user_id_idx" ON "tenant_memberships"("user_id");

-- AddForeignKey for tenant_memberships
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to stops
ALTER TABLE "stops" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "stops_tenant_id_idx" ON "stops"("tenant_id");
ALTER TABLE "stops" ADD CONSTRAINT "stops_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to routes
ALTER TABLE "routes" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "routes_tenant_id_idx" ON "routes"("tenant_id");
ALTER TABLE "routes" ADD CONSTRAINT "routes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to coaches
ALTER TABLE "coaches" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "coaches_tenant_id_idx" ON "coaches"("tenant_id");
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to seat_layouts
ALTER TABLE "seat_layouts" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "seat_layouts_tenant_id_idx" ON "seat_layouts"("tenant_id");
ALTER TABLE "seat_layouts" ADD CONSTRAINT "seat_layouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to schedules
ALTER TABLE "schedules" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "schedules_tenant_id_idx" ON "schedules"("tenant_id");
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to bookings
ALTER TABLE "bookings" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "bookings_tenant_id_idx" ON "bookings"("tenant_id");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to counter_transactions
ALTER TABLE "counter_transactions" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "counter_transactions_tenant_id_idx" ON "counter_transactions"("tenant_id");
ALTER TABLE "counter_transactions" ADD CONSTRAINT "counter_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to notification_logs
ALTER TABLE "notification_logs" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "notification_logs_tenant_id_idx" ON "notification_logs"("tenant_id");
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to site_profiles (nullable - backfilled by seed)
ALTER TABLE "site_profiles" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "site_profiles_tenant_id_idx" ON "site_profiles"("tenant_id");
ALTER TABLE "site_profiles" ADD CONSTRAINT "site_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to site_themes (nullable - backfilled by seed)
ALTER TABLE "site_themes" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "site_themes_tenant_id_idx" ON "site_themes"("tenant_id");
ALTER TABLE "site_themes" ADD CONSTRAINT "site_themes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to content_pages (nullable - backfilled by seed)
ALTER TABLE "content_pages" ADD COLUMN "tenant_id" TEXT;
-- Drop old unique constraint before adding new one
ALTER TABLE "content_pages" DROP CONSTRAINT IF EXISTS "content_pages_slug_status_key";
CREATE UNIQUE INDEX "content_pages_tenant_id_slug_status_key" ON "content_pages"("tenant_id", "slug", "status");
CREATE INDEX "content_pages_tenant_id_idx" ON "content_pages"("tenant_id");
CREATE INDEX "content_pages_tenant_id_slug_idx" ON "content_pages"("tenant_id", "slug");
ALTER TABLE "content_pages" ADD CONSTRAINT "content_pages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to site_media (nullable - backfilled by seed)
ALTER TABLE "site_media" ADD COLUMN "tenant_id" TEXT;
-- Drop old unique constraint before adding new one
ALTER TABLE "site_media" DROP CONSTRAINT IF EXISTS "site_media_kind_sort_order_status_key";
CREATE UNIQUE INDEX "site_media_tenant_id_kind_sort_order_status_key" ON "site_media"("tenant_id", "kind", "sort_order", "status");
CREATE INDEX "site_media_tenant_id_idx" ON "site_media"("tenant_id");
CREATE INDEX "site_media_tenant_id_kind_status_idx" ON "site_media"("tenant_id", "kind", "status");
ALTER TABLE "site_media" ADD CONSTRAINT "site_media_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to featured_routes (nullable - backfilled by seed)
ALTER TABLE "featured_routes" ADD COLUMN "tenant_id" TEXT;
-- Drop old unique constraint before adding new one
ALTER TABLE "featured_routes" DROP CONSTRAINT IF EXISTS "featured_routes_route_id_status_key";
CREATE UNIQUE INDEX "featured_routes_tenant_id_route_id_status_key" ON "featured_routes"("tenant_id", "route_id", "status");
CREATE INDEX "featured_routes_tenant_id_idx" ON "featured_routes"("tenant_id");
CREATE INDEX "featured_routes_tenant_id_status_sort_order_idx" ON "featured_routes"("tenant_id", "status", "sort_order");
ALTER TABLE "featured_routes" ADD CONSTRAINT "featured_routes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add tenantId to footer_settings (nullable - backfilled by seed)
ALTER TABLE "footer_settings" ADD COLUMN "tenant_id" TEXT;
CREATE INDEX "footer_settings_tenant_id_idx" ON "footer_settings"("tenant_id");
ALTER TABLE "footer_settings" ADD CONSTRAINT "footer_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
