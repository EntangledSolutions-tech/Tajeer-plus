-- Add payment_type and lease-to-own related fields to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS installment_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS number_of_installments INTEGER;

-- Add comment to describe the column
COMMENT ON COLUMN public.vehicles.payment_type IS 'Payment type for the vehicle: cash or LeaseToOwn';
COMMENT ON COLUMN public.vehicles.installment_value IS 'Monthly installment value for lease-to-own vehicles';
COMMENT ON COLUMN public.vehicles.interest_rate IS 'Interest rate percentage for lease-to-own vehicles';
COMMENT ON COLUMN public.vehicles.total_price IS 'Total price for lease-to-own vehicles';
COMMENT ON COLUMN public.vehicles.number_of_installments IS 'Number of installments for lease-to-own vehicles';

