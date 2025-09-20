-- Finance Module Database Schema
-- This migration creates all necessary tables for the finance module

-- 1. Finance Transaction Types
CREATE TABLE IF NOT EXISTS public.finance_transaction_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'income', 'expense', 'asset_transaction'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Finance Transactions (Main table for all financial transactions)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number VARCHAR(100) UNIQUE NOT NULL,
  transaction_type_id UUID NOT NULL REFERENCES public.finance_transaction_types(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  transaction_date DATE NOT NULL,
  description TEXT,
  
  -- Related entities
  branch_id UUID REFERENCES public.branches(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID REFERENCES public.customers(id),
  contract_id UUID REFERENCES public.contracts(id),
  employee_name VARCHAR(255),
  
  -- Invoice details
  invoice_number VARCHAR(100),
  invoice_date DATE,
  payment_type VARCHAR(50), -- 'cash', 'card', 'bank_transfer', 'check'
  
  -- VAT details
  vat_included BOOLEAN DEFAULT false,
  vat_rate DECIMAL(5,2) DEFAULT 15.00,
  vat_amount DECIMAL(15,2) DEFAULT 0.00,
  
  -- Financial calculations
  total_amount DECIMAL(15,2) NOT NULL,
  total_discount DECIMAL(15,2) DEFAULT 0.00,
  net_invoice DECIMAL(15,2) NOT NULL,
  total_paid DECIMAL(15,2) DEFAULT 0.00,
  remaining_amount DECIMAL(15,2) DEFAULT 0.00,
  
  -- Status and metadata
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Rental Company Expenses
CREATE TABLE IF NOT EXISTS public.rental_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.finance_transactions(id) ON DELETE CASCADE,
  expense_type VARCHAR(100) NOT NULL, -- 'fuel', 'maintenance', 'insurance', 'office', 'marketing', etc.
  vendor_name VARCHAR(255),
  receipt_number VARCHAR(100),
  receipt_date DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Rental Company Income
CREATE TABLE IF NOT EXISTS public.rental_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.finance_transactions(id) ON DELETE CASCADE,
  income_type VARCHAR(100) NOT NULL, -- 'rental', 'late_fee', 'penalty', 'service_fee', etc.
  source VARCHAR(255), -- 'contract', 'service', 'penalty', etc.
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Customer Finance Transactions
CREATE TABLE IF NOT EXISTS public.customer_finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.finance_transactions(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  transaction_category VARCHAR(50) NOT NULL, -- 'payment', 'penalty', 'refund', 'adjustment'
  penalty_reason TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Vehicle Finance Transactions
CREATE TABLE IF NOT EXISTS public.vehicle_finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.finance_transactions(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  transaction_category VARCHAR(50) NOT NULL, -- 'sell', 'return', 'deprecation', 'penalty', 'maintenance', 'service', 'insurance', 'accident'
  
  -- Specific fields for different transaction types
  expected_sale_price DECIMAL(15,2), -- for deprecation
  lease_amount_increase DECIMAL(15,2), -- for deprecation
  penalty_reason TEXT, -- for penalty
  penalty_date DATE, -- for penalty
  insurance_company VARCHAR(255), -- for insurance
  policy_number VARCHAR(100), -- for insurance
  maintenance_type VARCHAR(100), -- for maintenance
  service_type VARCHAR(100), -- for service
  accident_description TEXT, -- for accident
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Finance Summary Views (for reporting)
CREATE TABLE IF NOT EXISTS public.finance_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_type VARCHAR(50) NOT NULL, -- 'daily', 'monthly', 'yearly', 'customer', 'vehicle', 'branch'
  summary_date DATE NOT NULL,
  entity_id UUID, -- customer_id, vehicle_id, or branch_id depending on summary_type
  
  -- Financial metrics
  total_revenue DECIMAL(15,2) DEFAULT 0.00,
  total_expenses DECIMAL(15,2) DEFAULT 0.00,
  net_profit DECIMAL(15,2) DEFAULT 0.00,
  total_transactions INTEGER DEFAULT 0,
  
  -- Specific metrics
  rental_income DECIMAL(15,2) DEFAULT 0.00,
  penalty_income DECIMAL(15,2) DEFAULT 0.00,
  maintenance_costs DECIMAL(15,2) DEFAULT 0.00,
  fuel_costs DECIMAL(15,2) DEFAULT 0.00,
  insurance_costs DECIMAL(15,2) DEFAULT 0.00,
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(summary_type, summary_date, entity_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON public.finance_transactions(transaction_type_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON public.finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_branch ON public.finance_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_vehicle ON public.finance_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_customer ON public.finance_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_contract ON public.finance_transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_user ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_status ON public.finance_transactions(status);

CREATE INDEX IF NOT EXISTS idx_rental_expenses_transaction ON public.rental_expenses(transaction_id);
CREATE INDEX IF NOT EXISTS idx_rental_expenses_type ON public.rental_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_rental_expenses_user ON public.rental_expenses(user_id);

CREATE INDEX IF NOT EXISTS idx_rental_income_transaction ON public.rental_income(transaction_id);
CREATE INDEX IF NOT EXISTS idx_rental_income_type ON public.rental_income(income_type);
CREATE INDEX IF NOT EXISTS idx_rental_income_user ON public.rental_income(user_id);

CREATE INDEX IF NOT EXISTS idx_customer_finance_transaction ON public.customer_finance_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_customer_finance_customer ON public.customer_finance_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_finance_user ON public.customer_finance_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_finance_transaction ON public.vehicle_finance_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_finance_vehicle ON public.vehicle_finance_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_finance_category ON public.vehicle_finance_transactions(transaction_category);
CREATE INDEX IF NOT EXISTS idx_vehicle_finance_user ON public.vehicle_finance_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_finance_summaries_type_date ON public.finance_summaries(summary_type, summary_date);
CREATE INDEX IF NOT EXISTS idx_finance_summaries_entity ON public.finance_summaries(entity_id);
CREATE INDEX IF NOT EXISTS idx_finance_summaries_user ON public.finance_summaries(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.finance_transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for finance_transaction_types (read-only for all users)
CREATE POLICY "Anyone can view transaction types" ON public.finance_transaction_types
  FOR SELECT USING (true);

-- Create RLS policies for finance_transactions
CREATE POLICY "Users can view their own transactions" ON public.finance_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.finance_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.finance_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.finance_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for rental_expenses
CREATE POLICY "Users can view their own expenses" ON public.rental_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON public.rental_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON public.rental_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON public.rental_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for rental_income
CREATE POLICY "Users can view their own income" ON public.rental_income
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income" ON public.rental_income
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income" ON public.rental_income
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income" ON public.rental_income
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for customer_finance_transactions
CREATE POLICY "Users can view their own customer transactions" ON public.customer_finance_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer transactions" ON public.customer_finance_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer transactions" ON public.customer_finance_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer transactions" ON public.customer_finance_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for vehicle_finance_transactions
CREATE POLICY "Users can view their own vehicle transactions" ON public.vehicle_finance_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle transactions" ON public.vehicle_finance_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle transactions" ON public.vehicle_finance_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle transactions" ON public.vehicle_finance_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for finance_summaries
CREATE POLICY "Users can view their own summaries" ON public.finance_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries" ON public.finance_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" ON public.finance_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" ON public.finance_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_finance_transaction_types_updated_at BEFORE UPDATE ON public.finance_transaction_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_transactions_updated_at BEFORE UPDATE ON public.finance_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_expenses_updated_at BEFORE UPDATE ON public.rental_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_income_updated_at BEFORE UPDATE ON public.rental_income
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_finance_transactions_updated_at BEFORE UPDATE ON public.customer_finance_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_finance_transactions_updated_at BEFORE UPDATE ON public.vehicle_finance_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_summaries_updated_at BEFORE UPDATE ON public.finance_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


