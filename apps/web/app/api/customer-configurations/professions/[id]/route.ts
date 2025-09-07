import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { z } from 'zod';

// Validation schema for profession update
const professionUpdateSchema = z.object({
  profession: z.string().min(2, 'Profession must be at least 2 characters').max(100, 'Profession must not exceed 100 characters'),
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
      .from('customer_professions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profession not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching profession:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profession' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/customer-configurations/professions/[id]:', error);
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
    const validationResult = professionUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { profession, description, is_active } = validationResult.data;

    // Check if profession already exists (excluding current record)
    if (profession) {
      const { data: existing } = await supabase
        .from('customer_professions')
        .select('id')
        .eq('profession', profession)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Profession already exists' },
          { status: 400 }
        );
      }
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Update the profession
    const { data, error } = await supabase
      .from('customer_professions')
      .update({
        profession,
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
          { error: 'Profession not found' },
          { status: 404 }
        );
      }
      console.error('Error updating profession:', error);
      return NextResponse.json(
        { error: 'Failed to update profession' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/customer-configurations/professions/[id]:', error);
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

    // Delete the profession
    const { error } = await supabase
      .from('customer_professions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profession:', error);
      return NextResponse.json(
        { error: 'Failed to delete profession' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/customer-configurations/professions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
