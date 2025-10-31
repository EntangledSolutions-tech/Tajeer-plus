-- Add hold-related columns to contracts table
-- This migration adds columns to track contract hold information

-- Add hold-related columns to contracts table
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS hold_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS hold_comments TEXT,
ADD COLUMN IF NOT EXISTS hold_date TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.contracts.hold_reason IS 'Reason for putting the contract on hold';
COMMENT ON COLUMN public.contracts.hold_comments IS 'Additional comments about the hold';
COMMENT ON COLUMN public.contracts.hold_date IS 'Date when the contract was put on hold';
