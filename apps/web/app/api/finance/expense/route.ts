import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Expense API received:', body);

    const {
      amount,
      date,
      transactionType,
      vehicle,
      branch,
      employee,
      description
    } = body;

    // Validate required fields
    if (!amount || !date || !transactionType || !vehicle || !branch || !employee || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Additional validation for transaction type
    if (!transactionType || transactionType === '' || transactionType === 'undefined') {
      return NextResponse.json({ error: 'Transaction type is required' }, { status: 400 });
    }

    // Get transaction type ID - transactionType is now the ID from SearchableSelect
    const { data: transactionTypeData, error: typeError } = await (supabase as any)
      .from('finance_transaction_types')
      .select('id, name, code')
      .eq('id', transactionType)
      .eq('category', 'expense')
      .single();

    if (typeError || !transactionTypeData) {
      console.error('Transaction type lookup failed:', { transactionType, typeError });
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    // Generate transaction number using a simple approach
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const transactionNumber = `${transactionTypeData.code}-${timestamp}-${randomSuffix}`;

    // Create main finance transaction
    const { data: transaction, error: transactionError } = await (supabase as any)
      .from('finance_transactions')
      .insert({
        transaction_number: transactionNumber,
        transaction_type_id: transactionTypeData.id,
        amount: parseFloat(amount),
        currency: 'SAR',
        transaction_date: date,
        description: description,
        branch_id: branch,
        vehicle_id: vehicle,
        employee_name: employee,
        total_amount: parseFloat(amount),
        net_invoice: parseFloat(amount),
        status: 'completed',
        user_id: user.id
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    // Create rental expense record
    const { error: expenseError } = await (supabase as any)
      .from('rental_expenses')
      .insert({
        transaction_id: transaction.id,
        expense_type: transactionTypeData.name.toLowerCase().replace(/\s+/g, '_'),
        vendor_name: 'Internal',
        receipt_number: `EXP-${Date.now()}`,
        receipt_date: date
      });

    if (expenseError) {
      console.error('Error creating rental expense:', expenseError);
      // Don't fail the request, but log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Expense transaction created successfully',
      transaction: transaction
    });

  } catch (error) {
    console.error('Error creating expense transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '10';
    const limit = limitParam === '-1' ? -1 : parseInt(limitParam);
    const search = searchParams.get('search') || '';
    const transactionType = searchParams.get('transactionType') || '';
    const period = searchParams.get('period') || '';

    // Calculate offset - only apply pagination if limit is not -1
    const offset = limit === -1 ? 0 : (page - 1) * limit;

    // First get transaction type IDs for expense category
    const { data: expenseTransactionTypes, error: typeError } = await (supabase as any)
      .from('finance_transaction_types')
      .select('id')
      .eq('category', 'expense')
      .eq('is_active', true);

    if (typeError) {
      console.error('Error fetching expense transaction types:', typeError);
      return NextResponse.json({ error: 'Failed to fetch transaction types' }, { status: 500 });
    }

    const expenseTypeIds = expenseTransactionTypes?.map((t: any) => t.id) || [];

    if (expenseTypeIds.length === 0) {
      return NextResponse.json({
        success: true,
        transactions: [],
        pagination: {
          page: 1,
          limit: limit === -1 ? 0 : limit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    let query = (supabase as any)
      .from('finance_transactions')
      .select(`
        *,
        transaction_type:finance_transaction_types(name, category),
        branch:branches(name),
        vehicle:vehicles(plate_number)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .in('transaction_type_id', expenseTypeIds);

    // Add search filter
    if (search) {
      query = query.or(`
        description.ilike.%${search}%,
        employee_name.ilike.%${search}%,
        transaction_number.ilike.%${search}%
      `);
    }

    // Add transaction type filter
    if (transactionType && transactionType !== 'all') {
      if (transactionType === 'expense') {
        // Already filtered by category above
      } else {
        // Filter by specific transaction type name - need to get the ID first
        const { data: specificType, error: specificTypeError } = await (supabase as any)
          .from('finance_transaction_types')
          .select('id')
          .eq('name', transactionType)
          .eq('category', 'expense')
          .single();

        if (!specificTypeError && specificType) {
          query = query.eq('transaction_type_id', specificType.id);
        }
      }
    }

    // Add period filter
    if (period && period !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        case 'last_year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        default:
          break;
      }

      if (startDate && endDate) {
        query = query
          .gte('transaction_date', startDate.toISOString().split('T')[0])
          .lte('transaction_date', endDate.toISOString().split('T')[0]);
      }
    }

    let queryResult = query.order('transaction_date', { ascending: false });

    // Apply pagination - only if limit is not -1
    if (limit !== -1) {
      queryResult = queryResult.range(offset, offset + limit - 1);
    }

    const { data: transactions, error, count } = await queryResult;

    if (error) {
      console.error('Error fetching expense transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    const totalPages = limit === -1 ? 1 : Math.ceil((count || 0) / limit);
    const hasNextPage = limit === -1 ? false : page < totalPages;
    const hasPrevPage = limit === -1 ? false : page > 1;

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        page: limit === -1 ? 1 : page,
        limit: limit === -1 ? count || 0 : limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
