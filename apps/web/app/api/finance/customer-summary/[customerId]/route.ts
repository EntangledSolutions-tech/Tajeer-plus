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

    // Fetch customer finance summary
    const { data: transactions, error } = await supabase
      .from('finance_transactions')
      .select(`
        amount,
        finance_transaction_types (
          category
        )
      `)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer summary', details: error.message },
        { status: 500 }
      );
    }

    // Calculate summary data
    let totalPaid = 0;
    let totalCost = 0;
    let outstanding = 0;

    transactions?.forEach(transaction => {
      const amount = transaction.amount || 0;
      const category = transaction.finance_transaction_types?.category;

      if (category === 'income') {
        totalPaid += amount;
      } else if (category === 'expense') {
        totalCost += amount;
      }
    });

    // Calculate outstanding (simplified calculation)
    outstanding = totalCost - totalPaid;

    return NextResponse.json(
      {
        success: true,
        data: {
          outstanding: Math.max(0, outstanding), // Don't show negative outstanding
          totalPaid,
          totalCost
        },
        message: 'Customer summary fetched successfully'
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
