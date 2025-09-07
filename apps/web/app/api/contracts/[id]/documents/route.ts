import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const contractId = context.params.id;

    // Get authenticated user
    const { data: user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string;

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
    const fileName = `contracts/${contractId}/${timestamp}_${documentName.replace(/\s+/g, '_')}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contract-documents')
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
      .from('contract-documents')
      .getPublicUrl(fileName);

    // Create new document object
    const newDocument = {
      id: Date.now().toString(),
      name: documentName,
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      mimeType: file.type,
      uploaded: true,
      uploadedAt: new Date().toISOString()
    };

    // Get current contract data
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (fetchError) {
      console.error('Error fetching contract:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch contract data' },
        { status: 500 }
      );
    }

    // Parse existing documents or initialize empty array
    let existingDocuments = [];
    try {
      if (contract.documents && Array.isArray(contract.documents)) {
        existingDocuments = contract.documents;
      }
    } catch (e) {
      console.warn('Could not parse existing documents, starting fresh');
      existingDocuments = [];
    }

    // Add new document to existing documents
    const updatedDocuments = [...existingDocuments, newDocument];

    // Update contract with new documents
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        documents: updatedDocuments,
        documents_count: updatedDocuments.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) {
      console.error('Error updating contract:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contract with document' },
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

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const contractId = context.params.id;

    // Get authenticated user
    const { data: user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    // Get contract documents
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('documents, documents_count')
      .eq('id', contractId)
      .single();

    if (fetchError) {
      console.error('Error fetching contract documents:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch contract documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: contract.documents || [],
      documentsCount: contract.documents_count || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const contractId = context.params.id;
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

    // Get current contract data
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('documents')
      .eq('id', contractId)
      .single();

    if (fetchError) {
      console.error('Error fetching contract:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch contract data' },
        { status: 500 }
      );
    }

    // Find and remove the document
    let existingDocuments = [];
    try {
      if (contract.documents && Array.isArray(contract.documents)) {
        existingDocuments = contract.documents;
      }
    } catch (e) {
      console.warn('Could not parse existing documents');
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      );
    }

    const documentToDelete = existingDocuments.find((doc: any) => doc.id === documentId);
    if (!documentToDelete) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Remove document from storage if it has a fileUrl
    if (documentToDelete.fileUrl) {
      try {
        const fileName = documentToDelete.fileUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('contract-documents')
            .remove([`contracts/${contractId}/${fileName}`]);
        }
      } catch (storageError) {
        console.warn('Could not delete file from storage:', storageError);
        // Continue with database update even if storage deletion fails
      }
    }

    // Remove document from documents array
    const updatedDocuments = existingDocuments.filter((doc: any) => doc.id !== documentId);

    // Update contract
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        documents: updatedDocuments,
        documents_count: updatedDocuments.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) {
      console.error('Error updating contract:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contract' },
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
