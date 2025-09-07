import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
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

    const { data: insuranceOptions, error } = await (supabase as any)
      .from('insurance_options')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch insurance options', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        insuranceOptions: insuranceOptions || [],
        message: 'Insurance options fetched successfully'
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

export async function POST(request: NextRequest) {
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
    const insertData: any = {
      name,
      deductible_premium: parseFloat(deductiblePremium) || 0,
      rental_increase_type: rentalIncreaseType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (rentalIncreaseType === 'value') {
      insertData.rental_increase_value = parseFloat(rentalIncreaseValue) || 0;
      insertData.rental_increase_percentage = null;
    } else {
      insertData.rental_increase_percentage = parseFloat(rentalIncreaseValue) || 0;
      insertData.rental_increase_value = null;
    }

    // Insert new insurance option
    const { data: newOption, error } = await (supabase as any)
      .from('insurance_options')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create insurance option', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        insuranceOption: newOption,
        option_id: newOption.id,
        message: 'Insurance option created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
