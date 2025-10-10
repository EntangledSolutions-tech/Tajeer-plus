import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getAuthenticatedUser, addUserIdToData, getUserData, buildPaginationResponse, getPaginationParams } from '../../../lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { page, limit, search, offset } = getPaginationParams(request);
    const status = new URL(request.url).searchParams.get('status') || '';
    const classification = new URL(request.url).searchParams.get('classification') || '';
    const blacklisted = new URL(request.url).searchParams.get('blacklisted') === 'true';
    const withDues = new URL(request.url).searchParams.get('withDues') === 'true';
    const branchId = new URL(request.url).searchParams.get('branch_id');

    // Build query with joins to get related data
    let query = supabase
      .from('customers')
      .select(`
        *,
        classification:customer_classifications(classification),
        license_type:customer_license_types(license_type),
        nationality:customer_nationalities(nationality),
        status:customer_statuses(name)
      `, { count: 'exact' })
      .eq('user_id', user.id); // Filter by user

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

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

    // Get summary statistics for this user - filter by same criteria as main query
    let summaryQuery = supabase
      .from('customers')
      .select('status_id, customer_statuses(name)')
      .eq('user_id', user.id);

    // Apply same branch filter to summary stats
    if (branchId) {
      summaryQuery = summaryQuery.eq('branch_id', branchId);
    }

    const { data: summaryData, error: summaryError } = await summaryQuery;

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
    const { user, supabase } = await getAuthenticatedUser(request);

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
      status,
      branch_id
    } = body;

    // Validate required fields
    if (!name || !id_type || !id_number || !classification || !license_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that branch_id is provided
    if (!branch_id) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
    }

    // Check if ID number already exists for this user
    const { data: existingCustomerByID, error: idCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('id_number', id_number)
      .eq('user_id', user.id)
      .single();

    if (idCheckError && idCheckError.code !== 'PGRST116') {
      console.error('Error checking existing customer by ID number:', idCheckError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingCustomerByID) {
      return NextResponse.json({ error: 'Customer with this ID number already exists' }, { status: 400 });
    }

    // Prepare customer data with user_id and branch_id
    const customerData = {
      name: name,
      id_type: id_type,
      id_number: id_number,
      classification_id: classification,
      license_type_id: license_type,
      date_of_birth: date_of_birth,
      address: address,
      mobile_number: mobile_number,
      nationality_id: nationality,
      status_id: status || (await supabase.from('customer_statuses').select('id').eq('name', 'Active').single()).data?.id,
      branch_id: branch_id
    };

    // Add user_id to ensure user ownership
    const customerDataWithUserId = addUserIdToData(customerData, user.id);

    // Insert new customer with foreign key relationships
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert(customerDataWithUserId)
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