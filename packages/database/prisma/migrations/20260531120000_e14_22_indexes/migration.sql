-- CreateIndex
CREATE INDEX "bookings_status_created_at_idx" ON "bookings"("status", "created_at");

-- CreateIndex
CREATE INDEX "stops_city_idx" ON "stops"("city");

-- CreateIndex
CREATE INDEX "schedules_route_id_status_departure_at_idx" ON "schedules"("route_id", "status", "departure_at");
