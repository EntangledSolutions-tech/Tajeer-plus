-- Add ID type specific fields to customers table
-- This migration adds columns for different ID types: National ID, GCC Countries Citizens, and Visitor

-- Add National ID specific fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS national_id_number VARCHAR(10);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS national_id_issue_date DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS national_id_expiry_date DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS father_name VARCHAR(100);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS mother_name VARCHAR(100);

-- Add GCC Countries Citizens specific fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS id_copy_number VARCHAR(50);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_expiration_date DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_type VARCHAR(50);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS place_of_id_issue VARCHAR(100);

-- Add Visitor specific fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS border_number VARCHAR(50);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS id_expiry_date DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_expiry_date DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS rental_type VARCHAR(100);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS has_additional_driver VARCHAR(10);

-- Note: address field already exists in the customers table
-- Note: email field needs to be added as it's part of base fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_customers_national_id_number ON public.customers(national_id_number) WHERE national_id_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_passport_number ON public.customers(passport_number) WHERE passport_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_border_number ON public.customers(border_number) WHERE border_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_id_copy_number ON public.customers(id_copy_number) WHERE id_copy_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email) WHERE email IS NOT NULL;

-- Add comments to columns for documentation
COMMENT ON COLUMN public.customers.national_id_number IS 'National ID number - Required for National ID type (10 digits)';
COMMENT ON COLUMN public.customers.national_id_issue_date IS 'National ID issue date - Required for National ID type';
COMMENT ON COLUMN public.customers.national_id_expiry_date IS 'National ID expiry date - Required for National ID type';
COMMENT ON COLUMN public.customers.place_of_birth IS 'Place of birth - Required for National ID type';
COMMENT ON COLUMN public.customers.father_name IS 'Father name - Required for National ID type';
COMMENT ON COLUMN public.customers.mother_name IS 'Mother name - Required for National ID type';

COMMENT ON COLUMN public.customers.id_copy_number IS 'ID copy number - Required for GCC Countries Citizens';
COMMENT ON COLUMN public.customers.license_expiration_date IS 'License expiration date - Required for GCC Countries Citizens';
COMMENT ON COLUMN public.customers.license_type IS 'License type - Required for GCC Countries Citizens';
COMMENT ON COLUMN public.customers.place_of_id_issue IS 'Place of ID issue - Required for GCC Countries Citizens and Visitor';

COMMENT ON COLUMN public.customers.border_number IS 'Border number - Required for Visitor type';
COMMENT ON COLUMN public.customers.passport_number IS 'Passport number - Required for Visitor type';
COMMENT ON COLUMN public.customers.license_number IS 'License number - Required for Visitor type';
COMMENT ON COLUMN public.customers.id_expiry_date IS 'ID expiry date - Required for Visitor type';
COMMENT ON COLUMN public.customers.license_expiry_date IS 'License expiry date - Required for Visitor type';
COMMENT ON COLUMN public.customers.rental_type IS 'Rental type - Required for Visitor type';
COMMENT ON COLUMN public.customers.has_additional_driver IS 'Has additional driver flag - Optional for Visitor type';

COMMENT ON COLUMN public.customers.email IS 'Customer email address - Required for all ID types';

