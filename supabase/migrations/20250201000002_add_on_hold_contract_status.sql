-- Add "On Hold" status to contract_statuses table
-- This migration adds the On Hold status with code 7 for contracts that are temporarily held

-- Insert the "On Hold" status
INSERT INTO public.contract_statuses (name, description, color) VALUES
('On Hold', 'Contract is temporarily on hold due to various reasons', '#F59E0B');

-- Add comment for documentation
COMMENT ON TABLE public.contract_statuses IS 'Contract status configuration table for rental contracts including On Hold status';
