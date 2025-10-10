import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const supabase = getSupabaseServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const branchId = searchParams.get('branch_id');

    // Calculate offset
    const offset = (page - 1) * limit;

    let query = supabase
      .from('contracts')
      .select(`
        *,
        status_details:contract_statuses(name, description, color)
      `, { count: 'exact' })
      .eq('selected_customer_id', customerId)
      .eq('user_id', user.id); // Filter by authenticated user

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    // Add search filter
    if (search) {
      query = query.or(`
        contract_number.ilike.%${search}%,
        tajeer_number.ilike.%${search}%,
        vehicle_plate.ilike.%${search}%
      `);
    }

    // Add status filter
    if (status && status !== 'all') {
      // First get the status_id for the given status name
      const { data: statusData } = await (supabase as any)
        .from('contract_statuses')
        .select('id')
        .eq('name', status)
        .single();

      if (statusData) {
        query = query.eq('status_id', statusData.id);
      }
    }

    const { data: contracts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer contracts' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      contracts: contracts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
