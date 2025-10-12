-- Remove unused owner fields from vehicles table
ALTER TABLE public.vehicles
DROP COLUMN IF EXISTS owner_name,
DROP COLUMN IF EXISTS owner_id_number;

-- Drop indexes for the removed fields
DROP INDEX IF EXISTS idx_vehicles_owner_name;
DROP INDEX IF EXISTS idx_vehicles_owner_id_number;

