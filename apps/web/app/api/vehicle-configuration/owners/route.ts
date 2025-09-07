import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../../lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

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

    let query = supabase
      .from('vehicle_owners')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('code', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle owners' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      owners: data || [],
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
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields - only name is required according to schema
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const { data: existingOwnerName } = await supabase
      .from('vehicle_owners')
      .select('id')
      .eq('name', body.name)
      .single();

    if (existingOwnerName) {
      return NextResponse.json(
        { error: 'Owner name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vehicle_owners')
      .insert([{
        name: body.name,
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create vehicle owner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, owner: data }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if name already exists for other owners (if provided)
    if (body.name) {
      const { data: existingOwnerName } = await supabase
        .from('vehicle_owners')
        .select('id')
        .eq('name', body.name)
        .neq('id', body.id)
        .single();

      if (existingOwnerName) {
        return NextResponse.json(
          { error: 'Owner name already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vehicle_owners')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update vehicle owner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, owner: data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('vehicle_owners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete vehicle owner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Vehicle owner deleted successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
