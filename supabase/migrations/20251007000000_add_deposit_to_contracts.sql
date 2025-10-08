-- Add deposit column to contracts
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS deposit DECIMAL(10,2) DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.contracts.deposit IS 'Deposit amount collected for the contract';

