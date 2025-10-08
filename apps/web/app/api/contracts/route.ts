import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../lib/database.types';
import { getAuthenticatedUser, addUserIdToData, updateUserRecord, getUserData, buildPaginationResponse, getPaginationParams } from '../../../lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }
    const { user, supabase } = await getAuthenticatedUser(request);

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'start_date', 'end_date',
      'selected_vehicle_id', 'vehicle_plate', 'vehicle_serial_number',
      'daily_rental_rate', 'hourly_delay_rate', 'current_km', 'rental_days',
      'permitted_daily_km', 'excess_km_rate', 'payment_method', 'total_amount'
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

    // Prepare contract data
    const contractData = {
      // Contract Details
      start_date: body.start_date,
      end_date: body.end_date,
      contract_number_type: 'alphanumeric',
      contract_number: contractNumber,
      tajeer_number: body.tajeer_number || null,

      // Customer Details
      selected_customer_id: body.selected_customer_id || null,
      customer_name: body.customer_name || null,
      customer_id_type: body.customer_id_type || null,
      customer_id_number: body.customer_id_number || null,
      customer_classification: body.customer_classification || null,
      customer_date_of_birth: body.customer_date_of_birth || null,
      customer_license_type: body.customer_license_type || null,
      customer_address: body.customer_address || null,

      // Vehicle Details
      selected_vehicle_id: body.selected_vehicle_id,
      vehicle_plate: body.vehicle_plate,
      vehicle_serial_number: body.vehicle_serial_number,

      // Pricing & Terms
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

      // Metadata
      created_by: user.id,
      updated_by: user.id
    };
      // Status
      status_id: body.status_id
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
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }
    const { user, supabase } = await getAuthenticatedUser(request);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Remove any fields that shouldn't be updated
    const allowedFields = [
      'start_date', 'end_date', 'status_id',
      'contract_number_type', 'contract_number', 'tajeer_number',
      'selected_customer_id', 'customer_name',
      'customer_id_type', 'customer_id_number', 'customer_classification',
      'customer_date_of_birth', 'customer_license_type', 'customer_address',
      'selected_vehicle_id', 'vehicle_plate', 'vehicle_serial_number',
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
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '10';
    const limit = limitParam === '-1' ? -1 : parseInt(limitParam);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Calculate offset - only apply pagination if limit is not -1
    const offset = limit === -1 ? 0 : (page - 1) * limit;
    const { user, supabase } = await getAuthenticatedUser(request);

    const { page, limit, search, offset } = getPaginationParams(request);
    const status = new URL(request.url).searchParams.get('status') || '';

    let query = supabase
      .from('contracts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id); // Filter by user

    // Add search filter
    if (search) {
      query = query.or(`
        contract_number.ilike.%${search}%,
        tajeer_number.ilike.%${search}%,
        customer_name.ilike.%${search}%,
        vehicle_plate.ilike.%${search}%
      `);
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

    // Format contracts to include status object
    const formattedContracts = await Promise.all((contracts || []).map(async (contract: any) => {
      let statusInfo = null;

      if (contract.status_id) {
        const { data: statusData } = await (supabase as any)
          .from('contract_statuses')
          .select('id, name, color, description')
          .eq('id', contract.status_id)
          .single();

        if (statusData) {
          statusInfo = {
            name: statusData.name,
            color: statusData.color
          };
        }
      }

      return {
        ...contract,
        status: statusInfo
      };
    }));

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