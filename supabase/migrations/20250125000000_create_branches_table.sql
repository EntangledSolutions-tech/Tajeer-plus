-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_name VARCHAR(255),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_branches_user_id ON public.branches(user_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON public.branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON public.branches(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own branches" ON public.branches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branches" ON public.branches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branches" ON public.branches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branches" ON public.branches
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample branches for testing
INSERT INTO public.branches (name, code, address, phone, email, manager_name, user_id, is_active)
SELECT
  'Main Branch',
  'MAIN001',
  '123 Main Street, Riyadh, Saudi Arabia',
  '+966123456789',
  'main@company.com',
  'Ahmed Al-Rashid',
  u.id,
  true
FROM auth.users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

INSERT INTO public.branches (name, code, address, phone, email, manager_name, user_id, is_active)
SELECT
  'North Branch',
  'NORTH001',
  '456 North Avenue, Jeddah, Saudi Arabia',
  '+966987654321',
  'north@company.com',
  'Fatima Al-Zahra',
  u.id,
  true
FROM auth.users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

INSERT INTO public.branches (name, code, address, phone, email, manager_name, user_id, is_active)
SELECT
  'East Branch',
  'EAST001',
  '789 East Road, Dammam, Saudi Arabia',
  '+966555666777',
  'east@company.com',
  'Mohammed Al-Fahad',
  u.id,
  true
FROM auth.users u
WHERE u.email = 'admin@example.com'
LIMIT 1;
