-- Remove deprecated customer columns from contracts table
-- These columns are redundant since we now use foreign key joins with the customers table

ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS customer_name,
  DROP COLUMN IF EXISTS customer_id_type,
  DROP COLUMN IF EXISTS customer_id_number,
  DROP COLUMN IF EXISTS customer_classification,
  DROP COLUMN IF EXISTS customer_date_of_birth,
  DROP COLUMN IF EXISTS customer_license_type,
  DROP COLUMN IF EXISTS customer_address,
  DROP COLUMN IF EXISTS customer_mobile,
  DROP COLUMN IF EXISTS customer_nationality,
  DROP COLUMN IF EXISTS customer_status_id;

-- Update table comment
COMMENT ON TABLE public.contracts IS 'Rental contracts linking customers and vehicles. All customer and vehicle details are fetched via joins using selected_customer_id and selected_vehicle_id foreign keys.';

