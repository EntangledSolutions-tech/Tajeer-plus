import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const contractId = params.id;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    // First fetch contract details with status information
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        contract_statuses:status_id (
          id,
          name,
          color,
          description
        )
      `)
      .eq('id', contractId)
      .single();

    if (contractError) {
      console.error('Database error:', contractError);
      if (contractError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch contract details' },
        { status: 500 }
      );
    }

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Fetch customer details if customer_id exists
    let customerData = null;
    if (contract.selected_customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          id_type,
          id_number,
          classification,
          license_type,
          date_of_birth,
          address,
          mobile_number,
          nationality,
          status,
          membership_id,
          membership_tier,
          membership_points,
          membership_valid_until
        `)
        .eq('id', contract.selected_customer_id)
        .single();

      if (!customerError && customer) {
        customerData = customer;
      }
    }

    // Format the status data for the frontend
    const formattedContract = {
      ...contract,
      status: contract.contract_statuses ? {
        name: contract.contract_statuses.name,
        color: contract.contract_statuses.color
      } : null,
      customer: customerData
    };

    // Remove the raw contract_statuses object
    delete formattedContract.contract_statuses;

    return NextResponse.json({
      success: true,
      contract: formattedContract
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const contractId = params.id;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update contract in database
    const { data: contract, error } = await supabase
      .from('contracts')
      .update(body)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update contract' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contract
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const contractId = params.id;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete contract from database
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete contract' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
