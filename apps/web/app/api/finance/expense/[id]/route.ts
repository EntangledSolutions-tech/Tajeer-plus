import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenseId = params.id;

    // Fetch expense details with related data
    const { data: expense, error } = await (supabase as any)
      .from('finance_transactions')
      .select(`
        *,
        transaction_type:finance_transaction_types(name, category),
        branch:branches(name),
        vehicle:vehicles(
          plate_number,
          make:vehicle_makes(name),
          model:vehicle_models(name),
          make_year
        ),
        contract:contracts(
          contract_number,
          customer_name,
          start_date,
          end_date,
          created_at
        ),
        customer:customers(
          name,
          id_type,
          id_number,
          classification,
          mobile_number,
          nationality,
          date_of_birth,
          address,
          membership_tier
        ),
        rental_expense:rental_expenses(
          vendor_name,
          receipt_number,
          receipt_date
        )
      `)
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .eq('transaction_type.category', 'expense')
      .single();

    if (error) {
      console.error('Error fetching expense:', error);
      return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
    }

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);

  } catch (error) {
    console.error('Error in expense detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
