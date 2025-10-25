-- Add GCC ID number field for GCC Countries Citizens
-- This field stores the ID number for GCC citizens (similar to national_id_number for nationals)

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gcc_id_number VARCHAR(50);

-- Create index for frequently queried field
CREATE INDEX IF NOT EXISTS idx_customers_gcc_id_number ON public.customers(gcc_id_number) WHERE gcc_id_number IS NOT NULL;

-- Add comment to column for documentation
COMMENT ON COLUMN public.customers.gcc_id_number IS 'GCC ID number - Required for GCC Countries Citizens type (alphanumeric, format varies by country)';

