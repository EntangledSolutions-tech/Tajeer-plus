-- Create documents storage bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- RLS policies for documents storage bucket
create policy documents_storage_policy on storage.objects for all using (
  bucket_id = 'documents'
) with check (
  bucket_id = 'documents'
);

-- Ensure vehicle_documents table exists with proper structure
create table if not exists public.vehicle_documents (
  id uuid unique not null default extensions.uuid_generate_v4(),
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  document_name varchar(255),
  document_url text,
  uploaded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS on vehicle_documents table
alter table "public"."vehicle_documents"
  enable row level security;

-- RLS policies for vehicle_documents
create policy vehicle_documents_read on public.vehicle_documents for
  select
  to authenticated using (true);

create policy vehicle_documents_insert on public.vehicle_documents for
  insert
  to authenticated with check (true);

create policy vehicle_documents_update on public.vehicle_documents for
  update
  to authenticated using (true)
  with check (true);

create policy vehicle_documents_delete on public.vehicle_documents for
  delete
  to authenticated using (true);

-- Grant permissions
grant all on public.vehicle_documents to authenticated, service_role;

-- Create index for better performance
create index if not exists idx_vehicle_documents_vehicle_id on public.vehicle_documents(vehicle_id);

-- Insert sample documents for testing
insert into public.vehicle_documents (vehicle_id, document_name, document_url, uploaded_at)
select
  v.id,
  'Car_18_17.jpg',
  '/documents/car_18_17.jpg',
  '2024-01-15 10:00:00+00'::timestamp with time zone
from public.vehicles v where v.plate_number = 'Z27846'
union all
select
  v.id,
  'Car_14_17.jpg',
  '/documents/car_14_17.jpg',
  '2024-01-10 14:30:00+00'::timestamp with time zone
from public.vehicles v where v.plate_number = 'Z27846'
union all
select
  v.id,
  'Car_24_17.jpg',
  '/documents/car_24_17.jpg',
  '2024-01-05 09:15:00+00'::timestamp with time zone
from public.vehicles v where v.plate_number = 'Z27846';