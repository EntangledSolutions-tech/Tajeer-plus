-- Add insurance-related fields to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS insurance_policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_value DECIMAL(12,2);

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_policy_id ON public.vehicles(insurance_policy_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_chassis_number ON public.vehicles(chassis_number);

-- Add comments for documentation
COMMENT ON COLUMN public.vehicles.insurance_policy_id IS 'Reference to the insurance policy used for this vehicle';
COMMENT ON COLUMN public.vehicles.chassis_number IS 'Vehicle chassis number (editable field)';
COMMENT ON COLUMN public.vehicles.insurance_value IS 'Insurance value amount (auto-populated from policy amount)';

