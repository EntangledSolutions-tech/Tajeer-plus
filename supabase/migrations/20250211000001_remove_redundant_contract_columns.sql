-- Migration: Remove redundant customer and vehicle data columns from contracts table
-- These columns duplicate data that should come from joins with customers and vehicles tables
-- IMPORTANT: Only run this migration after ensuring all application code uses joins

-- Note: This migration is commented out by default as a safety measure
-- Uncomment the statements below when ready to remove redundant columns

/*
-- Remove redundant customer columns
ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS customer_name,
  DROP COLUMN IF EXISTS customer_id_type,
  DROP COLUMN IF EXISTS customer_id_number,
  DROP COLUMN IF EXISTS customer_classification,
  DROP COLUMN IF EXISTS customer_date_of_birth,
  DROP COLUMN IF EXISTS customer_license_type,
  DROP COLUMN IF EXISTS customer_address;

-- Remove redundant vehicle columns
ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS vehicle_plate,
  DROP COLUMN IF EXISTS vehicle_serial_number;

-- Remove redundant customer/vehicle type columns if they exist
ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS customer_type,
  DROP COLUMN IF EXISTS vehicle_plate_registration_type,
  DROP COLUMN IF EXISTS vehicle_make_year,
  DROP COLUMN IF EXISTS vehicle_model,
  DROP COLUMN IF EXISTS vehicle_make,
  DROP COLUMN IF EXISTS vehicle_color,
  DROP COLUMN IF EXISTS vehicle_mileage,
  DROP COLUMN IF EXISTS vehicle_status,
  DROP COLUMN IF EXISTS vehicle_daily_rent_rate,
  DROP COLUMN IF EXISTS vehicle_hourly_delay_rate,
  DROP COLUMN IF EXISTS vehicle_permitted_daily_km,
  DROP COLUMN IF EXISTS vehicle_excess_km_rate;

COMMENT ON TABLE public.contracts IS 'Rental contracts linking customers and vehicles. All customer and vehicle details are fetched via joins using foreign keys.';
*/

-- For now, just add comments to indicate these columns are deprecated
COMMENT ON COLUMN public.contracts.customer_name IS 'DEPRECATED: Use join with customers table via selected_customer_id';
COMMENT ON COLUMN public.contracts.vehicle_plate IS 'DEPRECATED: Use join with vehicles table via selected_vehicle_id';
COMMENT ON COLUMN public.contracts.vehicle_serial_number IS 'DEPRECATED: Use join with vehicles table via selected_vehicle_id';

