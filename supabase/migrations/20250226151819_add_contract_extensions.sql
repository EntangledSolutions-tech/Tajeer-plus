-- Add contract extension fields
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS extension_type VARCHAR(20) CHECK (extension_type IN ('fees', 'duration'));
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS extension_fee_amount DECIMAL(10,2);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS extension_duration_days INTEGER;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS extension_payment_method VARCHAR(20) CHECK (extension_payment_method IN ('cash', 'card'));
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS extension_date TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.contracts.extension_type IS 'Type of contract extension: fees or duration';
COMMENT ON COLUMN public.contracts.extension_fee_amount IS 'Fee amount paid for contract extension';
COMMENT ON COLUMN public.contracts.extension_duration_days IS 'Duration in days for contract extension';
COMMENT ON COLUMN public.contracts.extension_payment_method IS 'Payment method used for contract extension';
COMMENT ON COLUMN public.contracts.extension_date IS 'Date when the contract was extended';
