-- Create contract_add_ons table
CREATE TABLE IF NOT EXISTS contract_add_ons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code SERIAL,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contract_add_ons_code ON contract_add_ons(code);
CREATE INDEX IF NOT EXISTS idx_contract_add_ons_is_active ON contract_add_ons(is_active);
CREATE INDEX IF NOT EXISTS idx_contract_add_ons_name ON contract_add_ons(name);

-- Enable RLS (Row Level Security)
ALTER TABLE contract_add_ons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all contract add-ons" ON contract_add_ons
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert contract add-ons" ON contract_add_ons
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contract add-ons" ON contract_add_ons
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete contract add-ons" ON contract_add_ons
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contract_add_ons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER trigger_update_contract_add_ons_updated_at
    BEFORE UPDATE ON contract_add_ons
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_add_ons_updated_at();

-- Insert sample data
INSERT INTO contract_add_ons (name, description, amount, is_active) VALUES
    ('Car delivery', 'Delivery service to customer location', 40.00, true),
    ('Child seat (per day)', 'Child safety seat rental', 45.00, true),
    ('Internet (per day)', 'Mobile internet device rental', 35.00, true),
    ('GPS navigation system', 'GPS navigation device rental', 20.00, true),
    ('Special aid for challenged people', 'Accessibility equipment rental', 40.00, true)
ON CONFLICT DO NOTHING;

