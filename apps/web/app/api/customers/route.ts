import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '10';
    const limit = limitParam === '-1' ? -1 : parseInt(limitParam);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const classification = searchParams.get('classification') || '';
    const blacklisted = searchParams.get('blacklisted') === 'true';
    const withDues = searchParams.get('withDues') === 'true';

    // Calculate offset - only apply pagination if limit is not -1
    const offset = limit === -1 ? 0 : (page - 1) * limit;

    // Build query with joins to get related data
    let query = supabase
      .from('customers')
      .select(`
        *,
        classification:customer_classifications(classification),
        license_type:customer_license_types(license_type),
        nationality:customer_nationalities(nationality),
        status:customer_statuses(name)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,id_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
    }
    if (status && status !== 'all') {
      if (status === 'active') {
        // Get the Active status ID
        const { data: activeStatus } = await (supabase as any)
          .from('customer_statuses')
          .select('id')
          .eq('name', 'Active')
          .single();
        if (activeStatus) {
          query = query.eq('status_id', activeStatus.id);
        }
      } else {
        query = query.eq('status_id', status);
      }
    }
    if (classification && classification !== 'all') {
      query = query.eq('classification_id', classification);
    }
    if (blacklisted) {
      query = query.eq('status_id', (await (supabase as any).from('customer_statuses').select('id').eq('name', 'Blacklisted').single()).data?.id);
    }

    // Order by created_at descending (latest first)
    query = query.order('created_at', { ascending: false });

    // Apply pagination - only if limit is not -1
    if (limit !== -1) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: customers, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get summary statistics
    const { data: summaryData, error: summaryError } = await (supabase as any)
      .from('customers')
      .select('status_id, customer_statuses(name)');

    if (summaryError) {
      console.error('Summary error:', summaryError);
    }

    const summary = {
      total: count || 0,
      active: summaryData?.filter((c: any) => c.customer_statuses?.name === 'Active').length || 0,
      blacklisted: summaryData?.filter((c: any) => c.customer_statuses?.name === 'Blacklisted').length || 0,
      withDues: 0 // This field doesn't exist in the current schema
    };

    // Transform the data to match frontend expectations
    const transformedCustomers = customers?.map((customer: any) => {
      // Map status to frontend expectations
      let mappedStatus = 'Active';
      if (customer.status?.name === 'Blacklisted') {
        mappedStatus = 'Blacklisted';
      } else if (customer.status?.name === 'Active') {
        mappedStatus = 'Active';
      } else if (customer.status?.name) {
        mappedStatus = customer.status.name;
      }

      return {
        id: customer.id,
        name: customer.name || 'N/A',
        id_number: customer.id_number || 'N/A',
        mobile: customer.mobile_number || 'N/A',
        classification: customer.classification?.classification || 'N/A',
        nationality: customer.nationality?.nationality || 'N/A',
        status: mappedStatus,
        last_contract_no: 'N/A', // This field doesn't exist in the current schema
        dues: 0, // This field doesn't exist in the current schema
        created_at: customer.created_at
      };
    }) || [];

    return NextResponse.json({
      customers: transformedCustomers,
      pagination: {
        page: limit === -1 ? 1 : page,
        limit: limit === -1 ? count || 0 : limit,
        total: count || 0,
        totalPages: limit === -1 ? 1 : Math.ceil((count || 0) / limit),
        hasNextPage: limit === -1 ? false : page < Math.ceil((count || 0) / limit),
        hasPrevPage: limit === -1 ? false : page > 1
      },
      summaryStats: summary
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      id_type,
      id_number,
      classification,
      license_type,
      date_of_birth,
      address,
      mobile_number,
      nationality,
      status
    } = body;

    // Validate required fields
    if (!name || !id_type || !id_number || !classification || !license_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if ID number already exists
    const { data: existingCustomerByID, error: idCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('id_number', id_number)
      .single();

    if (idCheckError && idCheckError.code !== 'PGRST116') {
      console.error('Error checking existing customer by ID number:', idCheckError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingCustomerByID) {
      return NextResponse.json({ error: 'Customer with this ID number already exists' }, { status: 400 });
    }

    // Insert new customer with foreign key relationships
    const { data: newCustomer, error: insertError } = await (supabase as any)
      .from('customers')
      .insert({
        name: name,
        id_type: id_type,
        id_number: id_number,
        classification_id: classification,
        license_type_id: license_type,
        date_of_birth: date_of_birth,
        address: address,
        mobile_number: mobile_number,
        nationality_id: nationality,
        status_id: status || (await (supabase as any).from('customer_statuses').select('id').eq('name', 'Active').single()).data?.id
      })
      .select(`
        *,
        classification:customer_classifications(classification),
        license_type:customer_license_types(license_type),
        nationality:customer_nationalities(nationality),
        status:customer_statuses(name)
      `)
      .single();

    if (insertError) {
      console.error('Error inserting customer:', insertError);
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Customer created successfully',
      customer: newCustomer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}