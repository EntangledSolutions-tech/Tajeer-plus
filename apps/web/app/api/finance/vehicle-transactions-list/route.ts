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
      .select('*')
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

    console.log('Raw transactions from database:', JSON.stringify(transactions, null, 2));

    // Fetch related data separately
    const transactionTypeIds = [...new Set(transactions?.map(t => t.transaction_type_id).filter(Boolean) || [])];
    const vehicleIds = [...new Set(transactions?.map(t => t.vehicle_id).filter(Boolean) || [])];
    const customerIds = [...new Set(transactions?.map(t => t.customer_id).filter(Boolean) || [])];

    // Fetch transaction types
    const { data: transactionTypes } = await supabase
      .from('finance_transaction_types')
      .select('id, name, category')
      .in('id', transactionTypeIds);

    // Fetch vehicles with makes and models
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select(`
        id,
        plate_number,
        make_year,
        make:vehicle_makes!make_id(name),
        model:vehicle_models!model_id(name)
      `)
      .in('id', vehicleIds);

    // Fetch customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', customerIds);

    console.log('Transaction types:', JSON.stringify(transactionTypes, null, 2));
    console.log('Vehicles:', JSON.stringify(vehicles, null, 2));
    console.log('Customers:', JSON.stringify(customers, null, 2));

    // Create lookup maps
    const transactionTypeMap = new Map(transactionTypes?.map(t => [t.id, t]) || []);
    const vehicleMap = new Map(vehicles?.map(v => [v.id, v]) || []);
    const customerMap = new Map(customers?.map(c => [c.id, c]) || []);

    // Transform the data to match the expected format
    const transformedTransactions = transactions?.map((transaction: any) => {
      const transactionType = transactionTypeMap.get(transaction.transaction_type_id);
      const vehicle = vehicleMap.get(transaction.vehicle_id);
      const customer = customerMap.get(transaction.customer_id);

      return {
        id: transaction.id,
        date: transaction.transaction_date,
        transactionType: transactionType?.name || 'Unknown',
        vehiclePlate: vehicle?.plate_number || 'N/A',
        vehicleInfo: vehicle ?
          `${vehicle.make?.name || 'N/A'} ${vehicle.model?.name || 'N/A'} ${vehicle.make_year || 'N/A'}` :
          'N/A',
        amount: `SAR ${transaction.total_amount?.toLocaleString() || '0'}`,
        invoiceNumber: transaction.transaction_number || 'N/A',
        status: transaction.status === 'completed' ? 'Paid' : 'Unpaid',
        isPaid: transaction.status === 'completed',
        customerName: customer?.name || '',
        description: transaction.description || '',
        // Additional fields for potential future use
        transactionTypeId: transaction.transaction_type_id,
        vehicleId: transaction.vehicle_id,
        customerId: transaction.customer_id,
        rentalIncome: transaction.rental_income,
        rentalExpense: transaction.rental_expenses
      };
    }) || [];

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in vehicle transactions API:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
