import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'income' or 'expense'

    let query = (supabase as any)
      .from('finance_transaction_types')
      .select('id, name, code, category, description, is_active')
      .eq('is_active', true);

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Order by name
    query = query.order('name');

    const { data: transactionTypes, error } = await query;

    if (error) {
      console.error('Error fetching transaction types:', error);
      return NextResponse.json({ error: 'Failed to fetch transaction types' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactionTypes: transactionTypes || []
    });

  } catch (error) {
    console.error('Error fetching transaction types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
