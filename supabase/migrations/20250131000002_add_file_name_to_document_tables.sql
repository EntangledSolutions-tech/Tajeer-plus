-- Add file_name column to customer_documents table
ALTER TABLE public.customer_documents
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customer_documents_file_name ON public.customer_documents(file_name);

-- Drop the unused vehicle_documents table since we use JSON field in vehicles.documents
DROP TABLE IF EXISTS public.vehicle_documents;
