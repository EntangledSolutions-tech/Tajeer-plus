-- Create vehicles table with normalized schema
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Vehicle identification
    serial_number VARCHAR(255) NOT NULL,
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    plate_registration_type VARCHAR(50) NOT NULL,
    
    -- Vehicle details (using foreign keys for normalization)
    make_id UUID REFERENCES public.vehicle_makes(id) ON DELETE RESTRICT,
    model_id UUID REFERENCES public.vehicle_models(id) ON DELETE RESTRICT,
    color_id UUID REFERENCES public.vehicle_colors(id) ON DELETE RESTRICT,
    status_id UUID REFERENCES public.vehicle_statuses(id) ON DELETE RESTRICT,
    
    -- Vehicle specifications
    make_year VARCHAR(4) NOT NULL,
    year_of_manufacture INTEGER,
    mileage INTEGER DEFAULT 0,
    age_range VARCHAR(50),
    car_class VARCHAR(50),
    
    -- Business details
    expected_sale_price DECIMAL(10,2),
    branch VARCHAR(255),
    internal_reference VARCHAR(100),
    owner_id UUID REFERENCES public.vehicle_owners(id) ON DELETE SET NULL,
    actual_user_id UUID REFERENCES public.vehicle_actual_users(id) ON DELETE SET NULL,
    
    -- Pricing details
    daily_rental_rate DECIMAL(10,2),
    daily_minimum_rate DECIMAL(10,2),
    daily_hourly_delay_rate DECIMAL(10,2),
    daily_permitted_km INTEGER,
    daily_excess_km_rate DECIMAL(10,2),
    daily_open_km_rate DECIMAL(10,2),
    
    monthly_rental_rate DECIMAL(10,2),
    monthly_minimum_rate DECIMAL(10,2),
    monthly_hourly_delay_rate DECIMAL(10,2),
    monthly_permitted_km INTEGER,
    monthly_excess_km_rate DECIMAL(10,2),
    monthly_open_km_rate DECIMAL(10,2),
    
    hourly_rental_rate DECIMAL(10,2),
    hourly_permitted_km INTEGER,
    hourly_excess_km_rate DECIMAL(10,2),
    
    -- Expiration dates
    form_license_expiration DATE,
    insurance_policy_expiration DATE,
    periodic_inspection_end DATE,
    operating_card_expiration DATE,
    
    -- Vehicle pricing & depreciation
    purchase_date DATE,
    depreciation_years INTEGER,
    purchase_price DECIMAL(10,2),
    lease_amount_increase DECIMAL(10,2),
    
    -- Additional details
    notes TEXT,
    features TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON public.vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_serial_number ON public.vehicles(serial_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_id ON public.vehicles(make_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_id ON public.vehicles(model_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_color_id ON public.vehicles(color_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status_id ON public.vehicles(status_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vehicles" ON public.vehicles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" ON public.vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
