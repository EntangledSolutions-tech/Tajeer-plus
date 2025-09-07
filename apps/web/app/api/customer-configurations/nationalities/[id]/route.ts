import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { z } from 'zod';

// Validation schema for nationality update
const nationalityUpdateSchema = z.object({
  nationality: z.string().min(2, 'Nationality must be at least 2 characters').max(100, 'Nationality must not exceed 100 characters'),
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
      .from('customer_nationalities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Nationality not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching nationality:', error);
      return NextResponse.json(
        { error: 'Failed to fetch nationality' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/customer-configurations/nationalities/[id]:', error);
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
    const validationResult = nationalityUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { nationality, description, is_active } = validationResult.data;

    // Check if nationality already exists (excluding current record)
    if (nationality) {
      const { data: existing } = await supabase
        .from('customer_nationalities')
        .select('id')
        .eq('nationality', nationality)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Nationality already exists' },
          { status: 400 }
        );
      }
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Update the nationality
    const { data, error } = await supabase
      .from('customer_nationalities')
      .update({
        nationality,
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
          { error: 'Nationality not found' },
          { status: 404 }
        );
      }
      console.error('Error updating nationality:', error);
      return NextResponse.json(
        { error: 'Failed to update nationality' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/customer-configurations/nationalities/[id]:', error);
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

    // Check if nationality is being used by any customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .eq('nationality', id)
      .limit(1);

    if (customers && customers.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete nationality. It is being used by existing customers.' },
        { status: 400 }
      );
    }

    // Delete the nationality
    const { error } = await supabase
      .from('customer_nationalities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nationality:', error);
      return NextResponse.json(
        { error: 'Failed to delete nationality' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/customer-configurations/nationalities/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
