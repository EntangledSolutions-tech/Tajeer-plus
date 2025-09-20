import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const branchId = searchParams.get('branchId');

    // Calculate date range based on period
    let dateFilter = null;
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = today.toISOString().split('T')[0];
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo.toISOString().split('T')[0];
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = monthAgo.toISOString().split('T')[0];
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = yearAgo.toISOString().split('T')[0];
    }

    // Fetch all transactions (temporarily remove user_id filter for debugging)
    let incomeQuery = supabase
      .from('finance_transactions')
      .select(`
        id,
        amount,
        transaction_date,
        transaction_type_id,
        user_id
      `);

    // Apply date filter if specified
    if (dateFilter) {
      incomeQuery = incomeQuery.gte('transaction_date', dateFilter);
    }

    // Apply branch filter if specified
    if (branchId) {
      incomeQuery = incomeQuery.eq('branch_id', branchId);
    }

    const { data: allTransactions, error: transactionsError } = await incomeQuery;

    if (transactionsError) {
      console.error('Transactions query error:', transactionsError);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    console.log('Raw transactions query result:', {
      allTransactions: allTransactions?.length || 0,
      sampleTransaction: allTransactions?.[0],
      userId: user.id,
      period,
      dateFilter
    });

    // Get transaction types to filter by category
    const { data: transactionTypes, error: typesError } = await supabase
      .from('finance_transaction_types')
      .select('id, category');

    if (typesError) {
      console.error('Transaction types query error:', typesError);
      return NextResponse.json(
        { error: 'Failed to fetch transaction types' },
        { status: 500 }
      );
    }

    console.log('Transaction types:', transactionTypes);

    // Create a map of transaction_type_id to category
    const typeCategoryMap = new Map();
    transactionTypes?.forEach(type => {
      typeCategoryMap.set(type.id, type.category);
    });

    // Filter transactions by category and user
    const incomeTransactions = allTransactions?.filter(transaction =>
      transaction.user_id === user.id &&
      typeCategoryMap.get(transaction.transaction_type_id) === 'income'
    ) || [];

    const expenseTransactions = allTransactions?.filter(transaction =>
      transaction.user_id === user.id &&
      typeCategoryMap.get(transaction.transaction_type_id) === 'expense'
    ) || [];

    // Calculate totals
    const totalRevenue = incomeTransactions?.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.amount || '0');
    }, 0) || 0;

    const totalExpenses = expenseTransactions?.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.amount || '0');
    }, 0) || 0;

    const netBalance = totalRevenue - totalExpenses;

    // Calculate transaction counts
    const incomeCount = incomeTransactions?.length || 0;
    const expenseCount = expenseTransactions?.length || 0;
    const totalTransactions = incomeCount + expenseCount;

    console.log('Summary calculation:', {
      allTransactionsCount: allTransactions?.length || 0,
      incomeTransactionsCount: incomeCount,
      expenseTransactionsCount: expenseCount,
      totalRevenue,
      totalExpenses,
      netBalance,
      transactionTypesCount: transactionTypes?.length || 0
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalExpenses,
        netBalance,
        incomeCount,
        expenseCount,
        totalTransactions
      },
      period,
      branchId
    });

  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
