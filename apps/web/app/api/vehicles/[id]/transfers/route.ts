import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET endpoint to retrieve transfer logs for a vehicle
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: vehicleId } = context.params;

    // Get authenticated user
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch transfer logs from database
    const { data: transfers, error } = await (supabase as any)
      .from('vehicle_transfers')
      .select(`
        *,
        from_branch:branches!vehicle_transfers_from_branch_id_fkey(name, code),
        to_branch:branches!vehicle_transfers_to_branch_id_fkey(name, code),
        vehicle:vehicles(plate_number)
      `)
      .eq('vehicle_id', vehicleId)
      .eq('user_id', user.id)
      .order('transfer_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transfer logs' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedTransfers = (transfers || []).map((transfer: any) => ({
      id: transfer.id,
      date: new Date(transfer.transfer_date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      type: transfer.transfer_type === 'accident' ? 'Accident' :
            transfer.transfer_type === 'total_loss' ? 'Destroyed/Total Loss' :
            transfer.transfer_type === 'branch_transfer' ? 'Branch transfer' : 'Unknown',
      from: transfer.from_branch?.name || transfer.from_location || 'Unknown',
      to: transfer.to_branch?.name || transfer.to_location || 'Unknown',
      details: transfer.details,
      created_at: transfer.created_at,
      additional_data: transfer.additional_data
    }));

    return NextResponse.json(transformedTransfers);
  } catch (error) {
    console.error('Error fetching transfer logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer logs' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a transfer log
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: vehicleId } = context.params;
    const { searchParams } = new URL(request.url);
    const transferId = searchParams.get('id');

    if (!transferId) {
      return NextResponse.json(
        { error: 'Transfer ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the transfer log
    const { error: deleteError } = await (supabase as any)
      .from('vehicle_transfers')
      .delete()
      .eq('id', transferId)
      .eq('vehicle_id', vehicleId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete transfer log' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transfer log:', error);
    return NextResponse.json(
      { error: 'Failed to delete transfer log' },
      { status: 500 }
    );
  }
}
