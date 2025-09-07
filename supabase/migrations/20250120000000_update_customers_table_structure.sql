-- Update customers table structure to use foreign key relationships
-- This migration removes hardcoded customers and updates the table structure

-- First, remove all hardcoded customers and related data
DELETE FROM customer_penalties;
DELETE FROM customer_finance;
DELETE FROM customer_invoices;
DELETE FROM customer_contracts;
DELETE FROM customer_branches;
DELETE FROM customer_documents;
DELETE FROM customers;

-- Add foreign key columns to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS classification_id UUID REFERENCES public.customer_classifications(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_type_id UUID REFERENCES public.customer_license_types(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS nationality_id UUID REFERENCES public.customer_nationalities(id) ON DELETE SET NULL;

-- Create indexes for the new foreign key columns
CREATE INDEX IF NOT EXISTS idx_customers_classification_id ON public.customers(classification_id);
CREATE INDEX IF NOT EXISTS idx_customers_license_type_id ON public.customers(license_type_id);
CREATE INDEX IF NOT EXISTS idx_customers_nationality_id ON public.customers(nationality_id);

-- Keep the old columns for now to avoid breaking existing code
-- We can remove them in a future migration after updating all application code
-- ALTER TABLE public.customers DROP COLUMN classification;
-- ALTER TABLE public.customers DROP COLUMN license_type;
-- ALTER TABLE public.customers DROP COLUMN nationality;
-- ALTER TABLE public.customers DROP COLUMN status;
