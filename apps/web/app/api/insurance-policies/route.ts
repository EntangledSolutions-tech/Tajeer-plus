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

    const { data: policies, error } = await (supabase as any)
      .from('insurance_policies')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch insurance policies', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        policies: policies || [],
        message: 'Insurance policies fetched successfully'
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
      policyNumber,
      policyAmount,
      deductiblePremium,
      policyType,
      policyCompany,
      expiryDate
    } = body;

    // Validate required fields
    if (!name || !policyNumber || !policyAmount || !deductiblePremium || !policyType || !policyCompany || !expiryDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Helper function to parse date
    const parseDate = (dateString: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

    // Check if policy number already exists
    const { data: existingPolicy } = await (supabase as any)
      .from('insurance_policies')
      .select('id')
      .eq('policy_number', policyNumber)
      .eq('is_active', true)
      .single();

    if (existingPolicy) {
      return NextResponse.json(
        { error: 'Policy number already exists' },
        { status: 409 }
      );
    }

    // Insert new policy
    const { data: newPolicy, error } = await (supabase as any)
      .from('insurance_policies')
      .insert({
        name,
        policy_number: policyNumber,
        policy_amount: parseFloat(policyAmount) || 0,
        deductible_premium: parseFloat(deductiblePremium) || 0,
        policy_type: policyType,
        policy_company: policyCompany,
        expiry_date: parseDate(expiryDate),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create insurance policy', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        policy: newPolicy,
        policy_id: newPolicy.id,
        message: 'Insurance policy created successfully'
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
