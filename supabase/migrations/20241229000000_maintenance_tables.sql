-- Create maintenance-related tables

-- Oil Change table
CREATE TABLE IF NOT EXISTS public.vehicle_oil_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    oil_change_km INTEGER,
    last_change_date DATE,
    next_change_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Logs table
CREATE TABLE IF NOT EXISTS public.vehicle_service_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warranty table
CREATE TABLE IF NOT EXISTS public.vehicle_warranties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    coverage_until_km INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Penalties & Violations table
CREATE TABLE IF NOT EXISTS public.vehicle_penalties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    penalty_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50),
    contract_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- General Maintenance Logs table
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2),
    invoice_number VARCHAR(50),
    supplier VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.vehicle_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle Inspections table
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    inspection_date DATE NOT NULL,
    inspection_id VARCHAR(50) NOT NULL,
    inspection_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    inspector VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.vehicle_oil_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- RLS policies for all tables
CREATE POLICY "vehicle_oil_changes_read" ON public.vehicle_oil_changes FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_oil_changes_insert" ON public.vehicle_oil_changes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_oil_changes_update" ON public.vehicle_oil_changes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_oil_changes_delete" ON public.vehicle_oil_changes FOR DELETE TO authenticated USING (true);

CREATE POLICY "vehicle_service_logs_read" ON public.vehicle_service_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_service_logs_insert" ON public.vehicle_service_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_service_logs_update" ON public.vehicle_service_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_service_logs_delete" ON public.vehicle_service_logs FOR DELETE TO authenticated USING (true);

CREATE POLICY "vehicle_warranties_read" ON public.vehicle_warranties FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_warranties_insert" ON public.vehicle_warranties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_warranties_update" ON public.vehicle_warranties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_warranties_delete" ON public.vehicle_warranties FOR DELETE TO authenticated USING (true);

CREATE POLICY "vehicle_penalties_read" ON public.vehicle_penalties FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_penalties_insert" ON public.vehicle_penalties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_penalties_update" ON public.vehicle_penalties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_penalties_delete" ON public.vehicle_penalties FOR DELETE TO authenticated USING (true);

CREATE POLICY "vehicle_maintenance_logs_read" ON public.vehicle_maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_maintenance_logs_insert" ON public.vehicle_maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_maintenance_logs_update" ON public.vehicle_maintenance_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_maintenance_logs_delete" ON public.vehicle_maintenance_logs FOR DELETE TO authenticated USING (true);

CREATE POLICY "vehicle_notes_read" ON public.vehicle_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_notes_insert" ON public.vehicle_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_notes_update" ON public.vehicle_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_notes_delete" ON public.vehicle_notes FOR DELETE TO authenticated USING (true);

CREATE POLICY "vehicle_inspections_read" ON public.vehicle_inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_inspections_insert" ON public.vehicle_inspections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vehicle_inspections_update" ON public.vehicle_inspections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_inspections_delete" ON public.vehicle_inspections FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON public.vehicle_oil_changes TO authenticated, service_role;
GRANT ALL ON public.vehicle_service_logs TO authenticated, service_role;
GRANT ALL ON public.vehicle_warranties TO authenticated, service_role;
GRANT ALL ON public.vehicle_penalties TO authenticated, service_role;
GRANT ALL ON public.vehicle_maintenance_logs TO authenticated, service_role;
GRANT ALL ON public.vehicle_notes TO authenticated, service_role;
GRANT ALL ON public.vehicle_inspections TO authenticated, service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_oil_changes_vehicle_id ON public.vehicle_oil_changes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_service_logs_vehicle_id ON public.vehicle_service_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_warranties_vehicle_id ON public.vehicle_warranties(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_penalties_vehicle_id ON public.vehicle_penalties(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_logs_vehicle_id ON public.vehicle_maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_notes_vehicle_id ON public.vehicle_notes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON public.vehicle_inspections(vehicle_id);

-- Insert sample data for testing
INSERT INTO public.vehicle_oil_changes (vehicle_id, oil_change_km, last_change_date, next_change_date)
SELECT id, 48239, '2023-05-12', '2024-05-12'
FROM public.vehicles WHERE plate_number = 'Z27846';

INSERT INTO public.vehicle_service_logs (vehicle_id, service_date, service_type, notes)
SELECT id, '2021-11-22'::date, 'Return from Service', 'Car return after fixing gearbox'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2021-12-15'::date, 'Out for Service', 'Due to gearbox damage'
FROM public.vehicles WHERE plate_number = 'Z27846';

INSERT INTO public.vehicle_warranties (vehicle_id, coverage_until_km)
SELECT id, 122450
FROM public.vehicles WHERE plate_number = 'Z27846';

INSERT INTO public.vehicle_penalties (vehicle_id, penalty_date, amount, status, reason, payment_method, contract_number, notes)
SELECT id, '2022-03-14'::date, 25456.00, 'Late Return', 'Late Return', 'Cash', '123', 'Lorem Ipsum is simply dummy text'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2021-11-22'::date, 9876.00, 'Damage', 'Damage', 'Cash', '241', 'Lorem Ipsum is simply dummy text'
FROM public.vehicles WHERE plate_number = 'Z27846';

INSERT INTO public.vehicle_maintenance_logs (vehicle_id, maintenance_date, maintenance_type, amount, invoice_number, supplier, notes)
SELECT id, '2022-03-14'::date, 'Brake Pad Replacement', 13126.00, 'INV-2428', 'Spot Garage', 'Brakes not working properly'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2021-11-22'::date, 'Interior decoration', 346.00, 'INV-2452', 'Hall Garage', 'Interior had to be deep cleaned'
FROM public.vehicles WHERE plate_number = 'Z27846';

INSERT INTO public.vehicle_notes (vehicle_id, note_date, note_text)
SELECT id, '2022-03-14'::date, 'Lorem ipsum dolor sit amet consectetur. Sollicitudin ornare lorem mauris ornare sit. Sit.'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2021-11-22'::date, 'Lorem ipsum dolor sit amet consectetur. Adipiscing magna ex orci semper morbi ut orci non.'
FROM public.vehicles WHERE plate_number = 'Z27846';

INSERT INTO public.vehicle_inspections (vehicle_id, inspection_date, inspection_id, inspection_type, status, inspector)
SELECT id, '2022-03-14'::date, 'INSP-1248', 'Check-out', 'Done', 'Omar Al-Farid'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2021-11-22'::date, 'INSP-2341', 'Check-in', 'Done', 'Omar Al-Farid'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2020-07-30'::date, 'INSP-3141', 'Check-out', 'Done', 'Yusuf Al-Sayed'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2023-01-05'::date, 'INSP-1249', 'Check-in', 'Done', 'Khalid Al-Attawi'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2022-09-12'::date, 'INSP-5830', 'Check-in', 'Done', 'Khalid Al-Attawi'
FROM public.vehicles WHERE plate_number = 'Z27846'
UNION ALL
SELECT id, '2020-12-15'::date, 'INSP-3902', 'Check-in', 'Done', 'Tarik Al-Ziara'
FROM public.vehicles WHERE plate_number = 'Z27846';