import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getAuthenticatedUser } from '../../../../lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { field, value, customerId } = body;

    if (!field || !value) {
      return NextResponse.json(
        { error: 'Field and value are required' },
        { status: 400 }
      );
    }

    // Build the query based on the field type
    let query = supabase
      .from('customers')
      .select('id')
      .eq(field, value);

    // If updating an existing customer, exclude the current customer from the check
    if (customerId) {
      query = query.neq('id', customerId);
    }

    // Add user ownership filter
    query = query.eq('user_id', user.id);

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is what we want
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // If data exists, the value is not unique
    const isUnique = !data;

    return NextResponse.json({ isUnique });

  } catch (error) {
    console.error('Error checking uniqueness:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

