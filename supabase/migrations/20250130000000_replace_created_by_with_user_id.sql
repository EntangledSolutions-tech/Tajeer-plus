-- Migration to replace created_by with user_id in all tables
-- This migration standardizes user ownership tracking across all tables

-- 1. CONTRACTS TABLE
-- Add user_id column and migrate data from created_by
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrate existing data: set user_id = created_by for existing records
UPDATE public.contracts SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;

-- Make user_id NOT NULL after migration
ALTER TABLE public.contracts ALTER COLUMN user_id SET NOT NULL;

-- Drop the old created_by and updated_by columns
ALTER TABLE public.contracts DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.contracts DROP COLUMN IF EXISTS updated_by;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);

-- 2. CUSTOMERS TABLE
-- Add user_id column (customers table doesn't have created_by, so we'll add it)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- 3. INSURANCE POLICIES TABLE (if it exists)
-- Check if insurance_policies table exists and add user_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_policies' AND table_schema = 'public') THEN
        ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON public.insurance_policies(user_id);
    END IF;
END $$;

-- 4. SIMPLE INSURANCE OPTIONS TABLE (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simple_insurance_options' AND table_schema = 'public') THEN
        ALTER TABLE public.simple_insurance_options ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_simple_insurance_options_user_id ON public.simple_insurance_options(user_id);
    END IF;
END $$;

-- 5. VEHICLE CONFIGURATION TABLES
-- These are shared configuration tables, but we'll add user_id for tracking who created them

-- Vehicle Makes
ALTER TABLE public.vehicle_makes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_makes SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_makes DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_makes DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_user_id ON public.vehicle_makes(user_id);

-- Vehicle Models
ALTER TABLE public.vehicle_models ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_models SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_models DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_models DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_models_user_id ON public.vehicle_models(user_id);

-- Vehicle Colors
ALTER TABLE public.vehicle_colors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_colors SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_colors DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_colors DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_colors_user_id ON public.vehicle_colors(user_id);

-- Vehicle Statuses
ALTER TABLE public.vehicle_statuses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_statuses SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_statuses DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_statuses DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_statuses_user_id ON public.vehicle_statuses(user_id);

-- Vehicle Owners
ALTER TABLE public.vehicle_owners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_owners SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_owners DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_owners DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_owners_user_id ON public.vehicle_owners(user_id);

-- Vehicle Actual Users
ALTER TABLE public.vehicle_actual_users ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_actual_users SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_actual_users DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_actual_users DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_actual_users_user_id ON public.vehicle_actual_users(user_id);

-- Vehicle Features
ALTER TABLE public.vehicle_features ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.vehicle_features SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.vehicle_features DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.vehicle_features DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_vehicle_features_user_id ON public.vehicle_features(user_id);

-- 6. CUSTOMER CONFIGURATION TABLES

-- Customer Nationalities
ALTER TABLE public.customer_nationalities ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.customer_nationalities SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.customer_nationalities DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.customer_nationalities DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_customer_nationalities_user_id ON public.customer_nationalities(user_id);

-- Customer Professions
ALTER TABLE public.customer_professions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.customer_professions SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.customer_professions DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.customer_professions DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_customer_professions_user_id ON public.customer_professions(user_id);

-- Customer Classifications
ALTER TABLE public.customer_classifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.customer_classifications SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.customer_classifications DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.customer_classifications DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_customer_classifications_user_id ON public.customer_classifications(user_id);

-- Customer License Types
ALTER TABLE public.customer_license_types ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.customer_license_types SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.customer_license_types DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.customer_license_types DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_customer_license_types_user_id ON public.customer_license_types(user_id);

-- Customer Statuses
ALTER TABLE public.customer_statuses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.customer_statuses SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.customer_statuses DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.customer_statuses DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_customer_statuses_user_id ON public.customer_statuses(user_id);

-- 7. CONTRACT CONFIGURATION TABLES

-- Contract Statuses
ALTER TABLE public.contract_statuses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.contract_statuses SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.contract_statuses DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.contract_statuses DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_contract_statuses_user_id ON public.contract_statuses(user_id);

-- 8. ROLES AND PROFILES TABLES

-- Roles
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.roles SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.roles DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.roles DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON public.roles(user_id);

-- Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.profiles SET user_id = created_by WHERE created_by IS NOT NULL AND user_id IS NULL;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS updated_by;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 9. ENABLE ROW LEVEL SECURITY ON USER-SPECIFIC TABLES

-- Enable RLS on contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contracts
DROP POLICY IF EXISTS "contracts_read" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete" ON public.contracts;

CREATE POLICY "contracts_read" ON public.contracts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "contracts_insert" ON public.contracts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "contracts_update" ON public.contracts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "contracts_delete" ON public.contracts
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
DROP POLICY IF EXISTS "customers_read" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "customers_delete" ON public.customers;

CREATE POLICY "customers_read" ON public.customers
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "customers_insert" ON public.customers
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "customers_update" ON public.customers
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "customers_delete" ON public.customers
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Enable RLS on insurance_policies if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_policies' AND table_schema = 'public') THEN
        ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "insurance_policies_read" ON public.insurance_policies;
        DROP POLICY IF EXISTS "insurance_policies_insert" ON public.insurance_policies;
        DROP POLICY IF EXISTS "insurance_policies_update" ON public.insurance_policies;
        DROP POLICY IF EXISTS "insurance_policies_delete" ON public.insurance_policies;

        CREATE POLICY "insurance_policies_read" ON public.insurance_policies
            FOR SELECT TO authenticated
            USING (user_id = auth.uid());

        CREATE POLICY "insurance_policies_insert" ON public.insurance_policies
            FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid());

        CREATE POLICY "insurance_policies_update" ON public.insurance_policies
            FOR UPDATE TO authenticated
            USING (user_id = auth.uid());

        CREATE POLICY "insurance_policies_delete" ON public.insurance_policies
            FOR DELETE TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Enable RLS on simple_insurance_options if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simple_insurance_options' AND table_schema = 'public') THEN
        ALTER TABLE public.simple_insurance_options ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "simple_insurance_options_read" ON public.simple_insurance_options;
        DROP POLICY IF EXISTS "simple_insurance_options_insert" ON public.simple_insurance_options;
        DROP POLICY IF EXISTS "simple_insurance_options_update" ON public.simple_insurance_options;
        DROP POLICY IF EXISTS "simple_insurance_options_delete" ON public.simple_insurance_options;

        CREATE POLICY "simple_insurance_options_read" ON public.simple_insurance_options
            FOR SELECT TO authenticated
            USING (user_id = auth.uid());

        CREATE POLICY "simple_insurance_options_insert" ON public.simple_insurance_options
            FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid());

        CREATE POLICY "simple_insurance_options_update" ON public.simple_insurance_options
            FOR UPDATE TO authenticated
            USING (user_id = auth.uid());

        CREATE POLICY "simple_insurance_options_delete" ON public.simple_insurance_options
            FOR DELETE TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.contracts.user_id IS 'The user who owns this contract';
