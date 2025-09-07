import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface AccidentData {
  vehicleId: string;
  accidentDate: string;
  details: string;
  logMaintenanceUpdate: boolean;
  // Optional maintenance fields
  totalAmount?: string;
  statementType?: string;
  totalDiscount?: string;
  vat?: string;
  netInvoice?: string;
  totalPaid?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await context.params;
    const body = await request.json();

    const {
      accidentDate,
      details,
      logMaintenanceUpdate,
      totalAmount,
      statementType,
      totalDiscount,
      vat,
      netInvoice,
      totalPaid
    }: Omit<AccidentData, 'vehicleId'> = body;

    // Validate required fields
    if (!accidentDate || !details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date
    const accidentDateObj = new Date(accidentDate);
    if (isNaN(accidentDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid accident date' },
        { status: 400 }
      );
    }

    // Check if accident date is not in the future
    if (accidentDateObj > new Date()) {
      return NextResponse.json(
        { error: 'Accident date cannot be in the future' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save accident record to database
    const accidentData = {
      vehicle_id: vehicleId,
      user_id: user.id,
      accident_date: accidentDate,
      details,
      log_maintenance_update: logMaintenanceUpdate,
      ...(logMaintenanceUpdate && {
        total_amount: totalAmount ? parseFloat(totalAmount) : null,
        statement_type: statementType || null,
        total_discount: totalDiscount ? parseFloat(totalDiscount) : null,
        vat: vat ? parseFloat(vat) : null,
        net_invoice: netInvoice ? parseFloat(netInvoice) : null,
        total_paid: totalPaid ? parseFloat(totalPaid) : null,
      })
    };

    const { data: accidentRecord, error: insertError } = await (supabase as any)
      .from('vehicle_accidents')
      .insert(accidentData)
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save accident record' },
        { status: 500 }
      );
    }

    // Get current vehicle details for transfer log
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select(`
        id,
        plate_number,
        branch_id,
        branch:branches!vehicles_branch_id_fkey(id, name, code)
      `)
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error fetching vehicle:', vehicleError);
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Create transfer log for accident
    const transferData = {
      vehicle_id: vehicleId,
      transfer_type: 'accident',
      transfer_date: accidentDate,
      from_branch_id: vehicle.branch_id,
      to_branch_id: null, // No specific branch for accident
      from_location: vehicle.branch?.name || 'Current Branch',
      to_location: 'Workshop',
      details: `Vehicle involved in accident: ${details}`,
      user_id: user.id,
      additional_data: {
        type: 'Accident',
        from: vehicle.branch?.name || 'Current Branch',
        to: 'Workshop',
        vehicle_plate: vehicle.plate_number,
        accident_details: details
      }
    };

    const { data: transfer, error: transferError } = await supabase
      .from('vehicle_transfers')
      .insert(transferData)
      .select(`
        *,
        from_branch:branches!vehicle_transfers_from_branch_id_fkey(name, code),
        to_branch:branches!vehicle_transfers_to_branch_id_fkey(name, code),
        vehicle:vehicles(plate_number)
      `)
      .single();

    if (transferError) {
      console.error('Error creating transfer log:', transferError);
      return NextResponse.json({ error: 'Failed to create transfer log' }, { status: 500 });
    }

    // If logMaintenanceUpdate is true, create maintenance log entry
    if (logMaintenanceUpdate) {
      const maintenanceData = {
        vehicle_id: vehicleId,
        maintenance_date: accidentDate,
        maintenance_type: 'ACCIDENT',
        amount: totalAmount ? parseFloat(totalAmount) : null,
        notes: `Vehicle involved in accident: ${details}`,
      };

      const { error: maintenanceError } = await (supabase as any)
        .from('vehicle_maintenance_logs')
        .insert(maintenanceData);

      if (maintenanceError) {
        console.warn('Failed to create maintenance log:', maintenanceError);
        // Don't fail the request, just log the warning
      }
    }

    console.log('Accident record created:', accidentRecord);
    console.log('Transfer log created:', transfer);

    return NextResponse.json(
      {
        message: 'Accident record created successfully',
        data: accidentRecord
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating accident record:', error);
    return NextResponse.json(
      { error: 'Failed to create accident record' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve accident history for a vehicle
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await context.params;

    // Get authenticated user
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch accident history from database
    const { data: accidents, error } = await (supabase as any)
      .from('vehicle_accidents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('user_id', user.id)
      .order('accident_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accident history' },
        { status: 500 }
      );
    }

    return NextResponse.json(accidents || []);
  } catch (error) {
    console.error('Error fetching accident history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accident history' },
      { status: 500 }
    );
  }
}


