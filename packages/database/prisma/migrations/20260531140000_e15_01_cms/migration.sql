-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SiteMediaKind" AS ENUM ('HERO', 'FEATURED', 'FOOTER_PAYMENT');

-- CreateTable
CREATE TABLE "site_profiles" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "company_name" TEXT NOT NULL,
    "tagline" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "trade_license_no" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_themes" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "primary_color" TEXT NOT NULL,
    "font_family" TEXT NOT NULL DEFAULT 'Inter',
    "palette_json" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body_markdown" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_media" (
    "id" TEXT NOT NULL,
    "kind" "SiteMediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_routes" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "contact_lines" JSONB NOT NULL,
    "email" TEXT NOT NULL,
    "payment_banner_url" TEXT,
    "bar_links" JSONB NOT NULL,
    "powered_by_text" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_pages_slug_idx" ON "content_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_pages_slug_status_key" ON "content_pages"("slug", "status");

-- CreateIndex
CREATE INDEX "site_media_kind_status_idx" ON "site_media"("kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "site_media_kind_sort_order_status_key" ON "site_media"("kind", "sort_order", "status");

-- CreateIndex
CREATE INDEX "featured_routes_status_sort_order_idx" ON "featured_routes"("status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "featured_routes_route_id_status_key" ON "featured_routes"("route_id", "status");

-- AddForeignKey
ALTER TABLE "featured_routes" ADD CONSTRAINT "featured_routes_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
