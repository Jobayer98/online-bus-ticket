-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'COUNTER_SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('AC', 'NON_AC');

-- CreateEnum
CREATE TYPE "SeatClass" AS ENUM ('STANDARD', 'PREMIUM', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'HELD', 'SOLD');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'HELD', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'ONLINE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CounterTransactionType" AS ENUM ('SELL', 'CHANGE', 'REFUND', 'CANCEL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "from_stop_id" TEXT NOT NULL,
    "to_stop_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "distance_km" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "coach_number" TEXT NOT NULL,
    "bus_type" "BusType" NOT NULL,
    "seat_layout_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_layouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_templates" (
    "id" TEXT NOT NULL,
    "seat_layout_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "seat_class" "SeatClass" NOT NULL,

    CONSTRAINT "seat_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boarding_points" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "boarding_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "departure_at" TIMESTAMP(3) NOT NULL,
    "estimated_arrival_at" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "base_fare" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reschedule_logs" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "previous_departure" TIMESTAMP(3) NOT NULL,
    "new_departure" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reschedule_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_seats" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "seat_class" "SeatClass" NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price" INTEGER NOT NULL,

    CONSTRAINT "schedule_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_holds" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_hold_items" (
    "id" TEXT NOT NULL,
    "hold_id" TEXT NOT NULL,
    "schedule_seat_id" TEXT NOT NULL,

    CONSTRAINT "seat_hold_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "user_id" TEXT,
    "hold_id" TEXT,
    "boarding_point_id" TEXT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "passenger_phone" TEXT NOT NULL,
    "passenger_email" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'DRAFT',
    "total_amount" INTEGER NOT NULL,
    "sold_by_id" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'ONLINE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_seats" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "schedule_seat_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "booking_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT,
    "provider_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "passenger_number" TEXT NOT NULL,
    "qr_payload" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_transactions" (
    "id" TEXT NOT NULL,
    "type" "CounterTransactionType" NOT NULL,
    "seller_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counter_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "stops_code_key" ON "stops"("code");

-- CreateIndex
CREATE UNIQUE INDEX "routes_slug_key" ON "routes"("slug");

-- CreateIndex
CREATE INDEX "routes_slug_idx" ON "routes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "routes_from_stop_id_to_stop_id_key" ON "routes"("from_stop_id", "to_stop_id");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_coach_number_key" ON "coaches"("coach_number");

-- CreateIndex
CREATE UNIQUE INDEX "seat_templates_seat_layout_id_label_key" ON "seat_templates"("seat_layout_id", "label");

-- CreateIndex
CREATE INDEX "boarding_points_route_id_idx" ON "boarding_points"("route_id");

-- CreateIndex
CREATE INDEX "schedules_route_id_departure_at_idx" ON "schedules"("route_id", "departure_at");

-- CreateIndex
CREATE INDEX "schedule_seats_schedule_id_status_idx" ON "schedule_seats"("schedule_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_seats_schedule_id_label_key" ON "schedule_seats"("schedule_id", "label");

-- CreateIndex
CREATE INDEX "seat_holds_expires_at_idx" ON "seat_holds"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "seat_hold_items_hold_id_schedule_seat_id_key" ON "seat_hold_items"("hold_id", "schedule_seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_hold_id_key" ON "bookings"("hold_id");

-- CreateIndex
CREATE INDEX "bookings_passenger_phone_idx" ON "bookings"("passenger_phone");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_seats_booking_id_schedule_seat_id_key" ON "booking_seats"("booking_id", "schedule_seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_booking_id_key" ON "tickets"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_passenger_number_key" ON "tickets"("passenger_number");

-- CreateIndex
CREATE INDEX "counter_transactions_seller_id_created_at_idx" ON "counter_transactions"("seller_id", "created_at");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_from_stop_id_fkey" FOREIGN KEY ("from_stop_id") REFERENCES "stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_to_stop_id_fkey" FOREIGN KEY ("to_stop_id") REFERENCES "stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_seat_layout_id_fkey" FOREIGN KEY ("seat_layout_id") REFERENCES "seat_layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_templates" ADD CONSTRAINT "seat_templates_seat_layout_id_fkey" FOREIGN KEY ("seat_layout_id") REFERENCES "seat_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarding_points" ADD CONSTRAINT "boarding_points_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_logs" ADD CONSTRAINT "reschedule_logs_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_seats" ADD CONSTRAINT "schedule_seats_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold_items" ADD CONSTRAINT "seat_hold_items_hold_id_fkey" FOREIGN KEY ("hold_id") REFERENCES "seat_holds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold_items" ADD CONSTRAINT "seat_hold_items_schedule_seat_id_fkey" FOREIGN KEY ("schedule_seat_id") REFERENCES "schedule_seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hold_id_fkey" FOREIGN KEY ("hold_id") REFERENCES "seat_holds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boarding_point_id_fkey" FOREIGN KEY ("boarding_point_id") REFERENCES "boarding_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_schedule_seat_id_fkey" FOREIGN KEY ("schedule_seat_id") REFERENCES "schedule_seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_transactions" ADD CONSTRAINT "counter_transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_transactions" ADD CONSTRAINT "counter_transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
