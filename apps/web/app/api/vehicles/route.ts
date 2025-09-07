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

    const { searchParams } = new URL(request.url);
    const plateNumber = searchParams.get('plate_number');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    let query = supabase
      .from('vehicles')
      .select(`
        *,
        make:vehicle_makes!make_id(name),
        model:vehicle_models!model_id(name),
        color:vehicle_colors!color_id(name, hex_code),
        status:vehicle_statuses!status_id(name, color),
        owner:vehicle_owners!owner_id(name),
        actual_user:vehicle_actual_users!actual_user_id(name)
      `, { count: 'exact' });

    // Filter by user_id for proper authentication
    query = query.eq('user_id', user.id);

    if (plateNumber) {
      query = query.eq('plate_number', plateNumber);
    }

        if (search) {
      // Enhanced search across multiple vehicle fields and related tables
      const searchTerm = `%${search}%`;

      // First, let's search for makes, models, colors, and statuses that match
      const [makeResults, modelResults, colorResults, statusResults] = await Promise.all([
        supabase.from('vehicle_makes').select('id').ilike('name', searchTerm),
        supabase.from('vehicle_models').select('id').ilike('name', searchTerm),
        supabase.from('vehicle_colors').select('id').ilike('name', searchTerm),
        supabase.from('vehicle_statuses').select('id').ilike('name', searchTerm)
      ]);

      // Collect all matching IDs
      const makeIds = makeResults.data?.map(m => m.id) || [];
      const modelIds = modelResults.data?.map(m => m.id) || [];
      const colorIds = colorResults.data?.map(c => c.id) || [];
      const statusIds = statusResults.data?.map(s => s.id) || [];

      // Build search conditions for vehicle table fields
      const vehicleConditions = [
        'plate_number.ilike.' + searchTerm,
        'serial_number.ilike.' + searchTerm,
        'internal_reference.ilike.' + searchTerm,
        'make_year.ilike.' + searchTerm,
        'plate_registration_type.ilike.' + searchTerm
      ];

      // Add foreign key conditions if we found matching IDs
      if (makeIds.length > 0) {
        vehicleConditions.push(`make_id.in.(${makeIds.join(',')})`);
      }
      if (modelIds.length > 0) {
        vehicleConditions.push(`model_id.in.(${modelIds.join(',')})`);
      }
      if (colorIds.length > 0) {
        vehicleConditions.push(`color_id.in.(${colorIds.join(',')})`);
      }
      if (statusIds.length > 0) {
        vehicleConditions.push(`status_id.in.(${statusIds.join(',')})`);
      }

      query = query.or(vehicleConditions.join(','));
    }

    const { data: vehicles, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      );
    }



    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      vehicles: vehicles || [],
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

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Add user_id to the vehicle data
    const vehicleData = {
      ...body,
      user_id: user.id
    };

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

