-- DropForeignKey
ALTER TABLE "batches" DROP CONSTRAINT "batches_route_id_fkey";

-- DropForeignKey
ALTER TABLE "batches" DROP CONSTRAINT "batches_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "batches" DROP CONSTRAINT "batches_station_id_fkey";

-- AlterTable
ALTER TABLE "batches" ADD COLUMN     "route_code" TEXT,
ADD COLUMN     "staff_code" TEXT,
ADD COLUMN     "station_code" TEXT,
ALTER COLUMN "station_id" DROP NOT NULL,
ALTER COLUMN "route_id" DROP NOT NULL,
ALTER COLUMN "staff_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "configurations" ADD COLUMN     "station_code" TEXT;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
