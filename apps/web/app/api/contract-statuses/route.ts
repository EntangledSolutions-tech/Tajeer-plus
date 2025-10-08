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
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch contract statuses
    const { data: contractStatuses, error } = await supabase
      .from('contract_statuses')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching contract statuses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contract statuses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contractStatuses || []
    });

  } catch (error) {
    console.error('Contract statuses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
