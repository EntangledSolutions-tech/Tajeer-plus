-- Add close fields to contracts table
-- This migration adds fields for contract closing functionality

-- Add close_reason field
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS close_reason VARCHAR(100);

-- Add close_comments field
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS close_comments TEXT;

-- Add close_date field
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS close_date TIMESTAMP WITH TIME ZONE;

-- Add last_payment_refresh field
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS last_payment_refresh TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.contracts.close_reason IS 'Reason for closing the contract';
COMMENT ON COLUMN public.contracts.close_comments IS 'Additional comments about closing the contract';
COMMENT ON COLUMN public.contracts.close_date IS 'Date and time when the contract was closed';
COMMENT ON COLUMN public.contracts.last_payment_refresh IS 'Last time payment information was refreshed';

