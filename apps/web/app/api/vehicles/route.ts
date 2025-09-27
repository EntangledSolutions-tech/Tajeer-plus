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
    const limitParam = searchParams.get('limit') || '10';
    const limit = limitParam === '-1' ? -1 : parseInt(limitParam);
    const search = searchParams.get('search') || '';

    // Enhanced filtering parameters
    const filter = searchParams.get('filter') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Vehicle-specific filters - support both single and multiple IDs
    const makeIds = searchParams.getAll('make_id');
    const modelIds = searchParams.getAll('model_id');
    const colorIds = searchParams.getAll('color_id');
    const statusIds = searchParams.getAll('status_id');
    const branchIds = searchParams.getAll('branch_id');

    // Legacy single ID support
    const makeId = searchParams.get('make_id');
    const modelId = searchParams.get('model_id');
    const colorId = searchParams.get('color_id');
    const statusId = searchParams.get('status_id');
    const branchId = searchParams.get('branch_id');
    const carClass = searchParams.get('car_class');
    const plateRegistrationType = searchParams.get('plate_registration_type');
    const makeYear = searchParams.get('make_year');
    const minMileage = searchParams.get('min_mileage');
    const maxMileage = searchParams.get('max_mileage');
    const minExpectedSalePrice = searchParams.get('min_expected_sale_price');
    const maxExpectedSalePrice = searchParams.get('max_expected_sale_price');
    const isActive = searchParams.get('is_active');

    // Additional filters
    const minMakeYear = searchParams.get('min_make_year');
    const maxMakeYear = searchParams.get('max_make_year');

    // Calculate offset - only apply pagination if limit is not -1
    const offset = limit === -1 ? 0 : (page - 1) * limit;

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
    // Temporarily commented out to debug
    // query = query.eq('user_id', user.id);

    // Apply specific filters - support both single and multiple IDs
    if (plateNumber) {
      query = query.eq('plate_number', plateNumber);
    }

    // Handle multiple make IDs or single make ID
    if (makeIds.length > 0) {
      query = query.in('make_id', makeIds);
    } else if (makeId) {
      query = query.eq('make_id', makeId);
    }

    // Handle multiple model IDs or single model ID
    if (modelIds.length > 0) {
      query = query.in('model_id', modelIds);
    } else if (modelId) {
      query = query.eq('model_id', modelId);
    }

    // Handle multiple color IDs or single color ID
    if (colorIds.length > 0) {
      query = query.in('color_id', colorIds);
    } else if (colorId) {
      query = query.eq('color_id', colorId);
    }

    // Handle multiple status IDs or single status ID
    if (statusIds.length > 0) {
      query = query.in('status_id', statusIds);
    } else if (statusId) {
      query = query.eq('status_id', statusId);
    }

    // Handle multiple branch IDs or single branch ID
    if (branchIds.length > 0) {
      query = query.in('branch_id', branchIds);
    } else if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    if (carClass) {
      query = query.eq('car_class', carClass);
    }

    if (plateRegistrationType) {
      query = query.eq('plate_registration_type', plateRegistrationType);
    }

    if (makeYear) {
      query = query.eq('make_year', makeYear);
    }

    if (minMileage) {
      query = query.gte('mileage', parseInt(minMileage));
    }

    if (maxMileage) {
      query = query.lte('mileage', parseInt(maxMileage));
    }

    if (minExpectedSalePrice) {
      query = query.gte('expected_sale_price', parseFloat(minExpectedSalePrice));
    }

    if (maxExpectedSalePrice) {
      query = query.lte('expected_sale_price', parseFloat(maxExpectedSalePrice));
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (minMakeYear) {
      query = query.gte('make_year', parseInt(minMakeYear));
    }

    if (maxMakeYear) {
      query = query.lte('make_year', parseInt(maxMakeYear));
    }

    // Apply search filter - this is the critical part that needs to work WITH filters
    if (search) {
      console.log('Search term:', search);
      console.log('Applied filters before search:', {
        makeIds, modelIds, colorIds, statusIds, branchIds,
        makeId, modelId, colorId, statusId, branchId
      });

      const searchTerm = `%${search}%`;

      // Check if we have any filters applied
      const hasFilters = makeIds.length > 0 || modelIds.length > 0 || colorIds.length > 0 ||
                        statusIds.length > 0 || branchIds.length > 0 || makeId || modelId ||
                        colorId || statusId || branchId;

      console.log('Has filters applied:', hasFilters);

      if (hasFilters) {
        // When filters are applied, we cannot use .or() as it will override all filters
        // Instead, we'll search only in plate_number field to preserve all existing filters
        // This is a compromise that ensures filters work correctly
        query = query.ilike('plate_number', searchTerm);
        console.log('Search applied WITH filters (plate_number only to preserve filter integrity)');
      } else {
        // When no filters are applied, we can do a full search across all fields
        const [makeResults, modelResults, colorResults, statusResults] = await Promise.all([
          supabase.from('vehicle_makes').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_models').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_colors').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_statuses').select('id').ilike('name', searchTerm)
        ]);

        const searchMakeIds = makeResults.data?.map(m => m.id) || [];
        const searchModelIds = modelResults.data?.map(m => m.id) || [];
        const searchColorIds = colorResults.data?.map(c => c.id) || [];
        const searchStatusIds = statusResults.data?.map(s => s.id) || [];

        const vehicleConditions = [
          'plate_number.ilike.' + searchTerm,
          'serial_number.ilike.' + searchTerm,
          'internal_reference.ilike.' + searchTerm,
          'make_year.ilike.' + searchTerm,
          'plate_registration_type.ilike.' + searchTerm
        ];

        if (searchMakeIds.length > 0) vehicleConditions.push(`make_id.in.(${searchMakeIds.join(',')})`);
        if (searchModelIds.length > 0) vehicleConditions.push(`model_id.in.(${searchModelIds.join(',')})`);
        if (searchColorIds.length > 0) vehicleConditions.push(`color_id.in.(${searchColorIds.join(',')})`);
        if (searchStatusIds.length > 0) vehicleConditions.push(`status_id.in.(${searchStatusIds.join(',')})`);

        query = query.or(vehicleConditions.join(','));
        console.log('Search applied WITHOUT filters (full search across all fields)');
      }
    }

    // Apply additional filter if provided (similar to search but can be used separately)
    if (filter) {
      const filterTerm = `%${filter}%`;
      query = query.or(`plate_number.ilike.${filterTerm},serial_number.ilike.${filterTerm},internal_reference.ilike.${filterTerm}`);
    }

    let queryResult = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination - only if limit is not -1
    if (limit !== -1) {
      queryResult = queryResult.range(offset, offset + limit - 1);
    }

    console.log('Final query being executed...');
    const { data: vehicles, error, count } = await queryResult;
    console.log('Query result:', { vehicleCount: vehicles?.length || 0, totalCount: count, error });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      );
    }



    const totalPages = limit === -1 ? 1 : Math.ceil((count || 0) / limit);
    const hasNextPage = limit === -1 ? false : page < totalPages;
    const hasPrevPage = limit === -1 ? false : page > 1;

    return NextResponse.json({
      success: true,
      vehicles: vehicles || [],
      pagination: {
        page: limit === -1 ? 1 : page,
        limit: limit === -1 ? count || 0 : limit,
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


