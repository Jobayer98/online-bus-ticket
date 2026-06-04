-- Drop old unique indexes that were renamed in E16-02 (they used UNIQUE INDEX not CONSTRAINT)
-- The previous migration tried DROP CONSTRAINT which is wrong for these indexes

DROP INDEX IF EXISTS "content_pages_slug_status_key";
DROP INDEX IF EXISTS "site_media_kind_sort_order_status_key";
DROP INDEX IF EXISTS "featured_routes_route_id_status_key";

-- Also drop the old slug-only index on content_pages (replaced by tenant-scoped one)
DROP INDEX IF EXISTS "content_pages_slug_idx";
