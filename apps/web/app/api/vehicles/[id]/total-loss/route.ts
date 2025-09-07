import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface TotalLossData {
  vehicleId: string;
  insuranceCompany: string;
  insuranceAmount: number;
  depreciationDate: string;
  details: string;
  createTransferLog?: boolean;
  transferType?: string;
  fromLocation?: string;
  toLocation?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const vehicleId = context.params.id;
    const body = await request.json();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const {
      insuranceCompany,
      insuranceAmount,
      depreciationDate,
      details,
      createTransferLog = false,
      transferType = 'Destroyed',
      fromLocation = 'Current Branch',
      toLocation = 'Garbage'
    }: Omit<TotalLossData, 'vehicleId'> = body;

    // Validate required fields
    if (!insuranceCompany || !insuranceAmount || !depreciationDate || !details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date
    const depreciationDateObj = new Date(depreciationDate);
    if (isNaN(depreciationDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid depreciation date' },
        { status: 400 }
      );
    }

    // Check if depreciation date is not in the future
    if (depreciationDateObj > new Date()) {
      return NextResponse.json(
        { error: 'Depreciation date cannot be in the future' },
        { status: 400 }
      );
    }

    // Validate insurance amount
    if (typeof insuranceAmount !== 'number' || insuranceAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid insurance amount' },
        { status: 400 }
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

    // Create transfer log if requested
    if (createTransferLog) {
      const transferData = {
        vehicle_id: vehicleId,
        transfer_type: 'total_loss',
        transfer_date: depreciationDate,
        from_branch_id: vehicle.branch_id,
        to_branch_id: null, // No specific branch for total loss
        from_location: fromLocation,
        to_location: toLocation,
        details: `Vehicle marked as total loss: ${details}`,
        user_id: user.id,
        additional_data: {
          type: transferType,
          from: vehicle.branch?.name || fromLocation,
          to: toLocation,
          vehicle_plate: vehicle.plate_number,
          insurance_amount: insuranceAmount,
          depreciation_date: depreciationDate
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

      console.log('Transfer log created:', transfer);
    }

    // TODO: Save to database
    // Example database insertion:
    /*
    const totalLossRecord = await db.totalLoss.create({
      data: {
        vehicleId,
        insuranceCompanyId: insuranceCompany,
        insuranceAmount,
        depreciationDate: depreciationDateObj,
        details,
        createdAt: new Date()
      }
    });

    // Update vehicle status to 'Total Loss'
    await db.vehicles.update({
      where: { id: vehicleId },
      data: { status: 'TOTAL_LOSS' }
    });

    // Create transfer log entry
    await db.transferLogs.create({
      data: {
        vehicleId,
        type: 'TOTAL_LOSS',
        date: depreciationDateObj,
        details: `Vehicle marked as total loss: ${details}`,
        createdAt: new Date()
      }
    });
    */

    // For now, return a mock response
    const totalLossRecord = {
      id: Date.now().toString(),
      vehicleId,
      insuranceCompanyId: insuranceCompany,
      insuranceAmount,
      depreciationDate,
      details,
      createdAt: new Date().toISOString()
    };

    console.log('Total loss record created:', totalLossRecord);

    return NextResponse.json(
      { 
        message: 'Vehicle marked as total loss successfully',
        data: totalLossRecord
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating total loss record:', error);
    return NextResponse.json(
      { error: 'Failed to mark vehicle as total loss' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve total loss history for a vehicle
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const vehicleId = context.params.id;

    // TODO: Fetch from database
    // const totalLossRecords = await db.totalLoss.findMany({
    //   where: { vehicleId },
    //   include: { insuranceCompany: true },
    //   orderBy: { depreciationDate: 'desc' }
    // });

    // For now, return empty array
    const totalLossRecords: any[] = [];

    return NextResponse.json(totalLossRecords);
  } catch (error) {
    console.error('Error fetching total loss history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch total loss history' },
      { status: 500 }
    );
  }
}

