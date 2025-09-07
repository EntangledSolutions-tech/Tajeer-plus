-- Optional cleanup of unused vehicle pricing fields
-- This migration removes the purchase_date, purchase_price, and lease_amount_increase columns that are no longer needed
-- The fields are kept in the database for now to avoid data loss, but this migration can be run if cleanup is desired

-- Uncomment the following lines if you want to remove the unused fields completely:
-- ALTER TABLE public.vehicles DROP COLUMN IF EXISTS purchase_date;
-- ALTER TABLE public.vehicles DROP COLUMN IF EXISTS purchase_price;
-- ALTER TABLE public.vehicles DROP COLUMN IF EXISTS lease_amount_increase;

-- For now, we'll just add a comment to document that these fields are no longer used
COMMENT ON COLUMN public.vehicles.purchase_date IS 'DEPRECATED: This field is no longer used in the application';
COMMENT ON COLUMN public.vehicles.purchase_price IS 'DEPRECATED: This field is no longer used in the application';
COMMENT ON COLUMN public.vehicles.lease_amount_increase IS 'DEPRECATED: This field is no longer used in the application';
