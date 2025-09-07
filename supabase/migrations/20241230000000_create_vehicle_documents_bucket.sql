-- Create storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-documents',
  'vehicle-documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*']
);

-- Create policies for vehicle-documents bucket
CREATE POLICY "Users can upload vehicle documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vehicle-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view vehicle documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vehicle-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update vehicle documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'vehicle-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete vehicle documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vehicle-documents'
    AND auth.role() = 'authenticated'
  );

