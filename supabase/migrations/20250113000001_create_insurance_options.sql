-- Create insurance_options table for simple insurance list
CREATE TABLE IF NOT EXISTS public.insurance_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code SERIAL UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    deductible_premium DECIMAL(12,2) NOT NULL CHECK (deductible_premium >= 0),
    rental_increase_type VARCHAR(20) NOT NULL CHECK (rental_increase_type IN ('value', 'percentage')),
    rental_increase_value DECIMAL(12,2) CHECK (rental_increase_value >= 0),
    rental_increase_percentage DECIMAL(5,2) CHECK (rental_increase_percentage >= 0 AND rental_increase_percentage <= 100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_options_code ON public.insurance_options(code);
CREATE INDEX IF NOT EXISTS idx_insurance_options_is_active ON public.insurance_options(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_options_name ON public.insurance_options(name);

-- Apply the updated_at trigger
CREATE TRIGGER trigger_insurance_options_updated_at
    BEFORE UPDATE ON public.insurance_options
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE public.insurance_options ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON public.insurance_options
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.insurance_options
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.insurance_options
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.insurance_options
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data matching the image
INSERT INTO public.insurance_options (name, deductible_premium, rental_increase_type, rental_increase_value, rental_increase_percentage) VALUES
('Comprehensive Insurance', 1500.00, 'value', 2300.00, NULL),
('Comprehensive+ Insurance', 2500.00, 'percentage', NULL, 15.00),
('Third-Party Insurance', 100.00, 'percentage', NULL, 25.00)
ON CONFLICT DO NOTHING;
