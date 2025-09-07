import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = await params;

    // Fetch customer details with related data
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        classification:customer_classifications(classification),
        license_type:customer_license_types(license_type),
        nationality:customer_nationalities(nationality),
        status:customer_statuses(name, color)
      `)
      .eq('id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = await params;
    const body = await request.json();

    // Update customer
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(body)
      .eq('id', customerId)
      .select(`
        *,
        classification:customer_classifications(classification),
        license_type:customer_license_types(license_type),
        nationality:customer_nationalities(nationality),
        status:customer_statuses(name, color)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }

    return NextResponse.json(updatedCustomer);

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = await params;

    // Delete customer
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}