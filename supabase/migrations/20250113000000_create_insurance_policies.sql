-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    policy_amount DECIMAL(12,2) NOT NULL CHECK (policy_amount >= 0),
    deductible_premium DECIMAL(12,2) NOT NULL CHECK (deductible_premium >= 0),
    policy_type VARCHAR(50) NOT NULL,
    policy_company VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_policies_policy_number ON public.insurance_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_policy_type ON public.insurance_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_is_active ON public.insurance_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_expiry_date ON public.insurance_policies(expiry_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to insurance_policies table
CREATE TRIGGER trigger_insurance_policies_updated_at
    BEFORE UPDATE ON public.insurance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON public.insurance_policies
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.insurance_policies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.insurance_policies
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.insurance_policies
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO public.insurance_policies (name, policy_number, policy_amount, deductible_premium, policy_type, policy_company, expiry_date) VALUES
('Comprehensive Insurance', 'POL-001', 2300.00, 1500.00, 'comprehensive', 'ABC Insurance Company', '2025-12-31'),
('Comprehensive+ Insurance', 'POL-002', 3500.00, 2500.00, 'comprehensive_plus', 'XYZ Insurance Corp', '2025-11-30'),
('Third-Party Insurance', 'POL-003', 800.00, 100.00, 'third_party', 'SafeDrive Insurance', '2025-10-15')
ON CONFLICT (policy_number) DO NOTHING;
