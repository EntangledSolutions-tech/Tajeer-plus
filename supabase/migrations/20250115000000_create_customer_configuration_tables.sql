-- Create customer configuration tables
-- This migration creates tables for managing customer configurations

-- Customer Nationalities table
CREATE TABLE IF NOT EXISTS public.customer_nationalities (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    nationality VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Customer Professions table
CREATE TABLE IF NOT EXISTS public.customer_professions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    profession VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Customer Classifications table
CREATE TABLE IF NOT EXISTS public.customer_classifications (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    classification VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Customer License Types table
CREATE TABLE IF NOT EXISTS public.customer_license_types (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    code INTEGER GENERATED ALWAYS AS IDENTITY,
    license_type VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_nationalities_code ON public.customer_nationalities(code);
CREATE INDEX IF NOT EXISTS idx_customer_nationalities_nationality ON public.customer_nationalities(nationality);
CREATE INDEX IF NOT EXISTS idx_customer_nationalities_is_active ON public.customer_nationalities(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_professions_code ON public.customer_professions(code);
CREATE INDEX IF NOT EXISTS idx_customer_professions_profession ON public.customer_professions(profession);
CREATE INDEX IF NOT EXISTS idx_customer_professions_is_active ON public.customer_professions(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_classifications_code ON public.customer_classifications(code);
CREATE INDEX IF NOT EXISTS idx_customer_classifications_classification ON public.customer_classifications(classification);
CREATE INDEX IF NOT EXISTS idx_customer_classifications_is_active ON public.customer_classifications(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_license_types_code ON public.customer_license_types(code);
CREATE INDEX IF NOT EXISTS idx_customer_license_types_license_type ON public.customer_license_types(license_type);
CREATE INDEX IF NOT EXISTS idx_customer_license_types_is_active ON public.customer_license_types(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_customer_nationalities_updated_at
    BEFORE UPDATE ON public.customer_nationalities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_customer_professions_updated_at
    BEFORE UPDATE ON public.customer_professions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_customer_classifications_updated_at
    BEFORE UPDATE ON public.customer_classifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_customer_license_types_updated_at
    BEFORE UPDATE ON public.customer_license_types
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE public.customer_nationalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_license_types ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON public.customer_nationalities
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.customer_nationalities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.customer_nationalities
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.customer_nationalities
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON public.customer_professions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.customer_professions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.customer_professions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.customer_professions
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON public.customer_classifications
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.customer_classifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.customer_classifications
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.customer_classifications
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON public.customer_license_types
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.customer_license_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.customer_license_types
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.customer_license_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert initial nationality data
INSERT INTO public.customer_nationalities (nationality, description) VALUES
('Saudi Arabian', 'Citizens of Saudi Arabia'),
('American', 'Citizens of United States of America'),
('British', 'Citizens of United Kingdom'),
('Canadian', 'Citizens of Canada'),
('French', 'Citizens of France'),
('German', 'Citizens of Germany'),
('Indian', 'Citizens of India'),
('Pakistani', 'Citizens of Pakistan'),
('Egyptian', 'Citizens of Egypt'),
('Jordanian', 'Citizens of Jordan'),
('Lebanese', 'Citizens of Lebanon'),
('Syrian', 'Citizens of Syria'),
('UAE', 'Citizens of United Arab Emirates'),
('Kuwaiti', 'Citizens of Kuwait'),
('Qatari', 'Citizens of Qatar'),
('Bahraini', 'Citizens of Bahrain'),
('Omani', 'Citizens of Oman'),
('Yemeni', 'Citizens of Yemen'),
('Iraqi', 'Citizens of Iraq'),
('Turkish', 'Citizens of Turkey'),
('Iranian', 'Citizens of Iran'),
('Afghan', 'Citizens of Afghanistan'),
('Bangladeshi', 'Citizens of Bangladesh'),
('Sri Lankan', 'Citizens of Sri Lanka'),
('Filipino', 'Citizens of Philippines'),
('Indonesian', 'Citizens of Indonesia'),
('Malaysian', 'Citizens of Malaysia'),
('Thai', 'Citizens of Thailand'),
('Chinese', 'Citizens of China'),
('Japanese', 'Citizens of Japan'),
('Korean', 'Citizens of South Korea'),
('Russian', 'Citizens of Russia'),
('Australian', 'Citizens of Australia'),
('Nepalese', 'Citizens of Nepal'),
('Sudanese', 'Citizens of Sudan'),
('Ethiopian', 'Citizens of Ethiopia'),
('Moroccan', 'Citizens of Morocco'),
('Tunisian', 'Citizens of Tunisia'),
('Algerian', 'Citizens of Algeria'),
('Libyan', 'Citizens of Libya')
ON CONFLICT (nationality) DO NOTHING;

-- Insert initial profession data
INSERT INTO public.customer_professions (profession, description) VALUES
('Engineer', 'Engineering professionals'),
('Doctor', 'Medical professionals'),
('Teacher', 'Education professionals'),
('Lawyer', 'Legal professionals'),
('Accountant', 'Accounting and finance professionals'),
('Business Owner', 'Business owners and entrepreneurs'),
('Manager', 'Management professionals'),
('Consultant', 'Consulting professionals'),
('Sales Representative', 'Sales professionals'),
('IT Professional', 'Information technology professionals'),
('Student', 'Students and academics'),
('Retired', 'Retired individuals'),
('Government Employee', 'Government sector employees'),
('Private Sector Employee', 'Private sector employees'),
('Self Employed', 'Self employed individuals'),
('Unemployed', 'Currently unemployed'),
('Housewife', 'Homemakers'),
('Other', 'Other professions')
ON CONFLICT (profession) DO NOTHING;

-- Insert initial classification data
INSERT INTO public.customer_classifications (classification, description) VALUES
('Individual', 'Individual customers'),
('Corporate', 'Corporate customers'),
('VIP', 'VIP customers'),
('Government', 'Government entities'),
('Diplomatic', 'Diplomatic missions'),
('Tourist', 'Tourist customers'),
('Resident', 'Resident customers'),
('Student', 'Student customers'),
('Business', 'Business customers'),
('Premium', 'Premium customers')
ON CONFLICT (classification) DO NOTHING;

-- Insert initial license type data
INSERT INTO public.customer_license_types (license_type, description) VALUES
('Class 1', 'Private vehicle license'),
('Class 2', 'Light truck license'),
('Class 3', 'Heavy truck license'),
('Class 4', 'Bus license'),
('Class 5', 'Motorcycle license'),
('International', 'International driving license'),
('Temporary', 'Temporary driving license'),
('Learner', 'Learner driving license'),
('Commercial', 'Commercial driving license'),
('Chauffeur', 'Chauffeur license')
ON CONFLICT (license_type) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.customer_nationalities IS 'Customer nationality configuration';
COMMENT ON TABLE public.customer_professions IS 'Customer profession configuration';
COMMENT ON TABLE public.customer_classifications IS 'Customer classification configuration';
COMMENT ON TABLE public.customer_license_types IS 'Customer license type configuration';
