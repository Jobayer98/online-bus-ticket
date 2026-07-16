-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";

-- DropIndex
DROP INDEX "featured_routes_status_sort_order_idx";

-- DropIndex
DROP INDEX "site_media_kind_status_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "passenger_gender" TEXT;

-- AlterTable
ALTER TABLE "footer_settings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "site_profiles" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "site_themes" ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "payments_provider_ref_idx" ON "payments"("provider_ref");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
