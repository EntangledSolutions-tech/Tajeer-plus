import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../lib/database.types';
import { getAuthenticatedUser, addUserIdToData, updateUserRecord, getUserData, buildPaginationResponse, getPaginationParams } from '../../../lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const body = await request.json();

    // Validate required fields - only foreign keys and essential contract data
    const requiredFields = [
      'start_date', 'end_date',
      'selected_vehicle_id', 'selected_customer_id',
      'daily_rental_rate', 'hourly_delay_rate', 'current_km', 'rental_days',
      'permitted_daily_km', 'excess_km_rate', 'payment_method', 'total_amount',
      'branch_id'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get default status (first active status, fallback to first status)
    let defaultStatusId = null;
    try {
      // First try to find "Active" status specifically
      const { data: activeStatus, error: activeStatusError } = await supabase
        .from('contract_statuses')
        .select('id')
        .eq('name', 'Active')
        .eq('is_active', true)
        .single();

      if (!activeStatusError && activeStatus) {
        defaultStatusId = activeStatus.id;
      } else {
        console.log('Active status not found, trying first active status');
        // Fallback: get first active status
        const { data: statuses, error: statusError } = await supabase
          .from('contract_statuses')
          .select('id')
          .eq('is_active', true)
          .order('code')
          .limit(1);

        if (statusError) {
          console.error('Error fetching default status:', statusError);
        } else if (statuses && statuses.length > 0) {
          defaultStatusId = statuses[0]?.id;
        } else {
          // Final fallback: get any status
          const { data: fallbackStatuses } = await supabase
            .from('contract_statuses')
            .select('id')
            .order('code')
            .limit(1);
          if (fallbackStatuses && fallbackStatuses.length > 0) {
            defaultStatusId = fallbackStatuses[0]?.id;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching default status:', error);
    }

    // Generate 8-character alphanumeric contract number
    const generateContractNumber = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    const contractNumber = generateContractNumber();

    // Prepare contract data - only foreign keys and essential contract data
    const contractData = {
      // Contract Details
      start_date: body.start_date,
      end_date: body.end_date,
      contract_number_type: 'alphanumeric',
      contract_number: contractNumber,
      tajeer_number: body.tajeer_number || null,

      // Foreign Keys - Link to customer and vehicle
      selected_customer_id: body.selected_customer_id,
      selected_vehicle_id: body.selected_vehicle_id,

      // Pricing & Terms (contract-specific pricing, may differ from vehicle base rates)
      daily_rental_rate: parseFloat(body.daily_rental_rate) || 0,
      hourly_delay_rate: parseFloat(body.hourly_delay_rate) || 0,
      current_km: body.current_km || '0',
      rental_days: parseInt(body.rental_days) || 0,
      permitted_daily_km: parseInt(body.permitted_daily_km) || 0,
      excess_km_rate: parseFloat(body.excess_km_rate) || 0,
      payment_method: body.payment_method || 'cash',
      total_amount: parseFloat(body.total_amount) || 0,
      deposit: body.deposit !== undefined ? parseFloat(body.deposit) || 0 : 0,

      // Documents
      documents_count: body.documents_count || 0,
      documents: body.documents || [],

      // Vehicle Inspection (set to empty since we removed this step)
      selected_inspector: '',
      inspector_name: '',

      // Status (use default status)
      status_id: defaultStatusId,

      // Branch
      branch_id: body.branch_id
    };

    // Add user_id to ensure user ownership
    const contractDataWithUserId = addUserIdToData(contractData, user.id);

    // Log the contract data being inserted for debugging
    console.log('Contract data being inserted:', contractDataWithUserId);

    // Insert contract into database
    const { data, error: insertError } = await supabase
      .from('contracts')
      .insert(contractDataWithUserId)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      console.error('Contract data that failed:', contractDataWithUserId);
      return NextResponse.json(
        { error: `Failed to create contract: ${insertError.message || JSON.stringify(insertError)}` },
        { status: 500 }
      );
    }

    // Update vehicle status to "In Contract"
    try {
      // Get the "In Contract" status by name (more reliable than code)
      const { data: inContractStatus, error: statusError } = await supabase
        .from('vehicle_statuses')
        .select('id')
        .eq('name', 'In Contract')
        .single();

      if (statusError) {
        console.error('Error fetching "In Contract" vehicle status:', statusError);
      } else if (inContractStatus) {
        // Update the vehicle's status
        const { error: vehicleUpdateError } = await supabase
          .from('vehicles')
          .update({
            status_id: inContractStatus.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', body.selected_vehicle_id)
          .eq('user_id', user.id);

        if (vehicleUpdateError) {
          console.error('Error updating vehicle status:', vehicleUpdateError);
          // Don't fail the contract creation, just log the error
        } else {
          console.log(`Vehicle ${body.selected_vehicle_id} status updated to "In Contract"`);
        }
      } else {
        console.warn('Vehicle status "In Contract" not found');
      }
    } catch (statusUpdateError) {
      console.error('Exception while updating vehicle status:', statusUpdateError);
      // Don't fail the contract creation, just log the error
    }

    // Return success response with the created contract
    return NextResponse.json({
      success: true,
      contract: data,
      message: 'Contract created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Remove any fields that shouldn't be updated - only foreign keys and contract-specific data
    const allowedFields = [
      'start_date', 'end_date', 'status_id',
      'contract_number_type', 'contract_number', 'tajeer_number',
      'selected_customer_id', 'selected_vehicle_id',
      'daily_rental_rate', 'hourly_delay_rate', 'current_km', 'rental_days',
      'permitted_daily_km', 'excess_km_rate', 'payment_method', 'deposit',
      'membership_enabled', 'total_amount', 'selected_inspector',
      'inspector_name', 'documents_count', 'documents'
    ];

    // Filter update data to only include allowed fields
    const filteredUpdateData: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    // No need to add updated_by since we're using user_id for ownership

    // Log the contract data being updated for debugging
    console.log('Contract data being updated:', filteredUpdateData);

    // Update contract in database with user ownership validation
    const { data, error: updateError } = await updateUserRecord(
      supabase,
      'contracts',
      id,
      filteredUpdateData,
      user.id
    );

    if (updateError) {
      console.error('Database update error:', updateError);
      console.error('Contract data that failed:', filteredUpdateData);
      return NextResponse.json(
        { error: `Failed to update contract: ${updateError.message || JSON.stringify(updateError)}` },
        { status: 500 }
      );
    }

    // Return success response with the updated contract
    return NextResponse.json({
      success: true,
      contract: data,
      message: 'Contract updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Keep the existing GET method for fetching contracts list
export async function GET(request: NextRequest) {
  try {
    console.log('Contracts API called');
    const { user, supabase } = await getAuthenticatedUser(request);

    const { page, limit, search, offset } = getPaginationParams(request);
    const status = new URL(request.url).searchParams.get('status') || '';
    const branchId = new URL(request.url).searchParams.get('branch_id');

    // If search is provided, find matching customer and vehicle IDs
    let matchingCustomerIds: string[] = [];
    let matchingVehicleIds: string[] = [];

    if (search) {
      // Search for customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', `%${search}%`);

      if (customers) {
        matchingCustomerIds = customers.map((c: any) => c.id);
      }

      // Search for vehicles
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .ilike('plate_number', `%${search}%`);

      if (vehicles) {
        matchingVehicleIds = vehicles.map((v: any) => v.id);
      }
    }

    // Use a JOIN to fetch contracts with status, customer, and vehicle information
    let query = supabase
      .from('contracts')
      .select(`
        *,
        contract_statuses (
          name,
          color
        ),
        customer:customers!selected_customer_id (
          name,
          id_number
        ),
        vehicle:vehicles!selected_vehicle_id (
          plate_number,
          serial_number
        )
      `, { count: 'exact' })
      .eq('user_id', user.id); // Filter by user

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    // Add search filter - search across contracts, customers, and vehicles
    if (search) {
      // Build OR conditions for contract fields, customer IDs, and vehicle IDs
      const conditions: string[] = [];
      conditions.push(`contract_number.ilike.%${search}%`);
      conditions.push(`tajeer_number.ilike.%${search}%`);

      // Add customer ID matches
      if (matchingCustomerIds.length > 0) {
        conditions.push(`selected_customer_id.in.(${matchingCustomerIds.join(',')})`);
      }

      // Add vehicle ID matches
      if (matchingVehicleIds.length > 0) {
        conditions.push(`selected_vehicle_id.in.(${matchingVehicleIds.join(',')})`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }
    }

    // Add status filter - need to find status_id by status name
    if (status) {
      // First get the status_id for the given status name
      const { data: statusData, error: statusError } = await (supabase as any)
        .from('contract_statuses')
        .select('id')
        .eq('name', status)
        .single();

      if (statusError) {
        console.error('Status lookup error:', statusError);
        return NextResponse.json(
          { error: `Invalid status: ${status}` },
          { status: 400 }
        );
      }

      if (statusData) {
        query = query.eq('status_id', statusData.id);
      }
    }

    let queryResult = query.order('created_at', { ascending: false });

    // Apply pagination - only if limit is not -1
    if (limit !== -1) {
      queryResult = queryResult.range(offset, offset + limit - 1);
    }

    const { data: contracts, error, count } = await queryResult;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contracts' },
        { status: 500 }
      );
    }

    const totalPages = limit === -1 ? 1 : Math.ceil((count || 0) / limit);
    const hasNextPage = limit === -1 ? false : page < totalPages;
    const hasPrevPage = limit === -1 ? false : page > 1;

    // Format contracts to flatten the status object
    const formattedContracts = (contracts || []).map((contract: any) => {
      const { contract_statuses, ...restContract } = contract;

      return {
        ...restContract,
        status: contract_statuses ? {
          name: contract_statuses.name,
          color: contract_statuses.color
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      contracts: formattedContracts,
      pagination: {
        page: limit === -1 ? 1 : page,
        limit: limit === -1 ? count || 0 : limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}