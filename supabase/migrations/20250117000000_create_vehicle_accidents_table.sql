-- Create vehicle accidents table
CREATE TABLE IF NOT EXISTS public.vehicle_accidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    accident_date DATE NOT NULL,
    details TEXT NOT NULL,
    log_maintenance_update BOOLEAN DEFAULT FALSE,

    -- Maintenance amount fields (optional, only when log_maintenance_update is true)
    total_amount DECIMAL(10,2),
    statement_type VARCHAR(50),
    total_discount DECIMAL(10,2),
    vat DECIMAL(10,2),
    net_invoice DECIMAL(10,2),
    total_paid DECIMAL(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vehicle_accidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "vehicle_accidents_read" ON public.vehicle_accidents
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "vehicle_accidents_insert" ON public.vehicle_accidents
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "vehicle_accidents_update" ON public.vehicle_accidents
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "vehicle_accidents_delete" ON public.vehicle_accidents
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_accidents_vehicle_id ON public.vehicle_accidents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_accidents_user_id ON public.vehicle_accidents(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_accidents_accident_date ON public.vehicle_accidents(accident_date);

-- Add comments for documentation
COMMENT ON TABLE public.vehicle_accidents IS 'Records of vehicle accidents with optional maintenance details';
COMMENT ON COLUMN public.vehicle_accidents.accident_date IS 'Date when the accident occurred';
COMMENT ON COLUMN public.vehicle_accidents.details IS 'Description of the accident';
COMMENT ON COLUMN public.vehicle_accidents.log_maintenance_update IS 'Whether this accident should log a maintenance update';
COMMENT ON COLUMN public.vehicle_accidents.total_amount IS 'Total repair/maintenance amount (when logging maintenance)';
COMMENT ON COLUMN public.vehicle_accidents.statement_type IS 'Type of financial statement (Sale, Purchase, etc.)';
