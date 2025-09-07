import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { z } from 'zod';

// Validation schema for license type update
const licenseTypeUpdateSchema = z.object({
  license_type: z.string().min(2, 'License type must be at least 2 characters').max(100, 'License type must not exceed 100 characters'),
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
      .from('customer_license_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'License type not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching license type:', error);
      return NextResponse.json(
        { error: 'Failed to fetch license type' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/customer-configurations/license-types/[id]:', error);
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
    const validationResult = licenseTypeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { license_type, description, is_active } = validationResult.data;

    // Check if license type already exists (excluding current record)
    if (license_type) {
      const { data: existing } = await supabase
        .from('customer_license_types')
        .select('id')
        .eq('license_type', license_type)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'License type already exists' },
          { status: 400 }
        );
      }
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Update the license type
    const { data, error } = await supabase
      .from('customer_license_types')
      .update({
        license_type,
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
          { error: 'License type not found' },
          { status: 404 }
        );
      }
      console.error('Error updating license type:', error);
      return NextResponse.json(
        { error: 'Failed to update license type' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/customer-configurations/license-types/[id]:', error);
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

    // Delete the license type
    const { error } = await supabase
      .from('customer_license_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting license type:', error);
      return NextResponse.json(
        { error: 'Failed to delete license type' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/customer-configurations/license-types/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
