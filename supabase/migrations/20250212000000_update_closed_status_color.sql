-- Update "Closed" status color to green
-- This migration changes the Closed status color from red to green

-- Update the color of "Closed" status to green
UPDATE public.contract_statuses
SET color = '#10B981'
WHERE name = 'Closed';

-- Add comment for documentation
COMMENT ON TABLE public.contract_statuses IS 'Contract status options with updated Closed status color (green)';

