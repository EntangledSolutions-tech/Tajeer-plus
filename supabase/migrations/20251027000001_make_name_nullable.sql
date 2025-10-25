-- Make name field nullable since it's no longer required for any ID type
-- This migration updates the customers table to allow NULL values for the name field

ALTER TABLE public.customers ALTER COLUMN name DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.customers.name IS 'Customer name - Optional field, not required for any ID type';

