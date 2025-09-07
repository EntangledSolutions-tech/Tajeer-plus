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
    const makeId = searchParams.get('make_id');

    // Calculate offset
    const offset = (page - 1) * limit;

    let query = supabase
      .from('vehicle_models')
      .select(`
        *,
        vehicle_makes (
          id,
          name,
          code
        )
      `, { count: 'exact' });

    if (makeId) {
      query = query.eq('make_id', makeId);
    }

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
      models: data || [],
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
    console.error('Error fetching vehicle models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();
    const body = await request.json();

    // Validate required fields - code is auto-generated, so don't include it
    if (!body.name || !body.make_id) {
      return NextResponse.json(
        { error: 'Name and make_id are required' },
        { status: 400 }
      );
    }

    // Check if name already exists for the same make
    const { data: existingModel } = await supabase
      .from('vehicle_models')
      .select('id')
      .eq('name', body.name)
      .eq('make_id', body.make_id)
      .single();

    if (existingModel) {
      return NextResponse.json(
        { error: 'Model name already exists for this make' },
        { status: 400 }
      );
    }

    // Insert the model without the code field (it's auto-generated)
    const { data, error } = await supabase
      .from('vehicle_models')
      .insert([{
        name: body.name,
        make_id: body.make_id,
        description: body.description || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle model:', error);

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'Invalid make_id - the selected make does not exist' },
          { status: 400 }
        );
      }
      if (error.message.includes('not null')) {
        return NextResponse.json(
          { error: 'Required fields cannot be null' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create vehicle model' },
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
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // Check if name already exists for other models of the same make
    if (body.name && body.make_id) {
      const { data: existingModel } = await supabase
        .from('vehicle_models')
        .select('id')
        .eq('name', body.name)
        .eq('make_id', body.make_id)
        .neq('id', body.id)
        .single();

      if (existingModel) {
        return NextResponse.json(
          { error: 'Model name already exists for this make' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('vehicle_models')
      .update({
        name: body.name,
        make_id: body.make_id,
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
    console.error('Error updating vehicle model:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle model' },
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
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // Check if model is referenced by any vehicles
    const { data: referencedVehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('model', id)
      .limit(1);

    if (referencedVehicles && referencedVehicles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete model that has associated vehicles' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('vehicle_models')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle model:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle model' },
      { status: 500 }
    );
  }
}

