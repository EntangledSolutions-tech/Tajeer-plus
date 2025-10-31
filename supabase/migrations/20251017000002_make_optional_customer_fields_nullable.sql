-- Make optional customer fields nullable
-- This migration makes classification_id and license_type_id nullable
-- since they are not required for all ID types (e.g., Resident ID)

-- Make classification_id nullable (not required for all ID types)
ALTER TABLE public.customers ALTER COLUMN classification_id DROP NOT NULL;

-- Make license_type_id nullable (not required for all ID types)
ALTER TABLE public.customers ALTER COLUMN license_type_id DROP NOT NULL;

-- Make id_number column not unique since we use it for different purposes per ID type
-- Drop the existing unique constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'customers_id_number_key'
        AND conrelid = 'public.customers'::regclass
    ) THEN
        ALTER TABLE public.customers DROP CONSTRAINT customers_id_number_key;
    END IF;
END $$;

-- Create a unique constraint on id_number and user_id combination instead
-- This ensures a user can't have duplicate ID numbers, but different users can
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_unique_id_number_per_user
ON public.customers(id_number, user_id);

-- Add comments for documentation
COMMENT ON COLUMN public.customers.classification_id IS 'Customer classification - Optional, not required for all ID types';
COMMENT ON COLUMN public.customers.license_type_id IS 'Customer license type - Optional, not required for all ID types';

