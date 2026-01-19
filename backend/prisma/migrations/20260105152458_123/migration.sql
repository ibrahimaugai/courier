/*
  Warnings:

  - You are about to drop the column `booking_id` on the `arrival_scan_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `delivery_sheet_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `manifest_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `void_records` table. All the data in the column will be lost.
  - You are about to drop the `pickup_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipment_events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "arrival_scan_shipments" DROP CONSTRAINT "arrival_scan_shipments_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "collections" DROP CONSTRAINT "collections_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_sheet_shipments" DROP CONSTRAINT "delivery_sheet_shipments_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "manifest_shipments" DROP CONSTRAINT "manifest_shipments_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "pickup_requests" DROP CONSTRAINT "pickup_requests_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "shipment_events" DROP CONSTRAINT "shipment_events_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "void_records" DROP CONSTRAINT "void_records_booking_id_fkey";

-- DropIndex
DROP INDEX "arrival_scan_shipments_arrival_scan_id_booking_id_key";

-- DropIndex
DROP INDEX "arrival_scan_shipments_booking_id_idx";

-- DropIndex
DROP INDEX "bookings_batch_id_idx";

-- DropIndex
DROP INDEX "bookings_cn_allocation_id_key";

-- DropIndex
DROP INDEX "bookings_created_at_idx";

-- DropIndex
DROP INDEX "bookings_delivery_sheet_id_idx";

-- DropIndex
DROP INDEX "bookings_manifest_id_idx";

-- DropIndex
DROP INDEX "collections_booking_id_key";

-- DropIndex
DROP INDEX "delivery_sheet_shipments_booking_id_idx";

-- DropIndex
DROP INDEX "delivery_sheet_shipments_delivery_sheet_id_booking_id_key";

-- DropIndex
DROP INDEX "manifest_shipments_booking_id_idx";

-- DropIndex
DROP INDEX "manifest_shipments_manifest_id_booking_id_key";

-- DropIndex
DROP INDEX "void_records_booking_id_key";

-- AlterTable
ALTER TABLE "arrival_scan_shipments" DROP COLUMN "booking_id";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "description",
ADD COLUMN     "consignee_address2" TEXT,
ADD COLUMN     "consignee_company_name" TEXT,
ADD COLUMN     "consignee_landline" TEXT,
ADD COLUMN     "consignee_zip_code" TEXT,
ADD COLUMN     "document_details" TEXT,
ADD COLUMN     "document_urls" TEXT,
ADD COLUMN     "handling_instructions" TEXT,
ADD COLUMN     "other_amount" DECIMAL(10,2),
ADD COLUMN     "packet_content" TEXT,
ADD COLUMN     "shipper_address" TEXT,
ADD COLUMN     "shipper_address2" TEXT,
ADD COLUMN     "shipper_cnic" TEXT,
ADD COLUMN     "shipper_company_name" TEXT,
ADD COLUMN     "shipper_email" TEXT,
ADD COLUMN     "shipper_landline" TEXT,
ADD COLUMN     "shipper_name" TEXT,
ADD COLUMN     "shipper_phone" TEXT,
ADD COLUMN     "volumetric_weight" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "collections" DROP COLUMN "booking_id";

-- AlterTable
ALTER TABLE "delivery_sheet_shipments" DROP COLUMN "booking_id";

-- AlterTable
ALTER TABLE "manifest_shipments" DROP COLUMN "booking_id";

-- AlterTable
ALTER TABLE "void_records" DROP COLUMN "booking_id";

-- DropTable
DROP TABLE "pickup_requests";

-- DropTable
DROP TABLE "shipment_events";

-- DropEnum
DROP TYPE "PickupStatus";

-- DropEnum
DROP TYPE "ShipmentStatus";

-- CreateIndex
CREATE INDEX "bookings_cn_number_idx" ON "bookings"("cn_number");
