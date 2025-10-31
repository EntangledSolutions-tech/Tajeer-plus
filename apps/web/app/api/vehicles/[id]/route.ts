import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id: vehicleId } = await context.params;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get branch_id from query params for validation
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');

    // Fetch vehicle by ID with all related data
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        make:vehicle_makes!make_id(name),
        model:vehicle_models!model_id(name),
        color:vehicle_colors!color_id(name, hex_code),
        status:vehicle_statuses!status_id(name, color),
        owner:vehicle_owners!owner_id(name, code),
        actual_user:vehicle_actual_users!actual_user_id(name, code),
        branch:branches!branch_id(name, code, address, phone, email),
        insurance_policy:insurance_policies!insurance_policy_id(
          policy_company,
          policy_type,
          policy_number,
          deductible_premium,
          policy_amount
        )
      `)
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    // Also filter by branch_id if provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: vehicle, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found or unauthorized
        return NextResponse.json(
          { error: 'Vehicle not found or access denied', code: 'UNAUTHORIZED_ACCESS' },
          { status: 403 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle' },
        { status: 500 }
      );
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or access denied', code: 'UNAUTHORIZED_ACCESS' },
        { status: 403 }
      );
    }
    return NextResponse.json(vehicle);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id: vehicleId } = await context.params;
    const body = await request.json();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate that the vehicle belongs to the user
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the vehicle
    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update(body)
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .select(`
        *,
        make:vehicle_makes!make_id(name),
        model:vehicle_models!model_id(name),
        color:vehicle_colors!color_id(name, hex_code),
        status:vehicle_statuses!status_id(name, color),
        owner:vehicle_owners!owner_id(name, code),
        actual_user:vehicle_actual_users!actual_user_id(name, code),
        branch:branches!branch_id(name, code, address, phone, email),
        insurance_policy:insurance_policies!insurance_policy_id(
          policy_company,
          policy_type,
          policy_number,
          deductible_premium,
          policy_amount
        )
      `)
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedVehicle);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id: vehicleId } = await context.params;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate that the vehicle belongs to the user
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, plate_number')
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the vehicle
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Vehicle ${vehicle.plate_number} deleted successfully`
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}