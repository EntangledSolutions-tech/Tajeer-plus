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

    const { hold_reason, hold_comments } = body;

    if (!hold_reason) {
      return NextResponse.json(
        { error: 'Hold reason is required' },
        { status: 400 }
      );
    }

    // First, get the "On Hold" status ID
    const { data: onHoldStatus, error: statusError } = await supabase
      .from('contract_statuses')
      .select('id')
      .eq('name', 'On Hold')
      .single();

    if (statusError || !onHoldStatus) {
      console.error('Error fetching On Hold status:', statusError);
      return NextResponse.json(
        { error: 'On Hold status not found' },
        { status: 500 }
      );
    }

    // Update the contract with hold information and status
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status_id: onHoldStatus.id,
        hold_reason: hold_reason,
        hold_comments: hold_comments || null,
        hold_date: new Date().toISOString(),
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

    return NextResponse.json({
      success: true,
      message: 'Contract has been put on hold successfully',
      contract: updatedContract
    });

  } catch (error) {
    console.error('Error holding contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
