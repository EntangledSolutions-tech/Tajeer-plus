-- Add branch_id to customers and contracts tables
-- This migration ensures that all user data is associated with a specific branch

-- 1. Add branch_id column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON public.customers(branch_id);

-- Update existing customers to link to their user's first active branch
UPDATE public.customers c
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  WHERE b.user_id = c.user_id
    AND b.is_active = true
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE c.branch_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.user_id = c.user_id AND b.is_active = true
  );

-- 2. Add branch_id column to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_contracts_branch_id ON public.contracts(branch_id);

-- Update existing contracts to link to their user's first active branch
UPDATE public.contracts ct
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  WHERE b.user_id = ct.user_id
    AND b.is_active = true
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE ct.branch_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.user_id = ct.user_id AND b.is_active = true
  );

-- Add comments for documentation
COMMENT ON COLUMN public.customers.branch_id IS 'The branch this customer belongs to';
COMMENT ON COLUMN public.contracts.branch_id IS 'The branch this contract belongs to';

