-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "preferred_delivery_date" TIMESTAMP(3),
ADD COLUMN     "preferred_delivery_time" TEXT;
