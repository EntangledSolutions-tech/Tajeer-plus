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

    const { id: incomeId } = await params;

    // Fetch income details with related data
    const { data: income, error } = await (supabase as any)
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
        rental_income:rental_income(
          income_type,
          source
        )
      `)
      .eq('id', incomeId)
      .eq('user_id', user.id)
      .eq('transaction_type.category', 'income')
      .single();

    if (error) {
      console.error('Error fetching income:', error);
      return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
    }

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json(income);

  } catch (error) {
    console.error('Error in income detail API:', error);
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

    const { id: incomeId } = await params;

    // First, verify this is an income transaction
    const { data: transaction, error: fetchError } = await (supabase as any)
      .from('finance_transactions')
      .select('id, transaction_type:finance_transaction_types(category)')
      .eq('id', incomeId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Income transaction not found' }, { status: 404 });
    }

    if (transaction.transaction_type.category !== 'income') {
      return NextResponse.json({ error: 'Transaction is not an income' }, { status: 400 });
    }

    // Delete the income transaction
    const { error } = await (supabase as any)
      .from('finance_transactions')
      .delete()
      .eq('id', incomeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting income:', error);
      return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Income deleted successfully' });

  } catch (error) {
    console.error('Error in income delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
