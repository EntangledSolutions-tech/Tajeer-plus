-- Add missing columns to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS documents JSONB,
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);

-- Add index for documents column for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_documents ON public.vehicles USING GIN (documents);

-- Add index for owner_name column
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_name ON public.vehicles(owner_name);
