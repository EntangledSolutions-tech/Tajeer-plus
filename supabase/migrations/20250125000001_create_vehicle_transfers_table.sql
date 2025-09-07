-- Create vehicle_transfers table for logging all vehicle transfers
CREATE TABLE IF NOT EXISTS public.vehicle_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  transfer_type VARCHAR(50) NOT NULL CHECK (transfer_type IN ('branch_transfer', 'accident', 'total_loss')),
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  from_branch_id UUID REFERENCES public.branches(id),
  to_branch_id UUID REFERENCES public.branches(id),
  from_location VARCHAR(255), -- For non-branch locations like 'Workshop', 'Storage', etc.
  to_location VARCHAR(255),   -- For non-branch locations
  details TEXT NOT NULL,
  additional_data JSONB, -- For storing type-specific data (insurance info, maintenance details, etc.)
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_vehicle_id ON public.vehicle_transfers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_transfer_type ON public.vehicle_transfers(transfer_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_transfer_date ON public.vehicle_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_from_branch_id ON public.vehicle_transfers(from_branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_to_branch_id ON public.vehicle_transfers(to_branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_user_id ON public.vehicle_transfers(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.vehicle_transfers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own vehicle transfers" ON public.vehicle_transfers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle transfers" ON public.vehicle_transfers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle transfers" ON public.vehicle_transfers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle transfers" ON public.vehicle_transfers
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_vehicle_transfers_updated_at BEFORE UPDATE ON public.vehicle_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
