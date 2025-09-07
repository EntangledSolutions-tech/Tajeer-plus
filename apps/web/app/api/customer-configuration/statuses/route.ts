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
      .from('customer_statuses')
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
      statuses: data || [],
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
    console.error('Error fetching customer statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer statuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();
    const body = await request.json();

    const { data, error } = await supabase
      .from('customer_statuses')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating customer status:', error);
    return NextResponse.json(
      { error: 'Failed to create customer status' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('customer_statuses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating customer status:', error);
    return NextResponse.json(
      { error: 'Failed to update customer status' },
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
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('customer_statuses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer status:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer status' },
      { status: 500 }
    );
  }
}
