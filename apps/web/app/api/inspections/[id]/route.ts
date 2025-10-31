import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../../lib/database.types';
import { getAuthenticatedUser } from '../../../../lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const { id } = await params;

    // Fetch inspection with vehicle details
    const { data: inspection, error: fetchError } = await supabase
      .from('inspections')
      .select(`
        *,
        vehicle:vehicles!vehicle_id(
          id,
          plate_number,
          serial_number,
          vehicle_makes!make_id(name),
          vehicle_models!model_id(name),
          vehicle_colors!color_id(name, hex_code),
          vehicle_statuses!status_id(name, color),
          branch:branches!branch_id(id, name),
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching inspection:', fetchError);
      return NextResponse.json(
        { error: 'Inspection not found', details: fetchError.message },
        { status: 404 }
      );
    }

    // Verify user owns the vehicle associated with this inspection
    if (inspection.vehicle?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Transform the data to match expected format
    const transformedInspection = {
      id: inspection.id,
      inspection_id: inspection.id,
      inspection_date: inspection.inspection_date,
      status: inspection.status,
      inspector: inspection.inspector_name,
      vehicle: {
        id: inspection.vehicle?.id || '',
        plate_number: inspection.vehicle?.plate_number || '',
        serial_number: inspection.vehicle?.serial_number || '',
        make: inspection.vehicle?.vehicle_makes?.name || '',
        model: inspection.vehicle?.vehicle_models?.name || '',
        color: inspection.vehicle?.vehicle_colors?.name || '',
        color_hex: inspection.vehicle?.vehicle_colors?.hex_code || '',
        status: inspection.vehicle?.vehicle_statuses?.name || '',
        status_color: inspection.vehicle?.vehicle_statuses?.color || '',
        branch: inspection.vehicle?.branch?.name || ''
      },
      created_at: inspection.created_at,
      updated_at: inspection.updated_at,
      total_damages: inspection.total_damages,
      exterior_damages: inspection.exterior_damages,
      interior_damages: inspection.interior_damages
    };

    return NextResponse.json({ success: true, data: transformedInspection });
  } catch (error: any) {
    console.error('Error in GET /api/inspections/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const { id } = await params;
    const body = await request.json();

    // First, verify the inspection exists and user has access
    const { data: existingInspection, error: fetchError } = await supabase
      .from('inspections')
      .select(`
        id,
        vehicle:vehicles!vehicle_id(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingInspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Verify user owns the vehicle
    if (existingInspection.vehicle?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update the inspection
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (body.inspector_name !== undefined) updateData.inspector_name = body.inspector_name;
    if (body.inspection_date !== undefined) updateData.inspection_date = body.inspection_date;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.total_damages !== undefined) updateData.total_damages = body.total_damages;
    if (body.exterior_damages !== undefined) updateData.exterior_damages = body.exterior_damages;
    if (body.interior_damages !== undefined) updateData.interior_damages = body.interior_damages;

    const { data: updatedInspection, error: updateError } = await supabase
      .from('inspections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating inspection:', updateError);
      return NextResponse.json(
        { error: 'Failed to update inspection', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedInspection });
  } catch (error: any) {
    console.error('Error in PUT /api/inspections/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const { id } = await params;

    // First, verify the inspection exists and user has access
    const { data: existingInspection, error: fetchError } = await supabase
      .from('inspections')
      .select(`
        id,
        vehicle:vehicles!vehicle_id(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingInspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Verify user owns the vehicle
    if (existingInspection.vehicle?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the inspection
    const { error: deleteError } = await supabase
      .from('inspections')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting inspection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete inspection', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/inspections/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

