import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Penalty API received:', body);

    // Get authenticated user
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    const { vehicle, reason, date, notes, totalAmount, netInvoice } = body;
    if (!vehicle || !reason || !date || !totalAmount) {
      return NextResponse.json({
        error: 'Missing required fields: vehicle, reason, date, totalAmount'
      }, { status: 400 });
    }

    // Get transaction type ID for "Vehicle Penalty" category
    const { data: transactionTypeData, error: typeError } = await supabase
      .from('finance_transaction_types')
      .select('id, name, code, category')
      .eq('name', 'Vehicle Penalty')
      .eq('category', 'expense')
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
        total_amount: parseFloat(totalAmount),
        net_invoice: parseFloat(netInvoice || totalAmount),
        description: `${reason}: ${notes || 'Vehicle penalty record'}`,
        employee_name: body.employee || 'System',
        transaction_type_id: transactionTypeData.id,
        vehicle_id: vehicle,
        user_id: user.id,
        status: 'completed'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating penalty transaction:', transactionError);
      return NextResponse.json({
        error: 'Failed to create penalty transaction'
      }, { status: 500 });
    }

    console.log('Created transaction:', JSON.stringify(transaction, null, 2));


    // Create rental expense record
    const { error: expenseError } = await supabase
      .from('rental_expenses')
      .insert({
        transaction_id: transaction.id,
        expense_type: 'Vehicle Penalty',
        vendor_name: body.vendor || 'Internal',
        receipt_number: body.receiptNumber || '',
        receipt_date: date,
        user_id: user.id
      });

    if (expenseError) {
      console.error('Error creating rental expense:', expenseError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      data: { transactionId: transaction.id },
      message: 'Vehicle penalty record created successfully'
    });

  } catch (error) {
    console.error('Error in penalty API:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
