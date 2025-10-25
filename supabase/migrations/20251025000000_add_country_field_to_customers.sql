-- Add country field to customers table for Visitor ID type
-- This field is required for Visitor customers

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Create index for country field
CREATE INDEX IF NOT EXISTS idx_customers_country ON public.customers(country) WHERE country IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.customers.country IS 'Country - Required for Visitor ID type';

