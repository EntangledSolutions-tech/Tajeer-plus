-- Create customer statuses table similar to vehicle statuses
-- This migration creates a normalized customer status table and updates existing customers table

-- Create customer_statuses table
CREATE TABLE IF NOT EXISTS public.customer_statuses (
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customer_statuses_code ON public.customer_statuses(code);
CREATE INDEX IF NOT EXISTS idx_customer_statuses_name ON public.customer_statuses(name);

-- Create updated_at trigger
CREATE TRIGGER trigger_customer_statuses_updated_at
    BEFORE UPDATE ON public.customer_statuses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default customer statuses
INSERT INTO public.customer_statuses (name, description, color) VALUES
('Active', 'Customer is active and can make rentals', '#10B981'),
('Inactive', 'Customer is temporarily inactive', '#6B7280'),
('Blacklisted', 'Customer is blacklisted due to violations', '#EF4444'),
('Suspended', 'Customer account is suspended', '#F59E0B'),
('VIP', 'VIP customer with special privileges', '#8B5CF6'),
('Corporate', 'Corporate customer with business account', '#3B82F6');

-- Add status_id column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status_id UUID REFERENCES public.customer_statuses(id) ON DELETE SET NULL;

-- Update existing customers to reference the new status table
-- Map existing status values to the new customer_statuses table
UPDATE public.customers
SET status_id = (
    SELECT id FROM public.customer_statuses
    WHERE LOWER(name) = LOWER(COALESCE(customers.status, 'Active'))
    LIMIT 1
);

-- Set default status for customers without a status
UPDATE public.customers
SET status_id = (
    SELECT id FROM public.customer_statuses
    WHERE name = 'Active'
    LIMIT 1
)
WHERE status_id IS NULL;

-- Create index on the new status_id column
CREATE INDEX IF NOT EXISTS idx_customers_status_id ON public.customers(status_id);

-- Keep the old status column for now to avoid breaking existing code
-- We can remove it in a future migration after updating all application code
-- ALTER TABLE public.customers DROP COLUMN status;

