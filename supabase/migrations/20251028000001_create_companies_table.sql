-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Company Information
    company_name VARCHAR(50) NOT NULL,
    tax_number VARCHAR(15) NOT NULL UNIQUE,
    commercial_registration_number VARCHAR(10) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,

    -- License Information
    license_number VARCHAR(50) NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    license_expiry_date DATE NOT NULL,
    establishment_date DATE NOT NULL,

    -- Legal Representative Information
    authorized_person_name VARCHAR(255) NOT NULL,
    authorized_person_id VARCHAR(50) NOT NULL,
    authorized_person_email VARCHAR(255) NOT NULL,
    authorized_person_mobile VARCHAR(20) NOT NULL,

    -- Business Information
    rental_type VARCHAR(50) NOT NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE RESTRICT,

    -- Documents (stored as JSON)
    documents JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_tax_number ON public.companies(tax_number);
CREATE INDEX IF NOT EXISTS idx_companies_commercial_registration_number ON public.companies(commercial_registration_number);
CREATE INDEX IF NOT EXISTS idx_companies_branch_id ON public.companies(branch_id);
CREATE INDEX IF NOT EXISTS idx_companies_company_name ON public.companies(company_name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own companies" ON public.companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies" ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies" ON public.companies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies" ON public.companies
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
