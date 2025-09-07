import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      deductiblePremium,
      rentalIncreaseType,
      rentalIncreaseValue
    } = body;

    // Validate required fields
    if (!name || !deductiblePremium || !rentalIncreaseType || !rentalIncreaseValue) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Prepare the data based on increase type
    const updateData: any = {
      name,
      deductible_premium: parseFloat(deductiblePremium) || 0,
      rental_increase_type: rentalIncreaseType,
      updated_at: new Date().toISOString()
    };

    if (rentalIncreaseType === 'value') {
      updateData.rental_increase_value = parseFloat(rentalIncreaseValue) || 0;
      updateData.rental_increase_percentage = null;
    } else {
      updateData.rental_increase_percentage = parseFloat(rentalIncreaseValue) || 0;
      updateData.rental_increase_value = null;
    }

    // Update insurance option
    const { data: updatedOption, error } = await (supabase as any)
      .from('insurance_options')
      .update(updateData)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update insurance option', details: error.message },
        { status: 500 }
      );
    }

    if (!updatedOption) {
      return NextResponse.json(
        { error: 'Insurance option not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        insuranceOption: updatedOption,
        message: 'Insurance option updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Soft delete by setting is_active to false
    const { data: deletedOption, error } = await (supabase as any)
      .from('insurance_options')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete insurance option', details: error.message },
        { status: 500 }
      );
    }

    if (!deletedOption) {
      return NextResponse.json(
        { error: 'Insurance option not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Insurance option deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
