import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

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

    // Generate unique filename for temporary storage
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `temp/${user.user.id}/${timestamp}_${documentName.replace(/\s+/g, '_')}.${fileExtension}`;

    // Upload file to Supabase Storage in temporary location
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

    // Create temporary document object
    const tempDocument = {
      id: Date.now().toString(),
      name: documentName,
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      mimeType: file.type,
      uploaded: true,
      uploadedAt: new Date().toISOString(),
      tempPath: fileName
    };

    return NextResponse.json({
      success: true,
      document: tempDocument,
      message: 'Document uploaded temporarily'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
