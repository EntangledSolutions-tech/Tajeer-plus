import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch specific branch
    const { data: branch, error } = await (supabase as any)
      .from('branches')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching branch:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch branch' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      branch
    });

  } catch (error) {
    console.error('Error in branch GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const {
      name,
      code,
      address,
      phone,
      email,
      manager_name,
      city_region,
      commercial_registration_number,
      website,
      branch_license_number,
      is_rental_office,
      has_no_cars,
      has_cars_and_employees,
      is_maintenance_center,
      has_shift_system_support,
      is_limousine_office,
      is_active
    } = body;

    // Update branch
    const { data: updatedBranch, error } = await (supabase as any)
      .from('branches')
      .update({
        name,
        code,
        address,
        phone,
        email,
        manager_name,
        city_region,
        commercial_registration_number,
        website,
        branch_license_number,
        is_rental_office: is_rental_office ?? false,
        has_no_cars: has_no_cars ?? false,
        has_cars_and_employees: has_cars_and_employees ?? false,
        is_maintenance_center: is_maintenance_center ?? false,
        has_shift_system_support: has_shift_system_support ?? false,
        is_limousine_office: is_limousine_office ?? false,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating branch:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Branch code already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      branch: updatedBranch
    });

  } catch (error) {
    console.error('Error in branch PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if there are vehicles associated with this branch
    const { data: vehicles, error: vehiclesError } = await (supabase as any)
      .from('vehicles')
      .select('id')
      .eq('branch_id', id)
      .eq('user_id', user.id);

    if (vehiclesError) {
      console.error('Error checking vehicles:', vehiclesError);
      return NextResponse.json({ error: 'Failed to verify branch dependencies' }, { status: 500 });
    }

    if (vehicles && vehicles.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete branch. There are vehicles associated with this branch.'
      }, { status: 400 });
    }

    // Delete branch
    const { error } = await (supabase as any)
      .from('branches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting branch:', error);
      return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully'
    });

  } catch (error) {
    console.error('Error in branch DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
