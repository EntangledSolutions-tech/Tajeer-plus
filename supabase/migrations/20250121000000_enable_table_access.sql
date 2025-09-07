-- Simple migration to enable table access for authenticated users
-- This fixes the permission denied errors by adding proper RLS policies

-- Grant basic usage permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable RLS and create policies for main tables that don't have them yet

-- Check and enable RLS for customers table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') THEN
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

        -- Create policy if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = 'customers'
            AND policyname = 'Allow authenticated users full access'
        ) THEN
            CREATE POLICY "Allow authenticated users full access" ON public.customers
                FOR ALL USING (auth.role() = 'authenticated');
        END IF;
    END IF;
END $$;

-- Check and enable RLS for vehicles table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
        ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

        -- Create policy if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = 'vehicles'
            AND policyname = 'Allow authenticated users full access'
        ) THEN
            CREATE POLICY "Allow authenticated users full access" ON public.vehicles
                FOR ALL USING (auth.role() = 'authenticated');
        END IF;
    END IF;
END $$;

-- Check and enable RLS for contracts table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contracts') THEN
        ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

        -- Create policy if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = 'contracts'
            AND policyname = 'Allow authenticated users full access'
        ) THEN
            CREATE POLICY "Allow authenticated users full access" ON public.contracts
                FOR ALL USING (auth.role() = 'authenticated');
        END IF;
    END IF;
END $$;

-- Add policies for other important tables
DO $$
DECLARE
    table_names TEXT[] := ARRAY[
        'customer_contracts',
        'customer_invoices',
        'customer_finance',
        'customer_penalties',
        'customer_branches',
        'customer_documents',
        'vehicle_features',
        'vehicle_accidents',
        'insurance_policies',
        'insurance_options',
        'customer_classifications',
        'customer_license_types',
        'customer_nationalities',
        'customer_statuses',
        'maintenance_records',
        'maintenance_types'
    ];
    current_table TEXT;
BEGIN
    FOREACH current_table IN ARRAY table_names
    LOOP
        -- Check if table exists and enable RLS
        IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = current_table) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', current_table);

            -- Create policy if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies
                WHERE schemaname = 'public'
                AND tablename = current_table
                AND policyname = 'Allow authenticated users full access'
            ) THEN
                EXECUTE format('CREATE POLICY "Allow authenticated users full access" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', current_table);
            END IF;
        END IF;
    END LOOP;
END $$;
