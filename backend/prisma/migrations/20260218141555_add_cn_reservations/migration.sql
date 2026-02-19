-- CreateTable
CREATE TABLE "cn_reservations" (
    "id" TEXT NOT NULL,
    "cn_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cn_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cn_reservations_cn_number_key" ON "cn_reservations"("cn_number");
