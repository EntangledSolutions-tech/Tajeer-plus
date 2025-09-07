import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../../lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    let query = supabase
      .from('vehicle_colors')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('code')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      colors: data || [],
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
    console.error('Error fetching vehicle colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle colors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();
    const body = await request.json();

    // Validate required fields - only name is required now
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const { data: existingColor } = await supabase
      .from('vehicle_colors')
      .select('id')
      .eq('name', body.name)
      .single();

    if (existingColor) {
      return NextResponse.json(
        { error: 'Color name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vehicle_colors')
      .insert([{
        name: body.name,
        hex_code: body.hex_code || null,
        description: body.description || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle color:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle color' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Color ID is required' },
        { status: 400 }
      );
    }

    // Check if name already exists for other colors
    if (body.name) {
      const { data: existingColor } = await supabase
        .from('vehicle_colors')
        .select('id')
        .eq('name', body.name)
        .neq('id', body.id)
        .single();

      if (existingColor) {
        return NextResponse.json(
          { error: 'Color name already exists' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('vehicle_colors')
      .update({
        name: body.name,
        hex_code: body.hex_code || null,
        description: body.description || null,
        is_active: body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating vehicle color:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle color' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Color ID is required' },
        { status: 400 }
      );
    }

    // Check if color is referenced by any vehicles
    const { data: referencedVehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('color', id)
      .limit(1);

    if (referencedVehicles && referencedVehicles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete color that has associated vehicles' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('vehicle_colors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle color:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle color' },
      { status: 500 }
    );
  }
}

