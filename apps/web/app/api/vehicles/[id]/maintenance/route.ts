import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const vehicleId = context.params.id;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all maintenance data for the vehicle
    const [
      { data: oilChanges, error: oilError },
      { data: serviceLogs, error: serviceError },
      { data: warranties, error: warrantyError },
      { data: penalties, error: penaltyError },
      { data: maintenanceLogs, error: maintenanceError },
      { data: notes, error: noteError },
      { data: inspections, error: inspectionError }
    ] = await Promise.all([
      (supabase as any)
        .from('vehicle_oil_changes')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false }),

      (supabase as any)
        .from('vehicle_service_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false }),

      (supabase as any)
        .from('vehicle_warranties')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false }),

      (supabase as any)
        .from('vehicle_penalties')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('penalty_date', { ascending: false }),

      (supabase as any)
        .from('vehicle_maintenance_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('maintenance_date', { ascending: false }),

      (supabase as any)
        .from('vehicle_notes')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('note_date', { ascending: false }),

      (supabase as any)
        .from('vehicle_inspections')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('inspection_date', { ascending: false })
    ]);

    // Check for errors
    if (oilError || serviceError || warrantyError || penaltyError || maintenanceError || noteError || inspectionError) {
      console.error('Database errors:', { oilError, serviceError, warrantyError, penaltyError, maintenanceError, noteError, inspectionError });
      return NextResponse.json(
        { error: 'Failed to fetch maintenance data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      oilChanges: oilChanges || [],
      serviceLogs: serviceLogs || [],
      warranties: warranties || [],
      penalties: penalties || [],
      maintenanceLogs: maintenanceLogs || [],
      notes: notes || [],
      inspections: inspections || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}