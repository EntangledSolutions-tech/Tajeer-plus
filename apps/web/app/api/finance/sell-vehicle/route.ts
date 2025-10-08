import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const body = await request.json();
    console.log('Sell Vehicle API received:', body);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    const { vehicle, customerName, totalAmount, date, notes } = body;
    if (!vehicle || !customerName || !totalAmount || !date) {
      return NextResponse.json({
        error: 'Missing required fields: vehicle, customerName, totalAmount, date'
      }, { status: 400 });
    }

    // Get transaction type ID for "Sell" category
    const { data: transactionTypeData, error: typeError } = await supabase
      .from('finance_transaction_types')
      .select('id, name, code, category')
      .eq('name', 'Sell')
      .eq('category', 'income')
      .single();

    if (typeError || !transactionTypeData) {
      console.error('Transaction type lookup failed:', { typeError });
      return NextResponse.json({
        error: 'Transaction type not found'
      }, { status: 400 });
    }

    // Generate transaction number
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const transactionNumber = `${transactionTypeData.code}-${timestamp}-${randomSuffix}`;

    // Create finance transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('finance_transactions')
      .insert({
        transaction_number: transactionNumber,
        transaction_date: date,
        amount: parseFloat(totalAmount),
        description: notes || 'Vehicle sale transaction',
        employee_name: body.employee || 'System',
        transaction_type_id: transactionTypeData.id,
        vehicle_id: vehicle,
        customer_id: customerName,
        user_id: user.id,
        status: 'completed'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating sell transaction:', transactionError);
      return NextResponse.json({
        error: 'Failed to create sell transaction'
      }, { status: 500 });
    }

    // Create rental income record
    const { error: incomeError } = await supabase
      .from('rental_income')
      .insert({
        transaction_id: transaction.id,
        income_type: 'Vehicle Sale',
        source: 'Direct Sale',
        user_id: user.id
      });

    if (incomeError) {
      console.error('Error creating rental income:', incomeError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      data: { transactionId: transaction.id },
      message: 'Vehicle sale transaction created successfully'
    });

  } catch (error) {
    console.error('Error in sell vehicle API:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
