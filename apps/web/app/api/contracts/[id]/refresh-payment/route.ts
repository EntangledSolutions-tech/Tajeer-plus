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

    // Verify contract exists and belongs to user
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('id, total_amount, customer_name')
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

    // Fetch updated payment information from finance tables
    // This would typically recalculate payments based on current data
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId)
      .eq('user_id', user.id);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      // Continue even if payments fetch fails
    }

    // Update contract's last_payment_refresh timestamp
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        last_payment_refresh: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating contract:', updateError);
      return NextResponse.json(
        { error: 'Failed to refresh payment information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment information refreshed successfully',
      contract: updatedContract,
      payments: payments || []
    });

  } catch (error) {
    console.error('Error refreshing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

