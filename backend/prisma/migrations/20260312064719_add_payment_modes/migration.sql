-- UpdateEnum
ALTER TYPE "PaymentMode" ADD VALUE 'ACCOUNT' IF NOT EXISTS;

-- Existing CASH, COD, ONLINE values remain unchanged
-- This migration ensures PaymentMode enum has all required values:
-- CASH, COD, ONLINE, ACCOUNT
