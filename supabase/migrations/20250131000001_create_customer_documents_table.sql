-- Create customer_documents table
CREATE TABLE IF NOT EXISTS customer_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  document_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_uploaded_at ON customer_documents(uploaded_at);

-- Add RLS policies
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read customer documents
CREATE POLICY "Users can read customer documents" ON customer_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert customer documents
CREATE POLICY "Users can insert customer documents" ON customer_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update customer documents
CREATE POLICY "Users can update customer documents" ON customer_documents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete customer documents
CREATE POLICY "Users can delete customer documents" ON customer_documents
  FOR DELETE USING (auth.role() = 'authenticated');
