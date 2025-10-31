-- Migration: Convert selected_customer_id and selected_vehicle_id to proper foreign keys
-- This migration updates the contracts table to use proper UUID foreign keys instead of varchar

-- First, ensure all existing contract data has valid UUIDs (if there's existing data)
-- Delete any contracts with invalid customer or vehicle references
DELETE FROM public.contracts
WHERE selected_customer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.customers WHERE id::text = selected_customer_id
  );

DELETE FROM public.contracts
WHERE selected_vehicle_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.vehicles WHERE id::text = selected_vehicle_id
  );

-- Drop the old varchar columns and recreate as UUID with foreign keys
-- Step 1: Alter selected_customer_id
ALTER TABLE public.contracts
  ALTER COLUMN selected_customer_id TYPE UUID USING selected_customer_id::uuid;

-- Step 2: Alter selected_vehicle_id
ALTER TABLE public.contracts
  ALTER COLUMN selected_vehicle_id TYPE UUID USING selected_vehicle_id::uuid,
  ALTER COLUMN selected_vehicle_id SET NOT NULL;

-- Step 3: Add foreign key constraints
ALTER TABLE public.contracts
  ADD CONSTRAINT fk_contracts_customer
    FOREIGN KEY (selected_customer_id)
    REFERENCES public.customers(id)
    ON DELETE SET NULL;

ALTER TABLE public.contracts
  ADD CONSTRAINT fk_contracts_vehicle
    FOREIGN KEY (selected_vehicle_id)
    REFERENCES public.vehicles(id)
    ON DELETE RESTRICT;

-- Update comments for documentation
COMMENT ON COLUMN public.contracts.selected_customer_id IS 'Foreign key reference to customers table';
COMMENT ON COLUMN public.contracts.selected_vehicle_id IS 'Foreign key reference to vehicles table (required)';

-- The indexes already exist from the original migration:
-- idx_contracts_customer_id and idx_contracts_vehicle_id
-- No need to recreate them

-- Update any redundant columns that should be removed in future
-- These columns store duplicate data that should come from joins:
-- customer_name, customer_id_type, customer_id_number, customer_classification,
-- customer_date_of_birth, customer_license_type, customer_address,
-- vehicle_plate, vehicle_serial_number

COMMENT ON TABLE public.contracts IS 'Rental contracts linking customers and vehicles. Customer and vehicle details should be fetched via joins using selected_customer_id and selected_vehicle_id foreign keys.';


