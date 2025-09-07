import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const vehicleId = params.id;

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query to find contracts for this specific vehicle
    let query = supabase
      .from('contracts')
      .select(`
        *,
        status_details:contract_statuses(name, description, color)
      `, { count: 'exact' })
      .eq('selected_vehicle_id', vehicleId);

    // Add search filter
    if (search) {
      query = query.or(`
        contract_number.ilike.%${search}%,
        customer_name.ilike.%${search}%
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
        { error: 'Failed to fetch vehicle contracts' },
        { status: 500 }
      );
    }

    // Calculate summary statistics using status_details
    const summaryData = {
      total: count || 0,
      active: contracts?.filter(c => c.status_details?.name === 'Active').length || 0,
      completed: contracts?.filter(c => c.status_details?.name === 'Completed').length || 0
    };

    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      contracts: contracts || [],
      summary: summaryData,
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
