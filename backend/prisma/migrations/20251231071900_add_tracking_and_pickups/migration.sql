-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('BOOKED', 'PICKUP_REQUESTED', 'PICKED', 'AT_HUB', 'MANIFESTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'VOIDED', 'BOOKING_UPDATED');

-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'PICKED', 'CANCELLED');

-- CreateTable
CREATE TABLE "shipment_events" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_requests" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "pickup_time" TEXT,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "special_instructions" TEXT,
    "status" "PickupStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipment_events_booking_id_idx" ON "shipment_events"("booking_id");

-- CreateIndex
CREATE INDEX "shipment_events_created_at_idx" ON "shipment_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pickup_requests_booking_id_key" ON "pickup_requests"("booking_id");

-- CreateIndex
CREATE INDEX "pickup_requests_status_idx" ON "pickup_requests"("status");

-- CreateIndex
CREATE INDEX "pickup_requests_pickup_date_idx" ON "pickup_requests"("pickup_date");

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
