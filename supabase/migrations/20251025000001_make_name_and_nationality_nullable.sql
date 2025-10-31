-- Make name and nationality_id nullable for Visitor ID type
-- Visitor customers don't require name and nationality fields

-- Make name column nullable (not required for Visitor ID type)
ALTER TABLE public.customers ALTER COLUMN name DROP NOT NULL;

-- Make nationality_id column nullable (not required for Visitor ID type)
ALTER TABLE public.customers ALTER COLUMN nationality_id DROP NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.customers.name IS 'Customer name - Optional for Visitor ID type, required for other types';
COMMENT ON COLUMN public.customers.nationality_id IS 'Customer nationality - Optional for Visitor ID type, required for other types';