COMMENT ON COLUMN public.customers.user_id IS 'The user who owns this customer record';
COMMENT ON COLUMN public.vehicle_makes.user_id IS 'The user who created this vehicle make';
COMMENT ON COLUMN public.vehicle_models.user_id IS 'The user who created this vehicle model';
COMMENT ON COLUMN public.vehicle_colors.user_id IS 'The user who created this vehicle color';
COMMENT ON COLUMN public.vehicle_statuses.user_id IS 'The user who created this vehicle status';
COMMENT ON COLUMN public.vehicle_owners.user_id IS 'The user who created this vehicle owner';
COMMENT ON COLUMN public.vehicle_actual_users.user_id IS 'The user who created this vehicle actual user';
COMMENT ON COLUMN public.vehicle_features.user_id IS 'The user who created this vehicle feature';
COMMENT ON COLUMN public.customer_nationalities.user_id IS 'The user who created this customer nationality';
COMMENT ON COLUMN public.customer_professions.user_id IS 'The user who created this customer profession';
COMMENT ON COLUMN public.customer_classifications.user_id IS 'The user who created this customer classification';
COMMENT ON COLUMN public.customer_license_types.user_id IS 'The user who created this customer license type';
COMMENT ON COLUMN public.customer_statuses.user_id IS 'The user who created this customer status';
COMMENT ON COLUMN public.contract_statuses.user_id IS 'The user who created this contract status';
COMMENT ON COLUMN public.roles.user_id IS 'The user who created this role';
COMMENT ON COLUMN public.profiles.user_id IS 'The user who created this profile';
