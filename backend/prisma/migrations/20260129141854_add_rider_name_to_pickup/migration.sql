/*
  Warnings:

  - The values [PREPAID,TOPAY] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `booking_id` to the `arrival_scan_shipments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_id` to the `manifest_shipments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'PICKED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'PENDING';
ALTER TYPE "BookingStatus" ADD VALUE 'PICKUP_REQUESTED';
ALTER TYPE "BookingStatus" ADD VALUE 'RIDER_ON_WAY';

-- AlterEnum
ALTER TYPE "ManifestStatus" ADD VALUE 'PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('CASH', 'COD', 'ONLINE');
ALTER TABLE "bookings" ALTER COLUMN "payment_mode" TYPE "PaymentMode_new" USING ("payment_mode"::text::"PaymentMode_new");
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "PaymentMode_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "arrival_scans" DROP CONSTRAINT "arrival_scans_station_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_sheets" DROP CONSTRAINT "delivery_sheets_origin_station_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_sheets" DROP CONSTRAINT "delivery_sheets_rider_id_fkey";

-- DropForeignKey
ALTER TABLE "manifests" DROP CONSTRAINT "manifests_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "manifests" DROP CONSTRAINT "manifests_route_id_fkey";

-- DropForeignKey
ALTER TABLE "manifests" DROP CONSTRAINT "manifests_station_id_fkey";

-- DropForeignKey
ALTER TABLE "manifests" DROP CONSTRAINT "manifests_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "arrival_scan_shipments" ADD COLUMN     "booking_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "arrival_scans" ADD COLUMN     "rider_name" TEXT,
ALTER COLUMN "station_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "cn_number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "delivery_sheet_shipments" ADD COLUMN     "booking_id" TEXT;

-- AlterTable
ALTER TABLE "delivery_sheets" ADD COLUMN     "rider_mobile" TEXT,
ADD COLUMN     "rider_name" TEXT,
ADD COLUMN     "route_id" TEXT,
ADD COLUMN     "vehicle_no" TEXT,
ADD COLUMN     "vehicle_size" TEXT,
ADD COLUMN     "vehicle_vendor" TEXT,
ALTER COLUMN "rider_id" DROP NOT NULL,
ALTER COLUMN "origin_station_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "manifest_shipments" ADD COLUMN     "booking_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "manifests" ADD COLUMN     "driver_name" TEXT,
ADD COLUMN     "route" TEXT,
ADD COLUMN     "staff_driver_phone" TEXT,
ADD COLUMN     "teller" TEXT,
ADD COLUMN     "total_cns" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vehicle_no" TEXT,
ADD COLUMN     "vehicle_size" TEXT,
ADD COLUMN     "vehicle_vendor" TEXT,
ALTER COLUMN "station_id" DROP NOT NULL,
ALTER COLUMN "vehicle_id" DROP NOT NULL,
ALTER COLUMN "driver_id" DROP NOT NULL,
ALTER COLUMN "route_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "days" TEXT;

-- CreateTable
CREATE TABLE "pickup_requests" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "pickup_address" TEXT NOT NULL,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "pickup_time" TEXT,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "special_instructions" TEXT,
    "status" "PickupStatus" NOT NULL DEFAULT 'REQUESTED',
    "assigned_rider_id" TEXT,
    "rider_name" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arrival_scan_shipments_booking_id_idx" ON "arrival_scan_shipments"("booking_id");

-- CreateIndex
CREATE INDEX "delivery_sheet_shipments_booking_id_idx" ON "delivery_sheet_shipments"("booking_id");

-- CreateIndex
CREATE INDEX "manifest_shipments_booking_id_idx" ON "manifest_shipments"("booking_id");

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_shipments" ADD CONSTRAINT "manifest_shipments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scans" ADD CONSTRAINT "arrival_scans_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scan_shipments" ADD CONSTRAINT "arrival_scan_shipments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheet_shipments" ADD CONSTRAINT "delivery_sheet_shipments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_assigned_rider_id_fkey" FOREIGN KEY ("assigned_rider_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
