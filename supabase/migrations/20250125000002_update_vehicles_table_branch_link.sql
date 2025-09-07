-- Update vehicles table to link to branches table instead of storing branch as text
-- First, let's add the new branch_id column
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON public.vehicles(branch_id);

-- Update existing vehicles to link to a default branch (if any exist)
-- This will link vehicles to the first available branch for each user
UPDATE public.vehicles v
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  WHERE b.user_id = v.user_id
    AND b.is_active = true
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE v.branch_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.user_id = v.user_id AND b.is_active = true
  );

-- We'll keep the old branch column for now to avoid data loss
-- You can remove it later after confirming the migration worked correctly
-- ALTER TABLE public.vehicles DROP COLUMN IF EXISTS branch;
