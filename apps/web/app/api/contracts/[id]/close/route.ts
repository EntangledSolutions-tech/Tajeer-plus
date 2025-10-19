import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getAuthenticatedUser } from '../../../../../lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const { id: contractId } = await params;
    const body = await request.json();

    const { close_reason, close_comments } = body;

    if (!close_reason) {
      return NextResponse.json(
        { error: 'Close reason is required' },
        { status: 400 }
      );
    }

    // First, get the "Closed" status ID
    const { data: closedStatus, error: statusError } = await supabase
      .from('contract_statuses')
      .select('id')
      .eq('name', 'Closed')
      .single();

    if (statusError || !closedStatus) {
      console.error('Error fetching Closed status:', statusError);
      return NextResponse.json(
        { error: 'Closed status not found' },
        { status: 500 }
      );
    }

    // Get contract to find associated vehicle
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('selected_vehicle_id')
      .eq('id', contractId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !contract) {
      console.error('Error fetching contract:', fetchError);
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Update the contract with close information and status
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status_id: closedStatus.id,
        close_reason: close_reason,
        close_comments: close_comments || null,
        close_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating contract:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contract status' },
        { status: 500 }
      );
    }

    // Update vehicle status back to "Available"
    if (contract.selected_vehicle_id) {
      try {
        const { data: availableStatus, error: vehicleStatusError } = await supabase
          .from('vehicle_statuses')
          .select('id')
          .eq('name', 'Available')
          .single();

        if (!vehicleStatusError && availableStatus) {
          await supabase
            .from('vehicles')
            .update({
              status_id: availableStatus.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', contract.selected_vehicle_id)
            .eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Error updating vehicle status:', error);
        // Don't fail the close operation if vehicle update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contract has been closed successfully',
      contract: updatedContract
    });

  } catch (error) {
    console.error('Error closing contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

