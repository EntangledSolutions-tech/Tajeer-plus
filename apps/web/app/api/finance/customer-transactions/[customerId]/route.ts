import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../lib/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { customerId } = params;

    // Fetch customer finance transactions
    const { data: transactions, error } = await supabase
      .from('finance_transactions')
      .select(`
        id,
        transaction_number,
        transaction_date,
        amount,
        currency,
        description,
        invoice_number,
        payment_method,
        created_at,
        finance_transaction_types (
          name
        )
      `)
      .eq('customer_id', customerId)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer transactions', details: error.message },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      transaction_date: transaction.transaction_date,
      transaction_type: transaction.finance_transaction_types?.name || 'Unknown',
      description: transaction.description || '',
      payment_method: transaction.payment_method || 'Unknown',
      amount: transaction.amount || 0,
      invoice_number: transaction.invoice_number || '',
      transaction_number: transaction.transaction_number || '',
      currency: transaction.currency || 'SAR',
      created_at: transaction.created_at
    })) || [];

    return NextResponse.json(
      {
        success: true,
        data: {
          transactions: transformedTransactions
        },
        message: 'Customer transactions fetched successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
