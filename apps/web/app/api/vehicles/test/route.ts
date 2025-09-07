import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Get all vehicles
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, car_make, plate_number, documents')
      .limit(10);

    if (error) {
      console.error('Error fetching vehicles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: vehicles?.length || 0,
      vehicles: vehicles || []
    });
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}