-- Add additional fields to branches table
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS city_region VARCHAR(100),
ADD COLUMN IF NOT EXISTS commercial_registration_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS branch_license_number VARCHAR(50);

-- Add branch roles fields
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS is_rental_office BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_no_cars BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_cars_and_employees BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_maintenance_center BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_shift_system_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_limousine_office BOOLEAN DEFAULT false;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_branches_city_region ON public.branches(city_region);
CREATE INDEX IF NOT EXISTS idx_branches_commercial_registration ON public.branches(commercial_registration_number);
CREATE INDEX IF NOT EXISTS idx_branches_branch_license ON public.branches(branch_license_number);
