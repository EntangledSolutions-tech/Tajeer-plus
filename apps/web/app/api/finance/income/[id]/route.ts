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

    const incomeId = params.id;

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
          classification,
          mobile_number,
          nationality,
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
