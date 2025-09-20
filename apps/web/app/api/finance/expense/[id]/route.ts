import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await params;

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
          classification_id,
          mobile_number,
          nationality_id,
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await params;

    // First, verify this is an expense transaction
    const { data: transaction, error: fetchError } = await (supabase as any)
      .from('finance_transactions')
      .select('id, transaction_type:finance_transaction_types(category)')
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Expense transaction not found' }, { status: 404 });
    }

    if (transaction.transaction_type.category !== 'expense') {
      return NextResponse.json({ error: 'Transaction is not an expense' }, { status: 400 });
    }

    // Delete the expense transaction
    const { error } = await (supabase as any)
      .from('finance_transactions')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Error in expense delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
