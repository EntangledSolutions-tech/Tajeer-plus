-- Create vehicle configuration tables
-- This migration creates tables for managing vehicle configurations

-- Create sequences for remaining tables that still use VARCHAR codes
CREATE SEQUENCE IF NOT EXISTS public.vehicle_owners_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.vehicle_actual_users_code_seq START 1;

-- Vehicle Makes table
CREATE TABLE IF NOT EXISTS public.vehicle_makes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Vehicle Models table
CREATE TABLE IF NOT EXISTS public.vehicle_models (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    make_id UUID REFERENCES public.vehicle_makes(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(name, make_id)
);

-- Vehicle Colors table
CREATE TABLE IF NOT EXISTS public.vehicle_colors (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL UNIQUE,
    hex_code VARCHAR(7),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Vehicle Statuses table
CREATE TABLE IF NOT EXISTS public.vehicle_statuses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Vehicle Owners table
CREATE TABLE IF NOT EXISTS public.vehicle_owners (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL DEFAULT 'OWN' || LPAD(nextval('vehicle_owners_code_seq')::text, 3, '0'),
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Vehicle Actual Users table
CREATE TABLE IF NOT EXISTS public.vehicle_actual_users (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL DEFAULT 'USR' || LPAD(nextval('vehicle_actual_users_code_seq')::text, 3, '0'),
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_code ON public.vehicle_makes(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_name ON public.vehicle_makes(name);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_code ON public.vehicle_models(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_make_id ON public.vehicle_models(make_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_colors_code ON public.vehicle_colors(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_statuses_code ON public.vehicle_statuses(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_owners_code ON public.vehicle_owners(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_actual_users_code ON public.vehicle_actual_users(code);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_vehicle_makes_updated_at
    BEFORE UPDATE ON public.vehicle_makes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_vehicle_models_updated_at
    BEFORE UPDATE ON public.vehicle_models
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_vehicle_colors_updated_at
    BEFORE UPDATE ON public.vehicle_colors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_vehicle_statuses_updated_at
    BEFORE UPDATE ON public.vehicle_statuses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_vehicle_owners_updated_at
    BEFORE UPDATE ON public.vehicle_owners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_vehicle_actual_users_updated_at
    BEFORE UPDATE ON public.vehicle_actual_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data for vehicle statuses
INSERT INTO public.vehicle_statuses (name, description, color) VALUES
('Available', 'Vehicle is available for rental', '#10B981'),
('Rented', 'Vehicle is currently rented out', '#3B82F6'),
('Maintenance', 'Vehicle is under maintenance', '#F59E0B'),
('Out of Service', 'Vehicle is out of service', '#EF4444'),
('Reserved', 'Vehicle is reserved for future rental', '#8B5CF6');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_makes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_models TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_colors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_statuses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_owners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_actual_users TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.vehicle_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_actual_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view vehicle configurations" ON public.vehicle_makes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle configurations" ON public.vehicle_makes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle configurations" ON public.vehicle_makes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle configurations" ON public.vehicle_makes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Apply similar policies to other tables
CREATE POLICY "Allow authenticated users to view vehicle configurations" ON public.vehicle_models
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle configurations" ON public.vehicle_models
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle configurations" ON public.vehicle_models
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle configurations" ON public.vehicle_models
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view vehicle configurations" ON public.vehicle_colors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle configurations" ON public.vehicle_colors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle configurations" ON public.vehicle_colors
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle configurations" ON public.vehicle_colors
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view vehicle configurations" ON public.vehicle_statuses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle configurations" ON public.vehicle_statuses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle configurations" ON public.vehicle_statuses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle configurations" ON public.vehicle_statuses
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view vehicle configurations" ON public.vehicle_owners
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle configurations" ON public.vehicle_owners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle configurations" ON public.vehicle_owners
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle configurations" ON public.vehicle_owners
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view vehicle configurations" ON public.vehicle_actual_users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vehicle configurations" ON public.vehicle_actual_users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vehicle configurations" ON public.vehicle_actual_users
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vehicle configurations" ON public.vehicle_actual_users
    FOR DELETE USING (auth.role() = 'authenticated');
