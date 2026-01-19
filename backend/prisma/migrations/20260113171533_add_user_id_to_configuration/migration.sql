-- AlterTable
ALTER TABLE "configurations" ADD COLUMN "user_id" TEXT,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- For existing configurations, we need to set a user_id
-- This will set all existing configurations to the first admin user
-- You may want to adjust this based on your needs
UPDATE "configurations" 
SET "user_id" = (SELECT id FROM users WHERE role = 'ADMIN' OR role = 'SUPER_ADMIN' LIMIT 1)
WHERE "user_id" IS NULL;

-- Now make user_id required
ALTER TABLE "configurations" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "configurations_user_id_key" ON "configurations"("user_id");

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
