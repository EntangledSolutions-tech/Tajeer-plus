import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { z } from 'zod';

// Validation schema for classification update
const classificationUpdateSchema = z.object({
  classification: z.string().min(2, 'Classification must be at least 2 characters').max(100, 'Classification must not exceed 100 characters'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('customer_classifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Classification not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching classification:', error);
      return NextResponse.json(
        { error: 'Failed to fetch classification' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/customer-configurations/classifications/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const validationResult = classificationUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { classification, description, is_active } = validationResult.data;

    // Check if classification already exists (excluding current record)
    if (classification) {
      const { data: existing } = await supabase
        .from('customer_classifications')
        .select('id')
        .eq('classification', classification)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Classification already exists' },
          { status: 400 }
        );
      }
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Update the classification
    const { data, error } = await supabase
      .from('customer_classifications')
      .update({
        classification,
        description,
        is_active,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Classification not found' },
          { status: 404 }
        );
      }
      console.error('Error updating classification:', error);
      return NextResponse.json(
        { error: 'Failed to update classification' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/customer-configurations/classifications/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    // Delete the classification
    const { error } = await supabase
      .from('customer_classifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting classification:', error);
      return NextResponse.json(
        { error: 'Failed to delete classification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/customer-configurations/classifications/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
