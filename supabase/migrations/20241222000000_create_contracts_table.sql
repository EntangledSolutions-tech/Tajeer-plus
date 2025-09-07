-- Create contracts table
create table if not exists public.contracts (
    id uuid primary key default gen_random_uuid(),

    -- Contract Details
    start_date date not null,
    end_date date not null,
    type varchar(50) not null,
    insurance_type varchar(50) not null,
    contract_number_type varchar(20) not null check (contract_number_type in ('dynamic', 'linked')),
    contract_number varchar(100),
    tajeer_number varchar(100),

    -- Customer Details
    customer_type varchar(20) not null check (customer_type in ('existing', 'new')),
    selected_customer_id varchar(100),
    customer_name varchar(255),
    customer_id_type varchar(50),
    customer_id_number varchar(100),
    customer_classification varchar(50),
    customer_date_of_birth date,
    customer_license_type varchar(50),
    customer_address text,

    -- Vehicle Details
    selected_vehicle_id varchar(100) not null,
    vehicle_plate varchar(50) not null,
    vehicle_serial_number varchar(100) not null,

    -- Pricing & Terms
    daily_rental_rate decimal(10,2) not null,
    hourly_delay_rate decimal(10,2) not null,
    current_km varchar(20) not null,
    rental_days integer not null,
    permitted_daily_km integer not null,
    excess_km_rate decimal(10,2) not null,
    payment_method varchar(20) not null check (payment_method in ('cash', 'card')),
    membership_enabled boolean default false,
    total_amount decimal(10,2) not null,

    -- Vehicle Inspection
    selected_inspector varchar(100) not null,
    inspector_name varchar(255) not null,

    -- Documents
    documents_count integer default 0,
    documents jsonb default '[]'::jsonb,

    -- Status and metadata
    status varchar(50) default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id)
);

-- Add comments for documentation
comment on table public.contracts is 'Rental contracts between customers and vehicles';
comment on column public.contracts.contract_number_type is 'Type of contract number: dynamic or linked to Tajeer';
comment on column public.contracts.customer_type is 'Type of customer: existing or new';
comment on column public.contracts.documents is 'JSON array of uploaded documents with metadata';
comment on column public.contracts.status is 'Current status of the contract';

-- Enable RLS
alter table public.contracts enable row level security;

-- RLS policies - allow authenticated users to read and manage contracts
create policy "Users can view all contracts" on public.contracts
    for select using (auth.role() = 'authenticated');

create policy "Users can insert contracts" on public.contracts
    for insert with check (auth.role() = 'authenticated');

create policy "Users can update contracts" on public.contracts
    for update using (auth.role() = 'authenticated');

create policy "Users can delete contracts" on public.contracts
    for delete using (auth.role() = 'authenticated');

-- Indexes for better performance
create index if not exists idx_contracts_customer_id on public.contracts(selected_customer_id);
create index if not exists idx_contracts_vehicle_id on public.contracts(selected_vehicle_id);
create index if not exists idx_contracts_status on public.contracts(status);
create index if not exists idx_contracts_created_at on public.contracts(created_at);
create index if not exists idx_contracts_contract_number on public.contracts(contract_number);

-- Function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_contracts_updated_at
    before update on public.contracts
    for each row execute function public.update_updated_at_column();

-- Grant permissions
grant select, insert, update, delete on public.contracts to authenticated;
