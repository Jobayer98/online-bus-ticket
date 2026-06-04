-- E17-01: Scope route slug and stop-pair uniqueness per tenant.
-- Legacy rows may still have NULL tenant_id; PostgreSQL treats each NULL as distinct
-- in composite UNIQUE indexes, so pre-migration orphan routes are not auto-deduped.

DROP INDEX IF EXISTS "routes_slug_key";
DROP INDEX IF EXISTS "routes_from_stop_id_to_stop_id_key";

CREATE UNIQUE INDEX "routes_tenant_id_slug_key" ON "routes"("tenant_id", "slug");
CREATE UNIQUE INDEX "routes_tenant_id_from_stop_id_to_stop_id_key" ON "routes"("tenant_id", "from_stop_id", "to_stop_id");
