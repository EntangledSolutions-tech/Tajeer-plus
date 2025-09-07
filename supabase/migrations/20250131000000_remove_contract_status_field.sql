-- Remove the status field from contracts table since we're now using status_id
-- This migration removes the hardcoded status field and keeps only status_id

-- First, ensure all contracts have a status_id before removing the status field
-- Update any contracts that might not have a status_id set
UPDATE public.contracts
SET status_id = (
    SELECT id FROM public.contract_statuses
    WHERE name = INITCAP(contracts.status)
)
WHERE status_id IS NULL AND status IS NOT NULL;

-- Remove the check constraint on status field
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Remove the status column
ALTER TABLE public.contracts DROP COLUMN IF EXISTS status;

-- Add comment for documentation
COMMENT ON COLUMN public.contracts.status_id IS 'Reference to contract_statuses table for normalized status management';
