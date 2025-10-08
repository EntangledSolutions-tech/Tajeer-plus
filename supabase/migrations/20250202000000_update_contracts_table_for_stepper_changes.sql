-- Update contracts table to accommodate new fields from the contract stepper
-- This migration adds the missing fields that were introduced in the form components

-- Add new customer fields
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS customer_mobile VARCHAR(20);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS customer_nationality VARCHAR(50) DEFAULT 'Saudi';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS customer_status_id UUID REFERENCES public.customer_statuses(id) ON DELETE SET NULL;

-- Add new vehicle fields
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_plate_registration_type VARCHAR(50) DEFAULT 'Private';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_make_year VARCHAR(10);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(100);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_color VARCHAR(50);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_mileage INTEGER DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_status VARCHAR(50);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_daily_rent_rate DECIMAL(10,2);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_hourly_delay_rate DECIMAL(10,2);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_permitted_daily_km INTEGER;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS vehicle_excess_km_rate DECIMAL(10,2);

-- Add new contract detail fields
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS duration_type VARCHAR(20) DEFAULT 'duration' CHECK (duration_type IN ('duration', 'fees'));
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS duration_in_days INTEGER;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS total_fees DECIMAL(10,2);

-- Add add-ons field
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS add_ons JSONB DEFAULT '[]'::jsonb;

-- Remove the customer_type constraint since we're no longer using the customer_type radio buttons
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_customer_type_check;

-- Remove the customer_type field since it's no longer needed
ALTER TABLE public.contracts DROP COLUMN IF EXISTS customer_type;

-- Update existing data to set reasonable defaults
UPDATE public.contracts
SET
    customer_nationality = COALESCE(customer_nationality, 'Saudi'),
    vehicle_plate_registration_type = COALESCE(vehicle_plate_registration_type, 'Private'),
    duration_type = COALESCE(duration_type, 'duration'),
    duration_in_days = COALESCE(duration_in_days, rental_days),
    vehicle_mileage = COALESCE(vehicle_mileage, 0),
    add_ons = COALESCE(add_ons, '[]'::jsonb)
WHERE
    customer_nationality IS NULL OR
    vehicle_plate_registration_type IS NULL OR
    duration_type IS NULL OR
    duration_in_days IS NULL OR
    vehicle_mileage IS NULL OR
    add_ons IS NULL;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_contracts_customer_status_id ON public.contracts(customer_status_id);
CREATE INDEX IF NOT EXISTS idx_contracts_duration_type ON public.contracts(duration_type);
CREATE INDEX IF NOT EXISTS idx_contracts_vehicle_make ON public.contracts(vehicle_make);
CREATE INDEX IF NOT EXISTS idx_contracts_vehicle_model ON public.contracts(vehicle_model);

-- Add comments for documentation
COMMENT ON COLUMN public.contracts.customer_mobile IS 'Customer mobile/phone number';
COMMENT ON COLUMN public.contracts.customer_nationality IS 'Customer nationality';
COMMENT ON COLUMN public.contracts.customer_status_id IS 'Reference to customer_statuses table';
COMMENT ON COLUMN public.contracts.vehicle_plate_registration_type IS 'Type of vehicle plate registration (Private, Commercial, etc.)';
COMMENT ON COLUMN public.contracts.vehicle_make_year IS 'Year the vehicle was manufactured';
COMMENT ON COLUMN public.contracts.vehicle_model IS 'Vehicle model name';
COMMENT ON COLUMN public.contracts.vehicle_make IS 'Vehicle manufacturer/make';
COMMENT ON COLUMN public.contracts.vehicle_color IS 'Vehicle color';
COMMENT ON COLUMN public.contracts.vehicle_mileage IS 'Current vehicle mileage in kilometers';
COMMENT ON COLUMN public.contracts.vehicle_status IS 'Current status of the vehicle';
COMMENT ON COLUMN public.contracts.vehicle_daily_rent_rate IS 'Daily rental rate for the vehicle';
COMMENT ON COLUMN public.contracts.vehicle_hourly_delay_rate IS 'Hourly delay rate for the vehicle';
COMMENT ON COLUMN public.contracts.vehicle_permitted_daily_km IS 'Permitted daily kilometers for the vehicle';
COMMENT ON COLUMN public.contracts.vehicle_excess_km_rate IS 'Rate charged for excess kilometers';
COMMENT ON COLUMN public.contracts.duration_type IS 'Type of duration calculation: duration (days) or fees (total amount)';
COMMENT ON COLUMN public.contracts.duration_in_days IS 'Contract duration in days (when duration_type is duration)';
COMMENT ON COLUMN public.contracts.total_fees IS 'Total fees amount (when duration_type is fees)';
COMMENT ON COLUMN public.contracts.add_ons IS 'JSON array of selected add-ons with their details';
