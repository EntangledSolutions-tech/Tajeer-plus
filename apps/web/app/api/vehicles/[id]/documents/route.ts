import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();

    // Get the vehicle ID from params
    const vehicleId = params.id;

    // Fetch vehicle with documents
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error) {
      console.error('Error fetching vehicle documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Parse documents from JSON array or return empty array
    let documents = [];
    try {
      if ((vehicle as any)?.documents) {
        // Check if it's already an object or a JSON string
        const documentsData = (vehicle as any).documents;
        if (typeof documentsData === 'string') {
          documents = JSON.parse(documentsData);
        } else if (Array.isArray(documentsData)) {
          documents = documentsData;
        } else {
          documents = [];
        }
      }
    } catch (parseError) {
      console.error('Error parsing documents JSON:', parseError);
      documents = [];
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error in documents API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Get the vehicle ID from params
    const vehicleId = params.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    // Sanitize file name to remove invalid characters
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vehicle-documents')
      .upload(`vehicles/${fileName}`, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-documents')
      .getPublicUrl(`vehicles/${fileName}`);

    // Create new document object
    const newDocument = {
      document_name: documentName,
      file_name: file.name,
      document_url: publicUrl,
      created_at: new Date().toISOString()
    };

    // Get current vehicle data
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle data' },
        { status: 500 }
      );
    }

    // Parse existing documents robustly
    let existingDocuments = [];
    const docs = (vehicle as any)?.documents;
    if (docs) {
      if (typeof docs === 'string') {
        try {
          existingDocuments = JSON.parse(docs);
        } catch {
          existingDocuments = [];
        }
      } else if (Array.isArray(docs)) {
        existingDocuments = docs;
      } else {
        existingDocuments = [];
      }
    }
    const updatedDocuments = [...existingDocuments, newDocument];

    // Update vehicle with new documents array
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ documents: updatedDocuments } as any)
      .eq('id', vehicleId);

    if (updateError) {
      console.error('Error updating vehicle documents:', updateError);
      return NextResponse.json(
        { error: 'Failed to update vehicle documents' },
        { status: 500 }
      );
    }

    return NextResponse.json(newDocument);
  } catch (error) {
    console.error('Error in document upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const vehicleId = params.id;

    const body = await request.json();
    const { documentUrl } = body;

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      );
    }

    // Get current vehicle data
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle data' },
        { status: 500 }
      );
    }

    // Parse existing documents
    let existingDocuments = [];
    const docs = (vehicle as any)?.documents;
    if (docs) {
      if (typeof docs === 'string') {
        try {
          existingDocuments = JSON.parse(docs);
        } catch {
          existingDocuments = [];
        }
      } else if (Array.isArray(docs)) {
        existingDocuments = docs;
      } else {
        existingDocuments = [];
      }
    }

    // Remove the document with matching URL
    const updatedDocuments = existingDocuments.filter((doc: any) => doc.document_url !== documentUrl);

    // Update vehicle with updated documents array
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ documents: updatedDocuments } as any)
      .eq('id', vehicleId);

    if (updateError) {
      console.error('Error updating vehicle documents:', updateError);
      return NextResponse.json(
        { error: 'Failed to update vehicle documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error in document delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}