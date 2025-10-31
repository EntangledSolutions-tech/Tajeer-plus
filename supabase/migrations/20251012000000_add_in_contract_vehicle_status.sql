-- Add "In Contract" vehicle status with code 11
-- This migration adds additional vehicle statuses to reach code 11 for "In Contract"

-- Insert additional vehicle statuses to reach code 11
-- The code field is auto-incremented, so we need to add statuses in order
INSERT INTO public.vehicle_statuses (name, description, color) VALUES
('Sold', 'Vehicle has been sold', '#9CA3AF'),
('Under Inspection', 'Vehicle is undergoing inspection', '#F59E0B'),
('Awaiting Registration', 'Vehicle is awaiting registration', '#FCD34D'),
('In Transit', 'Vehicle is being transported', '#60A5FA'),
('Insurance Pending', 'Vehicle insurance is pending', '#F97316'),
('In Contract', 'Vehicle is currently in a rental contract', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Verify the code assignment (for logging/debugging purposes)
-- This will help administrators verify that "In Contract" has the correct code
DO $$
DECLARE
    status_code INTEGER;
    status_name VARCHAR;
    status_id UUID;
BEGIN
    SELECT code, name, id INTO status_code, status_name, status_id
    FROM public.vehicle_statuses
    WHERE name = 'In Contract';

    IF status_code IS NOT NULL THEN
        RAISE NOTICE 'Vehicle status "%" (ID: %) has been assigned code: %', status_name, status_id, status_code;
    ELSE
        RAISE WARNING 'Vehicle status "In Contract" was not found in the database';
    END IF;
END $$;

