-- Add hourly_delay_rate column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS hourly_delay_rate DECIMAL(10,2);

-- Add comment for documentation
COMMENT ON COLUMN public.vehicles.hourly_delay_rate IS 'Hourly delay rate for the vehicle';
