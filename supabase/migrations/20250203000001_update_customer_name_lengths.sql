-- Update name, father_name and mother_name columns to have max length of 30 characters
-- This migration updates the column sizes to match the validation requirements

ALTER TABLE public.customers ALTER COLUMN name TYPE VARCHAR(30);
ALTER TABLE public.customers ALTER COLUMN father_name TYPE VARCHAR(30);
ALTER TABLE public.customers ALTER COLUMN mother_name TYPE VARCHAR(30);

-- Add comments for documentation
COMMENT ON COLUMN public.customers.name IS 'Customer name (max 30 characters)';
COMMENT ON COLUMN public.customers.father_name IS 'Father name - Required for National ID type (max 30 characters)';
COMMENT ON COLUMN public.customers.mother_name IS 'Mother name - Required for National ID type (max 30 characters)';

