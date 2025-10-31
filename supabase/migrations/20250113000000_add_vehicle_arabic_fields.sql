-- Add Arabic fields for vehicle details form
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS actual_user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS owner_id_arabic VARCHAR(255),
ADD COLUMN IF NOT EXISTS actual_user_id_arabic VARCHAR(255),
ADD COLUMN IF NOT EXISTS vehicle_load_capacity VARCHAR(255),
ADD COLUMN IF NOT EXISTS technical_number VARCHAR(255);

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_vehicles_actual_user_name ON public.vehicles(actual_user_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id_arabic ON public.vehicles(owner_id_arabic);
CREATE INDEX IF NOT EXISTS idx_vehicles_actual_user_id_arabic ON public.vehicles(actual_user_id_arabic);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_load_capacity ON public.vehicles(vehicle_load_capacity);
CREATE INDEX IF NOT EXISTS idx_vehicles_technical_number ON public.vehicles(technical_number);

-- Add comments for documentation
COMMENT ON COLUMN public.vehicles.actual_user_name IS 'Name of the actual user';
COMMENT ON COLUMN public.vehicles.owner_id_arabic IS 'Owner ID';
COMMENT ON COLUMN public.vehicles.actual_user_id_arabic IS 'User ID';
COMMENT ON COLUMN public.vehicles.vehicle_load_capacity IS 'Vehicle load capacity';
COMMENT ON COLUMN public.vehicles.technical_number IS 'Technical identification number';
