-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancel_reason" TEXT;

-- CreateTable
CREATE TABLE "booking_history" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_status" "BookingStatus",
    "new_status" "BookingStatus",
    "performed_by" TEXT NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_history_booking_id_idx" ON "booking_history"("booking_id");

-- CreateIndex
CREATE INDEX "booking_history_created_at_idx" ON "booking_history"("created_at");

-- CreateIndex
CREATE INDEX "booking_history_performed_by_idx" ON "booking_history"("performed_by");

-- AddForeignKey
ALTER TABLE "booking_history" ADD CONSTRAINT "booking_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_history" ADD CONSTRAINT "booking_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
