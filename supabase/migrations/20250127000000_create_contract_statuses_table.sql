-- Create contract statuses table similar to vehicle and customer statuses
-- This migration creates a normalized contract status table and updates existing contracts table

-- Create contract_statuses table
CREATE TABLE IF NOT EXISTS public.contract_statuses (
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
CREATE INDEX IF NOT EXISTS idx_contract_statuses_code ON public.contract_statuses(code);
CREATE INDEX IF NOT EXISTS idx_contract_statuses_name ON public.contract_statuses(name);

-- Create updated_at trigger
CREATE TRIGGER trigger_contract_statuses_updated_at
    BEFORE UPDATE ON public.contract_statuses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default contract statuses
INSERT INTO public.contract_statuses (name, description, color) VALUES
('Draft', 'Contract is in draft state and not yet finalized', '#6B7280'),
('Active', 'Contract is active and vehicle is rented', '#10B981'),
('Completed', 'Contract has been completed successfully', '#3B82F6'),
('Cancelled', 'Contract has been cancelled', '#EF4444'),
('Expired', 'Contract has expired', '#F59E0B'),
('Suspended', 'Contract is temporarily suspended', '#8B5CF6');

-- Add status_id column to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS status_id UUID REFERENCES public.contract_statuses(id) ON DELETE SET NULL;

-- Update existing contracts to reference the new status table
-- Map existing status values to the new contract_statuses table
UPDATE public.contracts
SET status_id = (
    SELECT id FROM public.contract_statuses
    WHERE name = INITCAP(contracts.status)
)
WHERE status IS NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE public.contract_statuses IS 'Contract status configuration table for rental contracts';
