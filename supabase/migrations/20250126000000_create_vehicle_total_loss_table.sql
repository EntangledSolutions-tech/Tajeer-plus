-- Create vehicle total loss table
CREATE TABLE IF NOT EXISTS public.vehicle_total_loss (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insurance_company VARCHAR(255) NOT NULL,
    insurance_amount DECIMAL(10,2) NOT NULL,
    depreciation_date DATE NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vehicle_total_loss ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "vehicle_total_loss_read" ON public.vehicle_total_loss
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "vehicle_total_loss_insert" ON public.vehicle_total_loss
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "vehicle_total_loss_update" ON public.vehicle_total_loss
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "vehicle_total_loss_delete" ON public.vehicle_total_loss
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_total_loss_vehicle_id ON public.vehicle_total_loss(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_total_loss_user_id ON public.vehicle_total_loss(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_total_loss_depreciation_date ON public.vehicle_total_loss(depreciation_date);

-- Add comments for documentation
COMMENT ON TABLE public.vehicle_total_loss IS 'Records of vehicles marked as total loss';
COMMENT ON COLUMN public.vehicle_total_loss.depreciation_date IS 'Date when the vehicle was marked as total loss';
COMMENT ON COLUMN public.vehicle_total_loss.details IS 'Description of the total loss incident';
COMMENT ON COLUMN public.vehicle_total_loss.insurance_amount IS 'Insurance payout amount for the total loss';
COMMENT ON COLUMN public.vehicle_total_loss.insurance_company IS 'Insurance company that processed the total loss claim';
