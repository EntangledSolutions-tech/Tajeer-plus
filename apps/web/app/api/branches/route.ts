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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    let query = (supabase as any)
      .from('branches')
      .select('*', { count: 'exact' });

    // Filter by user_id for proper authentication
    query = query.eq('user_id', user.id);

    // Add search filter
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        code.ilike.%${search}%,
        address.ilike.%${search}%,
        manager_name.ilike.%${search}%
      `);
    }

    const { data: branches, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching branches:', error);
      return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      branches: branches || [],
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
    console.error('Error in branches API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const {
      name,
      code,
      address,
      phone,
      email,
      manager_name,
      city_region,
      commercial_registration_number,
      website,
      branch_license_number,
      is_rental_office,
      has_no_cars,
      has_cars_and_employees,
      is_maintenance_center,
      has_shift_system_support,
      is_limousine_office,
      is_active
    } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Insert new branch
    const { data: newBranch, error } = await (supabase as any)
      .from('branches')
      .insert({
        name,
        code,
        address,
        phone,
        email,
        manager_name,
        city_region,
        commercial_registration_number,
        website,
        branch_license_number,
        is_rental_office: is_rental_office ?? false,
        has_no_cars: has_no_cars ?? false,
        has_cars_and_employees: has_cars_and_employees ?? false,
        is_maintenance_center: is_maintenance_center ?? false,
        has_shift_system_support: has_shift_system_support ?? false,
        is_limousine_office: is_limousine_office ?? false,
        is_active: is_active ?? true,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating branch:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Branch code already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      branch: newBranch
    }, { status: 201 });

  } catch (error) {
    console.error('Error in branches POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
