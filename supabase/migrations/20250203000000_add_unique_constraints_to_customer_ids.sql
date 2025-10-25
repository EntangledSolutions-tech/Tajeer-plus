-- Add unique constraints to customer ID fields
-- This migration adds unique constraints to ensure no duplicate IDs can be entered
-- Using partial unique indexes to allow multiple NULL values but enforce uniqueness for non-NULL values

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_customers_national_id_number;
DROP INDEX IF EXISTS idx_customers_passport_number;
DROP INDEX IF EXISTS idx_customers_id_copy_number;

-- Create partial unique indexes (allows multiple NULLs but enforces uniqueness for non-NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS unique_national_id_number ON public.customers(national_id_number) WHERE national_id_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_passport_number ON public.customers(passport_number) WHERE passport_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_license_number ON public.customers(license_number) WHERE license_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_id_copy_number ON public.customers(id_copy_number) WHERE id_copy_number IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX unique_national_id_number IS 'Ensures National ID numbers are unique across all customers (allows multiple NULLs)';
COMMENT ON INDEX unique_passport_number IS 'Ensures Passport numbers are unique across all customers (allows multiple NULLs)';
COMMENT ON INDEX unique_license_number IS 'Ensures License numbers are unique across all customers (allows multiple NULLs)';
COMMENT ON INDEX unique_id_copy_number IS 'Ensures ID copy numbers are unique across all customers (allows multiple NULLs)';

