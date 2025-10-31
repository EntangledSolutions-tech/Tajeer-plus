-- Remove deprecated vehicle columns from contracts table
-- These columns are redundant since we now use foreign key joins with the vehicles table

ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS vehicle_plate,
  DROP COLUMN IF EXISTS vehicle_serial_number;

-- Add comment to document the change
COMMENT ON TABLE public.contracts IS 'Rental contracts linking customers and vehicles. All customer and vehicle details are fetched via joins using selected_customer_id and selected_vehicle_id foreign keys.';

