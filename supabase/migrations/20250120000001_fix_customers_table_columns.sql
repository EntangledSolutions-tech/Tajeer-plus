-- Fix customers table by removing old string columns and making new foreign key columns required
-- This migration removes the old string-based columns and updates constraints

-- First, drop the old string-based columns
ALTER TABLE public.customers DROP COLUMN IF EXISTS classification;
ALTER TABLE public.customers DROP COLUMN IF EXISTS license_type;
ALTER TABLE public.customers DROP COLUMN IF EXISTS nationality;
ALTER TABLE public.customers DROP COLUMN IF EXISTS status;

-- Make the new foreign key columns NOT NULL since they are required
ALTER TABLE public.customers ALTER COLUMN classification_id SET NOT NULL;
ALTER TABLE public.customers ALTER COLUMN license_type_id SET NOT NULL;
ALTER TABLE public.customers ALTER COLUMN nationality_id SET NOT NULL;
ALTER TABLE public.customers ALTER COLUMN status_id SET NOT NULL;
