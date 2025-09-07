-- Create storage bucket for contract documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-documents',
  'contract-documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*']
);

-- Create storage bucket for customer documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-documents',
  'customer-documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*']
);

-- Create policies for contract-documents bucket
CREATE POLICY "Users can upload contract documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contract-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view contract documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contract-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update contract documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'contract-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete contract documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'contract-documents'
    AND auth.role() = 'authenticated'
  );

-- Create policies for customer-documents bucket
CREATE POLICY "Users can upload customer documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'customer-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view customer documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'customer-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update customer documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'customer-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete customer documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'customer-documents'
    AND auth.role() = 'authenticated'
  );
