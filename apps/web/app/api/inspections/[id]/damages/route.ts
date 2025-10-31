import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../../../lib/database.types';
import { getAuthenticatedUser } from '../../../../../lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const { id } = await params;

    // First verify the inspection exists and user has access
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        id,
        vehicle:vehicles!vehicle_id(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (inspectionError || !inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Verify user owns the vehicle associated with this inspection
    if (inspection.vehicle?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch damages for this inspection
    const { data: damages, error: damagesError } = await supabase
      .from('damages')
      .select('*')
      .eq('inspection_id', id)
      .order('location', { ascending: true })
      .order('category', { ascending: true })
      .order('area', { ascending: true });

    if (damagesError) {
      console.error('Error fetching damages:', damagesError);
      return NextResponse.json(
        { error: 'Failed to fetch damages', details: damagesError.message },
        { status: 500 }
      );
    }

    // Group damages by location and category
    const groupedDamages = {
      exterior: {} as Record<string, any[]>,
      interior: {} as Record<string, any[]>
    };

    // Track damage numbers per category
    const categoryCounters: Record<string, number> = {};

    damages?.forEach((damage) => {
      const location = damage.location.toLowerCase();
      const category = damage.category;
      const categoryKey = `${location}_${category}`;

      // Initialize counter for this category if not exists
      if (!categoryCounters[categoryKey]) {
        categoryCounters[categoryKey] = 0;
      }

      // Increment counter for this category
      categoryCounters[categoryKey]++;

      const damageData = {
        id: damage.id,
        damage_number: categoryCounters[categoryKey],
        damage_level: damage.damage_level,
        area: damage.area,
        description: damage.description,
        cost: Number(damage.maintenance_amount || 0),
        images: damage.photos || [],
        created_at: damage.created_at,
        updated_at: damage.updated_at
      };

      if (location === 'exterior') {
        if (!groupedDamages.exterior[category]) {
          groupedDamages.exterior[category] = [];
        }
        groupedDamages.exterior[category].push(damageData);
      } else if (location === 'interior') {
        if (!groupedDamages.interior[category]) {
          groupedDamages.interior[category] = [];
        }
        groupedDamages.interior[category].push(damageData);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        damages: groupedDamages
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/inspections/[id]/damages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    const { id } = await params;

    const body = await request.json();
    const {
      category,
      location,
      area,
      description,
      damage_level,
      maintenance_amount = 0,
      photos = []
    } = body;

    // Validate required fields
    if (!category || !location || !area || !description || !damage_level) {
      return NextResponse.json(
        { error: 'Missing required fields: category, location, area, description, and damage_level are required' },
        { status: 400 }
      );
    }

    // First verify the inspection exists and user has access
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        id,
        vehicle_id,
        vehicle:vehicles!vehicle_id(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (inspectionError || !inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Verify user owns the vehicle associated with this inspection
    if (inspection.vehicle?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Insert damage
    const { data: damage, error: insertError } = await supabase
      .from('damages')
      .insert({
        inspection_id: id,
        vehicle_id: inspection.vehicle_id,
        category,
        location,
        area,
        description,
        damage_level,
        maintenance_amount,
        photos
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating damage:', insertError);
      return NextResponse.json(
        { error: 'Failed to create damage', details: insertError.message },
        { status: 500 }
      );
    }

    // Update inspection damage counts
    const { error: updateError } = await supabase
      .from('inspections')
      .update({
        total_damages: supabase.sql`total_damages + 1`,
        exterior_damages: location.toLowerCase() === 'exterior' 
          ? supabase.sql`exterior_damages + 1` 
          : supabase.sql`exterior_damages`,
        interior_damages: location.toLowerCase() === 'interior' 
          ? supabase.sql`interior_damages + 1` 
          : supabase.sql`interior_damages`
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating inspection damage counts:', updateError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true, data: damage }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/inspections/[id]/damages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
