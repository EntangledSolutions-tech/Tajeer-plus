import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the specific transaction
    const { data: transaction, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !transaction) {
      console.error('Error fetching transaction:', error);
      return NextResponse.json({
        error: 'Transaction not found'
      }, { status: 404 });
    }

    // Fetch transaction type
    let transactionType = null;
    if (transaction.transaction_type_id) {
      const { data: typeData } = await supabase
        .from('finance_transaction_types')
        .select('id, name, category')
        .eq('id', transaction.transaction_type_id)
        .single();
      transactionType = typeData;
    }

    // Transform the transaction data
    const transformedTransaction = {
      id: transaction.id,
      date: transaction.transaction_date,
      transactionType: transactionType?.name || 'Unknown',
      amount: `SAR ${transaction.total_amount?.toLocaleString() || transaction.amount?.toLocaleString() || '0'}`,
      invoiceNumber: transaction.transaction_number || 'N/A',
      status: transaction.status === 'completed' ? 'Paid' : 'Unpaid',
      isPaid: transaction.status === 'completed',
      description: transaction.description || '',
      vehicleId: transaction.vehicle_id,
      customerId: transaction.customer_id,
      contractId: transaction.contract_id,
      // Additional fields
      currency: transaction.currency,
      totalAmount: transaction.total_amount,
      totalDiscount: transaction.total_discount,
      netInvoice: transaction.net_invoice,
      totalPaid: transaction.total_paid,
      remainingAmount: transaction.remaining_amount,
      vatIncluded: transaction.vat_included,
      vatRate: transaction.vat_rate,
      vatAmount: transaction.vat_amount,
      paymentType: transaction.payment_type,
      employeeName: transaction.employee_name,
      invoiceDate: transaction.invoice_date,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedTransaction
    });

  } catch (error) {
    console.error('Error in transaction details API:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
