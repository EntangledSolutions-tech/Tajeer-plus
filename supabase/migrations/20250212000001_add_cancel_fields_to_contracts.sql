-- Add cancel fields to contracts table
-- This migration adds fields for tracking contract cancellation information

-- Add cancel_reason column
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(100);

-- Add cancel_comments column
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS cancel_comments TEXT;

-- Add cancel_date column
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS cancel_date TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.contracts.cancel_reason IS 'Reason for cancelling the contract';
COMMENT ON COLUMN public.contracts.cancel_comments IS 'Additional comments about the cancellation';
COMMENT ON COLUMN public.contracts.cancel_date IS 'Date and time when the contract was cancelled';

