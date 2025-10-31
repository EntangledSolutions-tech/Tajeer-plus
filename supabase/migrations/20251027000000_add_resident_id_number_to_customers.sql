-- Add resident_id_number field to customers table
-- This field is used for Resident ID type customers, similar to national_id_number for National ID type

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS resident_id_number VARCHAR(50);

-- Create index for performance and uniqueness checks
CREATE INDEX IF NOT EXISTS idx_customers_resident_id_number ON public.customers(resident_id_number) WHERE resident_id_number IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.customers.resident_id_number IS 'Resident ID number - Required for Resident ID type';

