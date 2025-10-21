import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../lib/database.types';
import { getAuthenticatedUser, getPaginationParams, buildPaginationResponse } from '../../../lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { page, limit, search, offset } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const branchId = searchParams.get('branch_id');

    // Build query with joins to get vehicle and branch data
    let query = supabase
      .from('inspections')
      .select(`
        *,
        vehicle:vehicles!vehicle_id(
          id,
          plate_number,
          vehicle_makes!make_id(name),
          vehicle_models!model_id(name),
          branch:branches!branch_id(id, name),
          user_id
        )
      `, { count: 'exact' })
      .order('inspection_date', { ascending: false });

    // Get the data first to filter by user_id through the vehicle relationship
    const { data: allInspections, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching inspections:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch inspections', details: fetchError.message },
        { status: 500 }
      );
    }

    // Filter by user_id through vehicle relationship
    let filteredInspections = (allInspections || []).filter((inspection: any) => {
      return inspection.vehicle?.user_id === user.id;
    });

    // Apply branch filter if provided
    if (branchId) {
      filteredInspections = filteredInspections.filter((inspection: any) => {
        return inspection.vehicle?.branch?.id === branchId;
      });
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredInspections = filteredInspections.filter((inspection: any) => {
        return inspection.status === status;
      });
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInspections = filteredInspections.filter((inspection: any) => {
        return (
          inspection.inspector_name?.toLowerCase().includes(searchLower) ||
          inspection.vehicle?.plate_number?.toLowerCase().includes(searchLower) ||
          inspection.id?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Transform the data to match the expected format
    const transformedInspections = filteredInspections.map((inspection: any) => ({
      id: inspection.id,
      inspection_id: inspection.id, // Using id as inspection_id
      inspection_date: inspection.inspection_date,
      inspection_type: inspection.status === 'In Progress' ? 'Check-out' : 'Check-in', // Defaulting based on status
      status: inspection.status,
      inspector: inspection.inspector_name,
      vehicle: {
        id: inspection.vehicle?.id || '',
        plate_number: inspection.vehicle?.plate_number || '',
        make: inspection.vehicle?.vehicle_makes?.name || '',
        model: inspection.vehicle?.vehicle_models?.name || '',
        branch: inspection.vehicle?.branch?.name || ''
      },
      created_at: inspection.created_at,
      total_damages: inspection.total_damages,
      exterior_damages: inspection.exterior_damages,
      interior_damages: inspection.interior_damages
    }));

    // Apply pagination
    const paginatedInspections = transformedInspections.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalInspections = transformedInspections.length;
    const completedInspections = transformedInspections.filter((i: any) => i.status === 'Completed').length;
    const withDamages = transformedInspections.filter((i: any) => (i.total_damages || 0) > 0).length;

    return NextResponse.json(
      buildPaginationResponse(
        paginatedInspections,
        transformedInspections.length,
        page,
        limit
      )
    );
  } catch (error: any) {
    console.error('Error in GET /api/inspections:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const body = await request.json();

    const {
      vehicle_id,
      inspector_name,
      inspection_date,
      status = 'In Progress',
      total_damages = 0,
      exterior_damages = 0,
      interior_damages = 0
    } = body;

    // Validate required fields
    if (!vehicle_id || !inspector_name) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicle_id and inspector_name are required' },
        { status: 400 }
      );
    }

    // Verify vehicle belongs to user
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, user_id')
      .eq('id', vehicle_id)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or access denied' },
        { status: 404 }
      );
    }

    // Insert inspection
    const { data: inspection, error: insertError } = await supabase
      .from('inspections')
      .insert({
        vehicle_id,
        inspector_name,
        inspection_date: inspection_date || new Date().toISOString(),
        status,
        total_damages,
        exterior_damages,
        interior_damages
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating inspection:', insertError);
      return NextResponse.json(
        { error: 'Failed to create inspection', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: inspection }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/inspections:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

