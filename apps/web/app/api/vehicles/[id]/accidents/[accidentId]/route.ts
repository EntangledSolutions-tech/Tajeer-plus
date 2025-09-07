import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// DELETE endpoint to remove an accident record
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; accidentId: string }> }
) {
  try {
    const { id: vehicleId, accidentId } = await context.params;

    // Get authenticated user
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!accidentId) {
      return NextResponse.json(
        { error: 'Accident ID is required' },
        { status: 400 }
      );
    }

    // Delete accident record from database
    const { error: deleteError } = await (supabase as any)
      .from('vehicle_accidents')
      .delete()
      .eq('id', accidentId)
      .eq('vehicle_id', vehicleId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete accident record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Accident record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accident record:', error);
    return NextResponse.json(
      { error: 'Failed to delete accident record' },
      { status: 500 }
    );
  }
}
