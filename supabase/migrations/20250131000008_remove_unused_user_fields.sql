-- Remove unused user fields from vehicles table
ALTER TABLE public.vehicles
DROP COLUMN IF EXISTS actual_user_name,
DROP COLUMN IF EXISTS actual_user_id_number;

-- Drop indexes for the removed fields
DROP INDEX IF EXISTS idx_vehicles_actual_user_name;
DROP INDEX IF EXISTS idx_vehicles_actual_user_id_number;

