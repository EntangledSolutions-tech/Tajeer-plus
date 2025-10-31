-- Create system settings table for storing global configuration values
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_active ON public.system_settings(is_active);

-- Create updated_at trigger
CREATE TRIGGER trigger_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default setting for contract cancellation window
INSERT INTO public.system_settings (key, value, description, category)
VALUES ('cancelWindowHours', '24', 'Number of hours from contract start time during which cancellation is allowed', 'contracts')
ON CONFLICT (key) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.system_settings IS 'Global system configuration settings';
COMMENT ON COLUMN public.system_settings.key IS 'Unique key for the setting (e.g., cancelWindowHours)';
COMMENT ON COLUMN public.system_settings.value IS 'Value of the setting as text';
COMMENT ON COLUMN public.system_settings.description IS 'Human-readable description of the setting';
COMMENT ON COLUMN public.system_settings.category IS 'Category/group of the setting (e.g., contracts, vehicles)';

