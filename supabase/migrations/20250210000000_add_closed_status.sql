-- Add "Closed" status to contract_statuses table
-- This migration adds a new "Closed" status for contracts that are closed

-- Check if "Closed" status already exists, if not insert it
INSERT INTO public.contract_statuses (name, description, color)
SELECT 'Closed', 'Contract has been closed', '#DC2626'
WHERE NOT EXISTS (
    SELECT 1 FROM public.contract_statuses WHERE name = 'Closed'
);

-- Add comment for documentation
COMMENT ON TABLE public.contract_statuses IS 'Contract status options including Draft, Active, Completed, Cancelled, Expired, Suspended, On Hold, and Closed';

