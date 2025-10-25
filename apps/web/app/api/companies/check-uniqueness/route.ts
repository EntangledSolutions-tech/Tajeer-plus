import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

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
    const { field, value } = body;

    if (!field || !value) {
      return NextResponse.json(
        { error: 'Field and value are required' },
        { status: 400 }
      );
    }

    // Check if the value already exists in the specified field
    const { data: existingRecord, error } = await supabase
      .from('companies')
      .select(field)
      .eq(field, value)
      .eq('user_id', user.id) // Only check within user's data
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to check uniqueness' },
        { status: 500 }
      );
    }

    // If no record found (PGRST116 is "not found" error), the value is unique
    const isUnique = !existingRecord;

    return NextResponse.json({ isUnique });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
