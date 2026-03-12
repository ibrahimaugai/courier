-- UpdateEnum - Add ACCOUNT to PaymentMode enum
-- Using DO block to handle if value already exists
DO $$ BEGIN
  ALTER TYPE "PaymentMode" ADD VALUE 'ACCOUNT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Existing CASH, COD, ONLINE values remain unchanged
-- This migration ensures PaymentMode enum has all required values:
-- CASH, COD, ONLINE, ACCOUNT
