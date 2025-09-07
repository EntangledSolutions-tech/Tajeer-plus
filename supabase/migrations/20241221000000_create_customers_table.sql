-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL UNIQUE,
    classification VARCHAR(50) NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    mobile_number VARCHAR(20),
    nationality VARCHAR(50) DEFAULT 'Saudi',
    status VARCHAR(20) DEFAULT 'Active',
    membership_id VARCHAR(100),
    membership_tier VARCHAR(20) DEFAULT 'Bronze',
    membership_points INTEGER DEFAULT 0,
    membership_valid_until DATE,
    membership_benefits TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer contracts table
CREATE TABLE IF NOT EXISTS customer_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    contract_type VARCHAR(50) DEFAULT 'Rental',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer invoices table
CREATE TABLE IF NOT EXISTS customer_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES customer_contracts(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    payment_method VARCHAR(50),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer finance table
CREATE TABLE IF NOT EXISTS customer_finance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer penalties table
CREATE TABLE IF NOT EXISTS customer_penalties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES customer_contracts(id) ON DELETE SET NULL,
    penalty_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    penalty_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer branches table
CREATE TABLE IF NOT EXISTS customer_branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    branch_name VARCHAR(100) NOT NULL,
    branch_code VARCHAR(20) NOT NULL,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer documents table
CREATE TABLE IF NOT EXISTS customer_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_id_number ON customers(id_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_contracts_customer_id ON customer_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contracts_status ON customer_contracts(status);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_customer_id ON customer_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_status ON customer_invoices(status);
CREATE INDEX IF NOT EXISTS idx_customer_finance_customer_id ON customer_finance(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_penalties_customer_id ON customer_penalties(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_branches_customer_id ON customer_branches(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_contracts_updated_at BEFORE UPDATE ON customer_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_invoices_updated_at BEFORE UPDATE ON customer_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_finance_updated_at BEFORE UPDATE ON customer_finance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_penalties_updated_at BEFORE UPDATE ON customer_penalties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_branches_updated_at BEFORE UPDATE ON customer_branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_documents_updated_at BEFORE UPDATE ON customer_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();