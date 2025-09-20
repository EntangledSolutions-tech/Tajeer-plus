import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const vehicleFilter = searchParams.get('vehicle') || '';
    const statusFilter = searchParams.get('status') || '';
    const periodFilter = searchParams.get('period') || '';

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build the query
    let query = (supabase as any)
      .from('finance_transactions')
      .select(`
        *,
        transaction_type:finance_transaction_types(name, category),
        vehicle:vehicles(
          id,
          plate_number,
          make:vehicle_makes(name),
          model:vehicle_models(name),
          make_year
        ),
        customer:customers(
          id,
          name
        ),
        rental_income:rental_income(
          income_type,
          source
        ),
        rental_expense:rental_expenses(
          expense_type,
          vendor_name,
          receipt_number
        )
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    // Apply filters
    if (vehicleFilter && vehicleFilter !== 'All') {
      query = query.eq('vehicle_id', vehicleFilter);
    }

    if (statusFilter && statusFilter !== 'All') {
      const isPaid = statusFilter === 'Paid';
      query = query.eq('status', isPaid ? 'completed' : 'pending');
    }

    if (search) {
      query = query.or(`transaction_number.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply period filter
    if (periodFilter && periodFilter !== 'All') {
      const now = new Date();
      let startDate: Date;

      switch (periodFilter) {
        case 'This Month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'Last Month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'This Year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'Last Year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          break;
        default:
          startDate = new Date(0); // All time
      }

      if (periodFilter !== 'All') {
        query = query.gte('transaction_date', startDate.toISOString().split('T')[0]);
      }
    }

    // Get total count for pagination
    const { count } = await query.select('*', { count: 'exact', head: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching vehicle transactions:', error);
      return NextResponse.json({
        error: 'Failed to fetch transactions'
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedTransactions = transactions?.map((transaction: any) => ({
      id: transaction.id,
      date: transaction.transaction_date,
      transactionType: transaction.transaction_type?.name || 'Unknown',
      vehiclePlate: transaction.vehicle?.plate_number || 'N/A',
      vehicleInfo: transaction.vehicle ?
        `${transaction.vehicle.make?.name || 'N/A'} ${transaction.vehicle.model?.name || 'N/A'} ${transaction.vehicle.make_year || 'N/A'}` :
        'N/A',
      amount: `SAR ${transaction.amount?.toLocaleString() || '0'}`,
      invoiceNumber: transaction.transaction_number || 'N/A',
      status: transaction.status === 'completed' ? 'Paid' : 'Unpaid',
      isPaid: transaction.status === 'completed',
      customerName: transaction.customer?.name || '',
      description: transaction.description || '',
      // Additional fields for potential future use
      transactionTypeId: transaction.transaction_type_id,
      vehicleId: transaction.vehicle_id,
      customerId: transaction.customer_id,
      rentalIncome: transaction.rental_income,
      rentalExpense: transaction.rental_expense
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        transactions: transformedTransactions,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in vehicle transactions API:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
