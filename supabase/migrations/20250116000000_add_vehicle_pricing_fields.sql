-- Add new vehicle pricing and depreciation fields
-- This migration adds car_pricing, acquisition_date, operation_date, and depreciation_rate fields to the vehicles table

ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS car_pricing DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS acquisition_date DATE,
ADD COLUMN IF NOT EXISTS operation_date DATE,
ADD COLUMN IF NOT EXISTS depreciation_rate DECIMAL(5,2) CHECK (depreciation_rate >= 0 AND depreciation_rate <= 100);

-- Add comments for documentation
COMMENT ON COLUMN public.vehicles.car_pricing IS 'Current market value/pricing of the vehicle';
COMMENT ON COLUMN public.vehicles.acquisition_date IS 'Date when the vehicle was acquired';
COMMENT ON COLUMN public.vehicles.operation_date IS 'Date when the vehicle started operations';
COMMENT ON COLUMN public.vehicles.depreciation_rate IS 'Annual depreciation rate as percentage (0-100)';

-- Create indexes for the new date fields if needed for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_acquisition_date ON public.vehicles(acquisition_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_operation_date ON public.vehicles(operation_date);

