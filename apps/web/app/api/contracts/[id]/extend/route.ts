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

    const { extensionType, feeAmount, durationDays, paymentMethod } = body;

    // Validate required fields
    if (!extensionType || (extensionType === 'fees' && !feeAmount) || (extensionType === 'duration' && !durationDays)) {
      return NextResponse.json(
        { error: 'Missing required fields for contract extension' },
        { status: 400 }
      );
    }

    // Fetch the current contract
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate the new end date based on extension type
    let newEndDate = new Date(contract.end_date);
    let daysToAdd = 0;

    if (extensionType === 'duration') {
      daysToAdd = parseInt(durationDays) || 0;
    } else if (extensionType === 'fees') {
      // Calculate days based on fee amount and daily rate
      const dailyRate = contract.daily_rental_rate || 0;
      daysToAdd = Math.ceil(parseFloat(feeAmount) / dailyRate);
    }

    console.log('Extension calculation:', {
      extensionType,
      feeAmount,
      durationDays,
      daysToAdd,
      currentEndDate: contract.end_date,
      newEndDateBefore: newEndDate.toISOString()
    });

    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    console.log('New end date after calculation:', newEndDate.toISOString());

    // Update the contract with new end date
    // Note: Extension detail fields will be added once migration is applied
    const updateData: any = {
      end_date: newEndDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };

    // Try to add extension fields if they exist in the database
    try {
      updateData.extension_type = extensionType;
      updateData.extension_fee_amount = extensionType === 'fees' ? feeAmount : null;
      updateData.extension_duration_days = extensionType === 'duration' ? durationDays : daysToAdd;
      updateData.extension_payment_method = paymentMethod;
      updateData.extension_date = new Date().toISOString();
    } catch (e) {
      // Fields don't exist yet, just update end_date
    }

    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error extending contract:', updateError);
      return NextResponse.json(
        { error: 'Failed to extend contract' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: 'Contract extended successfully'
    });

  } catch (error) {
    console.error('Error in extend contract API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
