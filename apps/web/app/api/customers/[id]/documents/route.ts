import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const customerId = params.id;

    // Get authenticated user
    const { data: user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type');

    // Check if this is a document move from temp location (JSON) or new file upload (FormData)
    if (contentType && contentType.includes('application/json')) {
      // Handle document move from temp location
      const body = await request.json();
      console.log('Document move request body:', body);

      if (body.moveFromTemp && body.document) {
        const tempDoc = body.document;
        console.log('Moving temp document:', tempDoc);

        // Move file from temp location to final location
        const timestamp = Date.now();
        const fileExtension = tempDoc.fileName.split('.').pop();
        const finalFileName = `customers/${customerId}/${timestamp}_${tempDoc.document_name.replace(/\s+/g, '_')}.${fileExtension}`;

        // Copy file from temp to final location in storage
        const { data: copyData, error: copyError } = await supabase.storage
          .from('customer-documents')
          .copy(tempDoc.tempPath, finalFileName);

        if (copyError) {
          console.error('Error copying file from temp:', copyError);
          return NextResponse.json(
            { error: 'Failed to move document from temp location' },
            { status: 500 }
          );
        }

        // Get the new public URL
        const { data: { publicUrl } } = supabase.storage
          .from('customer-documents')
          .getPublicUrl(finalFileName);

        // Insert document into customer_documents table
        const documentData = {
          customer_id: customerId,
          document_name: tempDoc.document_name,
          document_type: tempDoc.document_type,
          document_url: publicUrl,
          file_name: tempDoc.file_name,
          file_size: tempDoc.file_size
        };

        console.log('Inserting document data:', documentData);

        const { data: newDocument, error: insertError } = await supabase
          .from('customer_documents')
          .insert(documentData)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting moved document:', insertError);
          return NextResponse.json(
            { error: 'Failed to save moved document to database' },
            { status: 500 }
          );
        }

        console.log('Successfully inserted document:', newDocument);

        return NextResponse.json({
          success: true,
          document: newDocument,
          message: 'Document moved successfully'
        });
      }
    }

    // Handle new file upload (FormData)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentName) {
      return NextResponse.json(
        { error: 'Document name is required' },
        { status: 400 }
      );
    }

    // Use documentName as documentType if documentType is not provided
    const finalDocumentType = documentType || documentName;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `customers/${customerId}/${timestamp}_${documentName.replace(/\s+/g, '_')}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer-documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('customer-documents')
      .getPublicUrl(fileName);

    // Insert document into customer_documents table
    const { data: newDocument, error: insertError } = await supabase
      .from('customer_documents')
      .insert({
        customer_id: customerId,
        document_name: documentName,
        document_type: finalDocumentType,
        document_url: publicUrl,
        file_name: file.name,
        file_size: file.size
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting document:', insertError);
      return NextResponse.json(
        { error: 'Failed to save document to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: newDocument,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const customerId = params.id;

    // Get authenticated user
    const { data: user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    // Get customer documents from customer_documents table
    const { data: documents, error: fetchError } = await supabase
      .from('customer_documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('uploaded_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching customer documents:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch customer documents' },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      documents: documents || [],
      documentsCount: documents?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const customerId = params.id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    // Get the document to delete
    const { data: documentToDelete, error: fetchError } = await supabase
      .from('customer_documents')
      .select('*')
      .eq('id', documentId)
      .eq('customer_id', customerId)
      .single();

    if (fetchError || !documentToDelete) {
      console.error('Error fetching document:', fetchError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Remove document from storage if it has a document_url
    if (documentToDelete.document_url) {
      try {
        const fileName = documentToDelete.document_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('customer-documents')
            .remove([`customers/${customerId}/${fileName}`]);
        }
      } catch (storageError) {
        console.warn('Could not delete file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete document from customer_documents table
    const { error: deleteError } = await supabase
      .from('customer_documents')
      .delete()
      .eq('id', documentId)
      .eq('customer_id', customerId);

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
