-- Remove NOT NULL constraints from unused required fields in contracts table
-- This migration makes type, insurance_type, and contract_number_type optional
-- since they are not being used in the current form implementation

-- Remove NOT NULL constraint from type field
ALTER TABLE public.contracts ALTER COLUMN type DROP NOT NULL;

-- Remove NOT NULL constraint from insurance_type field
ALTER TABLE public.contracts ALTER COLUMN insurance_type DROP NOT NULL;

-- Remove NOT NULL constraint from contract_number_type field
ALTER TABLE public.contracts ALTER COLUMN contract_number_type DROP NOT NULL;

-- Remove the check constraint on contract_number_type since it's now optional
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_contract_number_type_check;

-- Update existing records to have NULL values for these unused fields if they don't have values
UPDATE public.contracts
SET
    type = NULL,
    insurance_type = NULL,
    contract_number_type = NULL
WHERE
    type = '' OR
    insurance_type = '' OR
    contract_number_type = '';

-- Add comments to clarify these fields are optional
COMMENT ON COLUMN public.contracts.type IS 'Contract type - optional field not currently used in form';
COMMENT ON COLUMN public.contracts.insurance_type IS 'Insurance type - optional field not currently used in form';
COMMENT ON COLUMN public.contracts.contract_number_type IS 'Contract number type - optional field not currently used in form';
