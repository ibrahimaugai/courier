-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "CnAllocationStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'AT_HUB', 'IN_TRANSIT', 'AT_DEPOT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('PREPAID', 'COD', 'TOPAY');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ManifestStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ArrivalScanStatus" AS ENUM ('PENDING', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DeliverySheetStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DeliveryPhase" AS ENUM ('PHASE1', 'PHASE2');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'NOT_DELIVERED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "staff_code" TEXT,
    "station_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "province" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "station_code" TEXT NOT NULL,
    "station_name" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "route_code" TEXT NOT NULL,
    "route_name" TEXT NOT NULL,
    "origin_station_id" TEXT NOT NULL,
    "destination_station_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "service_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "product_code" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cn_allocations" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "start_cn_number" TEXT NOT NULL,
    "end_cn_number" TEXT NOT NULL,
    "current_cn_number" TEXT,
    "status" "CnAllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "allocated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cn_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "cn_number" TEXT NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "origin_city_id" TEXT NOT NULL,
    "destination_city_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "product_id" TEXT,
    "consignee_name" TEXT NOT NULL,
    "consignee_phone" TEXT NOT NULL,
    "consignee_email" TEXT,
    "consignee_address" TEXT NOT NULL,
    "weight" DECIMAL(10,2) NOT NULL,
    "pieces" INTEGER NOT NULL,
    "chargeable_weight" DECIMAL(10,2) NOT NULL,
    "declared_value" DECIMAL(10,2),
    "payment_mode" "PaymentMode" NOT NULL,
    "cod_amount" DECIMAL(10,2),
    "rate" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "batch_id" TEXT,
    "manifest_id" TEXT,
    "delivery_sheet_id" TEXT,
    "cn_allocation_id" TEXT,
    "dc_reference_no" TEXT,
    "manual_cn" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "batch_date" TIMESTAMP(3) NOT NULL,
    "station_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "closed_at" TIMESTAMP(3),
    "closed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifests" (
    "id" TEXT NOT NULL,
    "manifest_code" TEXT NOT NULL,
    "manifest_date" TIMESTAMP(3) NOT NULL,
    "manifest_seal_no" TEXT,
    "station_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "status" "ManifestStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifest_shipments" (
    "id" TEXT NOT NULL,
    "manifest_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manifest_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrival_scans" (
    "id" TEXT NOT NULL,
    "arrival_code" TEXT NOT NULL,
    "scan_date" TIMESTAMP(3) NOT NULL,
    "station_id" TEXT NOT NULL,
    "rider_id" TEXT,
    "total_cns" INTEGER NOT NULL DEFAULT 0,
    "status" "ArrivalScanStatus" NOT NULL DEFAULT 'PENDING',
    "scanned_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "arrival_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrival_scan_shipments" (
    "id" TEXT NOT NULL,
    "arrival_scan_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arrival_scan_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_sheets" (
    "id" TEXT NOT NULL,
    "sheet_number" TEXT NOT NULL,
    "sheet_date" TIMESTAMP(3) NOT NULL,
    "rider_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "origin_station_id" TEXT NOT NULL,
    "total_cns" INTEGER NOT NULL DEFAULT 0,
    "total_weight" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_fod" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "DeliverySheetStatus" NOT NULL DEFAULT 'PENDING',
    "phase" "DeliveryPhase" NOT NULL DEFAULT 'PHASE1',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "delivery_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_sheet_shipments" (
    "id" TEXT NOT NULL,
    "delivery_sheet_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "delivered_at" TIMESTAMP(3),
    "delivery_remarks" TEXT,

    CONSTRAINT "delivery_sheet_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_size" TEXT NOT NULL,
    "vehicle_vendor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "driver_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "delivery_sheet_id" TEXT,
    "collection_amount" DECIMAL(10,2) NOT NULL,
    "collection_date" TIMESTAMP(3) NOT NULL,
    "collection_remarks" TEXT,
    "collected_by" TEXT NOT NULL,
    "payment_method" TEXT,
    "receipt_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "origin_city_id" TEXT NOT NULL,
    "destination_city_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "weight_from" DECIMAL(10,2) NOT NULL,
    "weight_to" DECIMAL(10,2) NOT NULL,
    "rate_per_kg" DECIMAL(10,2) NOT NULL,
    "base_rate" DECIMAL(10,2) NOT NULL,
    "additional_charges" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'active',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "route_code" TEXT,
    "staff_code" TEXT,
    "route_name" TEXT,
    "station_id" TEXT,
    "printer_connection" TEXT,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "void_records" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "cn_number" TEXT NOT NULL,
    "void_reason" TEXT NOT NULL,
    "voided_by" TEXT NOT NULL,
    "voided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "void_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_closes" (
    "id" TEXT NOT NULL,
    "shift_date" TIMESTAMP(3) NOT NULL,
    "batch_id" TEXT NOT NULL,
    "closed_by" TEXT NOT NULL,
    "closed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_closes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cities_city_code_key" ON "cities"("city_code");

-- CreateIndex
CREATE UNIQUE INDEX "stations_station_code_key" ON "stations"("station_code");

-- CreateIndex
CREATE UNIQUE INDEX "routes_route_code_key" ON "routes"("route_code");

-- CreateIndex
CREATE UNIQUE INDEX "services_service_code_key" ON "services"("service_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_code_key" ON "products"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "cn_allocations_product_id_station_id_start_cn_number_key" ON "cn_allocations"("product_id", "station_id", "start_cn_number");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_cn_number_key" ON "bookings"("cn_number");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_cn_allocation_id_key" ON "bookings"("cn_allocation_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_customer_id_idx" ON "bookings"("customer_id");

-- CreateIndex
CREATE INDEX "bookings_batch_id_idx" ON "bookings"("batch_id");

-- CreateIndex
CREATE INDEX "bookings_manifest_id_idx" ON "bookings"("manifest_id");

-- CreateIndex
CREATE INDEX "bookings_delivery_sheet_id_idx" ON "bookings"("delivery_sheet_id");

-- CreateIndex
CREATE INDEX "bookings_booking_date_idx" ON "bookings"("booking_date");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batch_code_key" ON "batches"("batch_code");

-- CreateIndex
CREATE INDEX "batches_status_idx" ON "batches"("status");

-- CreateIndex
CREATE INDEX "batches_batch_date_idx" ON "batches"("batch_date");

-- CreateIndex
CREATE UNIQUE INDEX "manifests_manifest_code_key" ON "manifests"("manifest_code");

-- CreateIndex
CREATE INDEX "manifests_status_idx" ON "manifests"("status");

-- CreateIndex
CREATE INDEX "manifests_manifest_date_idx" ON "manifests"("manifest_date");

-- CreateIndex
CREATE INDEX "manifest_shipments_manifest_id_idx" ON "manifest_shipments"("manifest_id");

-- CreateIndex
CREATE INDEX "manifest_shipments_booking_id_idx" ON "manifest_shipments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "manifest_shipments_manifest_id_booking_id_key" ON "manifest_shipments"("manifest_id", "booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "arrival_scans_arrival_code_key" ON "arrival_scans"("arrival_code");

-- CreateIndex
CREATE INDEX "arrival_scans_status_idx" ON "arrival_scans"("status");

-- CreateIndex
CREATE INDEX "arrival_scans_scan_date_idx" ON "arrival_scans"("scan_date");

-- CreateIndex
CREATE INDEX "arrival_scan_shipments_arrival_scan_id_idx" ON "arrival_scan_shipments"("arrival_scan_id");

-- CreateIndex
CREATE INDEX "arrival_scan_shipments_booking_id_idx" ON "arrival_scan_shipments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "arrival_scan_shipments_arrival_scan_id_booking_id_key" ON "arrival_scan_shipments"("arrival_scan_id", "booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_sheets_sheet_number_key" ON "delivery_sheets"("sheet_number");

-- CreateIndex
CREATE INDEX "delivery_sheets_status_idx" ON "delivery_sheets"("status");

-- CreateIndex
CREATE INDEX "delivery_sheets_sheet_date_idx" ON "delivery_sheets"("sheet_date");

-- CreateIndex
CREATE INDEX "delivery_sheet_shipments_delivery_sheet_id_idx" ON "delivery_sheet_shipments"("delivery_sheet_id");

-- CreateIndex
CREATE INDEX "delivery_sheet_shipments_booking_id_idx" ON "delivery_sheet_shipments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_sheet_shipments_delivery_sheet_id_booking_id_key" ON "delivery_sheet_shipments"("delivery_sheet_id", "booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicle_number_key" ON "vehicles"("vehicle_number");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_driver_code_key" ON "drivers"("driver_code");

-- CreateIndex
CREATE UNIQUE INDEX "collections_booking_id_key" ON "collections"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "collections_receipt_number_key" ON "collections"("receipt_number");

-- CreateIndex
CREATE INDEX "collections_collection_date_idx" ON "collections"("collection_date");

-- CreateIndex
CREATE INDEX "pricing_rules_origin_city_id_destination_city_id_service_id_idx" ON "pricing_rules"("origin_city_id", "destination_city_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "void_records_booking_id_key" ON "void_records"("booking_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stations" ADD CONSTRAINT "stations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_station_id_fkey" FOREIGN KEY ("destination_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cn_allocations" ADD CONSTRAINT "cn_allocations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cn_allocations" ADD CONSTRAINT "cn_allocations_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cn_allocations" ADD CONSTRAINT "cn_allocations_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_origin_city_id_fkey" FOREIGN KEY ("origin_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_destination_city_id_fkey" FOREIGN KEY ("destination_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_manifest_id_fkey" FOREIGN KEY ("manifest_id") REFERENCES "manifests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_delivery_sheet_id_fkey" FOREIGN KEY ("delivery_sheet_id") REFERENCES "delivery_sheets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cn_allocation_id_fkey" FOREIGN KEY ("cn_allocation_id") REFERENCES "cn_allocations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_shipments" ADD CONSTRAINT "manifest_shipments_manifest_id_fkey" FOREIGN KEY ("manifest_id") REFERENCES "manifests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_shipments" ADD CONSTRAINT "manifest_shipments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scans" ADD CONSTRAINT "arrival_scans_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scans" ADD CONSTRAINT "arrival_scans_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scans" ADD CONSTRAINT "arrival_scans_scanned_by_fkey" FOREIGN KEY ("scanned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scan_shipments" ADD CONSTRAINT "arrival_scan_shipments_arrival_scan_id_fkey" FOREIGN KEY ("arrival_scan_id") REFERENCES "arrival_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrival_scan_shipments" ADD CONSTRAINT "arrival_scan_shipments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheets" ADD CONSTRAINT "delivery_sheets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheet_shipments" ADD CONSTRAINT "delivery_sheet_shipments_delivery_sheet_id_fkey" FOREIGN KEY ("delivery_sheet_id") REFERENCES "delivery_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_sheet_shipments" ADD CONSTRAINT "delivery_sheet_shipments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_delivery_sheet_id_fkey" FOREIGN KEY ("delivery_sheet_id") REFERENCES "delivery_sheets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_collected_by_fkey" FOREIGN KEY ("collected_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_origin_city_id_fkey" FOREIGN KEY ("origin_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_destination_city_id_fkey" FOREIGN KEY ("destination_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "void_records" ADD CONSTRAINT "void_records_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "void_records" ADD CONSTRAINT "void_records_voided_by_fkey" FOREIGN KEY ("voided_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_closes" ADD CONSTRAINT "shift_closes_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_closes" ADD CONSTRAINT "shift_closes_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
