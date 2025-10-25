import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { z } from 'zod';

// Validation schema for classification
const classificationSchema = z.object({
  classification: z.string().min(2, 'Classification must be at least 2 characters').max(100, 'Classification must not exceed 100 characters'),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    let limit = parseInt(searchParams.get('limit') || '10');

    // Validate limit - must be positive, default to 10 if invalid
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }
    // Cap limit at 1000 to prevent excessive queries
    if (limit > 1000) {
      limit = 1000;
    }

    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    let query = supabase
      .from('customer_classifications')
      .select('*', { count: 'exact' })
      .order('code', { ascending: true });

    // Apply search filter
    if (search) {
      query = query.ilike('classification', `%${search}%`);
    }

    // Apply active filter
    if (active !== null && active !== '') {
      query = query.eq('is_active', active === 'true');
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching classifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch classifications' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/customer-configurations/classifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    // Validate the request body
    const validationResult = classificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { classification, description, is_active } = validationResult.data;

    // Check if classification already exists
    const { data: existing } = await supabase
      .from('customer_classifications')
      .select('id')
      .eq('classification', classification)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Classification already exists' },
        { status: 400 }
      );
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Insert the new classification
    const { data, error } = await supabase
      .from('customer_classifications')
      .insert({
        classification,
        description,
        is_active,
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating classification:', error);
      return NextResponse.json(
        { error: 'Failed to create classification' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/customer-configurations/classifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
