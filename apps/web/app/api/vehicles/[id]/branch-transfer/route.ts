import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vehicleId = params.id;
    const body = await request.json();
    const { recipientBranchId, details, transferDate } = body;

    // Validate required fields
    if (!recipientBranchId || !details || !transferDate) {
      return NextResponse.json({
        error: 'Recipient branch, details, and transfer date are required'
      }, { status: 400 });
    }

    // Get current vehicle details to get the current branch
    const { data: vehicle, error: vehicleError } = await (supabase as any)
      .from('vehicles')
      .select(`
        id,
        plate_number,
        branch_id,
        branch:branches!vehicles_branch_id_fkey(id, name, code)
      `)
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error fetching vehicle:', vehicleError);
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Get recipient branch details
    const { data: recipientBranch, error: branchError } = await (supabase as any)
      .from('branches')
      .select('id, name, code')
      .eq('id', recipientBranchId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (branchError || !recipientBranch) {
      console.error('Error fetching recipient branch:', branchError);
      return NextResponse.json({ error: 'Recipient branch not found or inactive' }, { status: 404 });
    }

    // Check if trying to transfer to the same branch
    if (vehicle.branch_id === recipientBranchId) {
      return NextResponse.json({
        error: 'Vehicle is already in the selected branch'
      }, { status: 400 });
    }

    // Start transaction: Update vehicle branch and create transfer log
    const { error: updateError } = await (supabase as any)
      .from('vehicles')
      .update({
        branch_id: recipientBranchId,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating vehicle branch:', updateError);
      return NextResponse.json({ error: 'Failed to update vehicle branch' }, { status: 500 });
    }

    // Create transfer log
    const transferData = {
      vehicle_id: vehicleId,
      transfer_type: 'branch_transfer',
      transfer_date: transferDate,
      from_branch_id: vehicle.branch_id,
      to_branch_id: recipientBranchId,
      details: details,
      user_id: user.id,
      additional_data: {
        from_branch: vehicle.branch,
        to_branch: recipientBranch,
        vehicle_plate: vehicle.plate_number
      }
    };

    const { data: transfer, error: transferError } = await (supabase as any)
      .from('vehicle_transfers')
      .insert(transferData)
      .select(`
        *,
        from_branch:branches!vehicle_transfers_from_branch_id_fkey(name, code),
        to_branch:branches!vehicle_transfers_to_branch_id_fkey(name, code),
        vehicle:vehicles(plate_number)
      `)
      .single();

    if (transferError) {
      console.error('Error creating transfer log:', transferError);

      // Try to rollback the vehicle update
      await (supabase as any)
        .from('vehicles')
        .update({ branch_id: vehicle.branch_id })
        .eq('id', vehicleId)
        .eq('user_id', user.id);

      return NextResponse.json({ error: 'Failed to create transfer log' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle transferred successfully',
      transfer,
      vehicle: {
        id: vehicleId,
        plate_number: vehicle.plate_number,
        previous_branch: vehicle.branch,
        new_branch: recipientBranch
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in vehicle branch transfer API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}