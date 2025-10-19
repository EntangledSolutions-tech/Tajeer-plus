import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../../lib/database.types';
import { getAuthenticatedUser, updateUserRecord, deleteUserRecord } from '../../../../lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: contractId } = await params;

    // Get branch_id from query params for validation
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');

    // Fetch contract details with joins for customer and vehicle data
    // Use explicit foreign key names to ensure proper joins
    let query = supabase
      .from('contracts')
      .select(`
        *,
        contract_status:contract_statuses!status_id(id, name, color, description),
        customer:customers!selected_customer_id(
          id,
          name,
          id_type,
          id_number,
          date_of_birth,
          address,
          mobile_number,
          membership_id,
          membership_tier,
          membership_points,
          membership_valid_until
        ),
        vehicle:vehicles!selected_vehicle_id(
          id,
          serial_number,
          plate_number,
          plate_registration_type,
          make_year,
          mileage,
          vehicle_makes(name),
          vehicle_models(name),
          vehicle_colors(name),
          vehicle_statuses(name, color),
          daily_rental_rate,
          daily_hourly_delay_rate,
          daily_permitted_km,
          daily_excess_km_rate
        )
      `)
      .eq('id', contractId)
      .eq('user_id', user.id); // Filter by user

    // Also filter by branch_id if provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: contract, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found or access denied', code: 'UNAUTHORIZED_ACCESS' },
          { status: 403 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Flatten nested customer and vehicle data for easier access
    const formattedContract = {
      ...contract,
      // Map contract_status to status for backward compatibility
      status: contract.contract_status ? {
        id: contract.contract_status.id,
        name: contract.contract_status.name,
        color: contract.contract_status.color,
        description: contract.contract_status.description
      } : null,
      // Flatten customer data - keep simple fields
      customer: contract.customer ? {
        id: contract.customer.id,
        name: contract.customer.name,
        id_type: contract.customer.id_type || 'National ID',
        id_number: contract.customer.id_number,
        date_of_birth: contract.customer.date_of_birth,
        address: contract.customer.address,
        mobile_number: contract.customer.mobile_number,
        membership_id: contract.customer.membership_id,
        membership_tier: contract.customer.membership_tier,
        membership_points: contract.customer.membership_points,
        membership_valid_until: contract.customer.membership_valid_until,
        // Use default values for lookup fields
        classification: 'Individual',
        license_type: 'Private',
        nationality: 'Saudi',
        status: 'Active'
      } : null,
      // Flatten vehicle data
      vehicle: contract.vehicle ? {
        id: contract.vehicle.id,
        serial_number: contract.vehicle.serial_number,
        plate_number: contract.vehicle.plate_number,
        plate_registration_type: contract.vehicle.plate_registration_type,
        make_year: contract.vehicle.make_year,
        mileage: contract.vehicle.mileage,
        make: Array.isArray(contract.vehicle.vehicle_makes) && contract.vehicle.vehicle_makes[0]
          ? contract.vehicle.vehicle_makes[0].name
          : contract.vehicle.vehicle_makes?.name || '',
        model: Array.isArray(contract.vehicle.vehicle_models) && contract.vehicle.vehicle_models[0]
          ? contract.vehicle.vehicle_models[0].name
          : contract.vehicle.vehicle_models?.name || '',
        color: Array.isArray(contract.vehicle.vehicle_colors) && contract.vehicle.vehicle_colors[0]
          ? contract.vehicle.vehicle_colors[0].name
          : contract.vehicle.vehicle_colors?.name || '',
        status: Array.isArray(contract.vehicle.vehicle_statuses) && contract.vehicle.vehicle_statuses[0]
          ? contract.vehicle.vehicle_statuses[0].name
          : contract.vehicle.vehicle_statuses?.name || '',
        daily_rental_rate: contract.vehicle.daily_rental_rate,
        daily_hourly_delay_rate: contract.vehicle.daily_hourly_delay_rate,
        daily_permitted_km: contract.vehicle.daily_permitted_km,
        daily_excess_km_rate: contract.vehicle.daily_excess_km_rate
      } : null,
      // Add backward compatibility fields
      customer_name: contract.customer?.name || null,
      vehicle_plate: contract.vehicle?.plate_number || null,
      vehicle_serial_number: contract.vehicle?.serial_number || null
    };

    return NextResponse.json({ success: true, data: { contract: formattedContract } });

  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: contractId } = await params;
    const body = await request.json();

    // Update contract with user ownership validation
    const { data: updatedContract, error } = await updateUserRecord(
      supabase,
      'contracts',
      contractId,
      body,
      user.id
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }

    // Fetch the updated contract with joins for customer and vehicle data
    // Use explicit foreign key names to ensure proper joins
    const { data: contractWithRelations, error: fetchError } = await supabase
      .from('contracts')
      .select(`
        *,
        contract_status:contract_statuses!status_id(id, name, color, description),
        customer:customers!selected_customer_id(
          id,
          name,
          id_type,
          id_number,
          date_of_birth,
          address,
          mobile_number,
          membership_id,
          membership_tier,
          membership_points,
          membership_valid_until
        ),
        vehicle:vehicles!selected_vehicle_id(
          id,
          serial_number,
          plate_number,
          plate_registration_type,
          make_year,
          mileage,
          vehicle_makes(name),
          vehicle_models(name),
          vehicle_colors(name),
          vehicle_statuses(name, color),
          daily_rental_rate,
          daily_hourly_delay_rate,
          daily_permitted_km,
          daily_excess_km_rate
        )
      `)
      .eq('id', contractId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated contract with relations:', fetchError);
      // Return the updated contract without relations if fetch fails
      return NextResponse.json({ success: true, contract: updatedContract });
    }

    // Flatten nested customer and vehicle data for easier access
    const formattedContract = {
      ...contractWithRelations,
      // Map contract_status to status for backward compatibility
      status: contractWithRelations.contract_status ? {
        id: contractWithRelations.contract_status.id,
        name: contractWithRelations.contract_status.name,
        color: contractWithRelations.contract_status.color,
        description: contractWithRelations.contract_status.description
      } : null,
      // Flatten customer data - keep simple fields
      customer: contractWithRelations.customer ? {
        id: contractWithRelations.customer.id,
        name: contractWithRelations.customer.name,
        id_type: contractWithRelations.customer.id_type || 'National ID',
        id_number: contractWithRelations.customer.id_number,
        date_of_birth: contractWithRelations.customer.date_of_birth,
        address: contractWithRelations.customer.address,
        mobile_number: contractWithRelations.customer.mobile_number,
        membership_id: contractWithRelations.customer.membership_id,
        membership_tier: contractWithRelations.customer.membership_tier,
        membership_points: contractWithRelations.customer.membership_points,
        membership_valid_until: contractWithRelations.customer.membership_valid_until,
        // Use default values for lookup fields
        classification: 'Individual',
        license_type: 'Private',
        nationality: 'Saudi',
        status: 'Active'
      } : null,
      // Flatten vehicle data
      vehicle: contractWithRelations.vehicle ? {
        id: contractWithRelations.vehicle.id,
        serial_number: contractWithRelations.vehicle.serial_number,
        plate_number: contractWithRelations.vehicle.plate_number,
        plate_registration_type: contractWithRelations.vehicle.plate_registration_type,
        make_year: contractWithRelations.vehicle.make_year,
        mileage: contractWithRelations.vehicle.mileage,
        make: Array.isArray(contractWithRelations.vehicle.vehicle_makes) && contractWithRelations.vehicle.vehicle_makes[0]
          ? contractWithRelations.vehicle.vehicle_makes[0].name
          : contractWithRelations.vehicle.vehicle_makes?.name || '',
        model: Array.isArray(contractWithRelations.vehicle.vehicle_models) && contractWithRelations.vehicle.vehicle_models[0]
          ? contractWithRelations.vehicle.vehicle_models[0].name
          : contractWithRelations.vehicle.vehicle_models?.name || '',
        color: Array.isArray(contractWithRelations.vehicle.vehicle_colors) && contractWithRelations.vehicle.vehicle_colors[0]
          ? contractWithRelations.vehicle.vehicle_colors[0].name
          : contractWithRelations.vehicle.vehicle_colors?.name || '',
        status: Array.isArray(contractWithRelations.vehicle.vehicle_statuses) && contractWithRelations.vehicle.vehicle_statuses[0]
          ? contractWithRelations.vehicle.vehicle_statuses[0].name
          : contractWithRelations.vehicle.vehicle_statuses?.name || '',
        daily_rental_rate: contractWithRelations.vehicle.daily_rental_rate,
        daily_hourly_delay_rate: contractWithRelations.vehicle.daily_hourly_delay_rate,
        daily_permitted_km: contractWithRelations.vehicle.daily_permitted_km,
        daily_excess_km_rate: contractWithRelations.vehicle.daily_excess_km_rate
      } : null,
      // Add backward compatibility fields
      customer_name: contractWithRelations.customer?.name || null,
      vehicle_plate: contractWithRelations.vehicle?.plate_number || null,
      vehicle_serial_number: contractWithRelations.vehicle?.serial_number || null
    };

    return NextResponse.json({ success: true, data: { contract: formattedContract } });

  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: contractId } = await params;

    // First, get the contract to retrieve the vehicle ID
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('selected_vehicle_id')
      .eq('id', contractId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching contract:', fetchError);
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const vehicleId = contract.selected_vehicle_id;

    // Delete contract with user ownership validation
    const { error } = await deleteUserRecord(
      supabase,
      'contracts',
      contractId,
      user.id
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }

    // Update vehicle status back to "Available"
    if (vehicleId) {
      try {
        // Get the "Available" status by name (more reliable than code)
        const { data: availableStatus, error: statusError } = await supabase
          .from('vehicle_statuses')
          .select('id')
          .eq('name', 'Available')
          .single();

        if (statusError) {
          console.error('Error fetching "Available" vehicle status:', statusError);
        } else if (availableStatus) {
          // Update the vehicle's status
          const { error: vehicleUpdateError } = await supabase
            .from('vehicles')
            .update({
              status_id: availableStatus.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', vehicleId)
            .eq('user_id', user.id);

          if (vehicleUpdateError) {
            console.error('Error updating vehicle status:', vehicleUpdateError);
            // Don't fail the contract deletion, just log the error
          } else {
            console.log(`Vehicle ${vehicleId} status updated to "Available"`);
          }
        } else {
          console.warn('Vehicle status "Available" not found');
        }
      } catch (statusUpdateError) {
        console.error('Exception while updating vehicle status:', statusUpdateError);
        // Don't fail the contract deletion, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
