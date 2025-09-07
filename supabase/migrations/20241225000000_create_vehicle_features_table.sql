-- Create vehicle features table
-- This migration creates a table for managing vehicle features

-- Vehicle Features table
CREATE TABLE IF NOT EXISTS public.vehicle_features (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_features_code ON public.vehicle_features(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_features_name ON public.vehicle_features(name);

-- Create trigger for updated_at
CREATE TRIGGER trigger_vehicle_features_updated_at
    BEFORE UPDATE ON public.vehicle_features
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data for vehicle features
INSERT INTO public.vehicle_features (name, description) VALUES
('GPS Navigation', 'Built-in GPS navigation system'),
('Bluetooth Connectivity', 'Bluetooth for phone and audio connectivity'),
('Backup Camera', 'Rear-view backup camera'),
('Leather Seats', 'Premium leather upholstery'),
('Sunroof', 'Electric or manual sunroof'),
('Heated Seats', 'Front and/or rear heated seats'),
('Ventilated Seats', 'Air-conditioned seats'),
('Premium Sound System', 'High-quality audio system'),
('Wireless Charging', 'Wireless phone charging pad'),
('Adaptive Cruise Control', 'Advanced cruise control with distance sensing'),
('Lane Departure Warning', 'System that warns when leaving lane'),
('Blind Spot Monitoring', 'Sensors to detect vehicles in blind spots'),
('Parking Sensors', 'Front and rear parking sensors'),
('Keyless Entry', 'Keyless entry and start system'),
('Dual Zone Climate Control', 'Separate temperature controls for driver and passenger');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_features TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view vehicle features" ON public.vehicle_features
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle features" ON public.vehicle_features
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle features" ON public.vehicle_features
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle features" ON public.vehicle_features
    FOR DELETE USING (auth.role() = 'authenticated');
