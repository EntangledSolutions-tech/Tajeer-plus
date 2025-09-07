import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(
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

    const { data: policy, error } = await (supabase as any)
      .from('insurance_policies')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Insurance policy not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        policy,
        message: 'Insurance policy fetched successfully'
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

    // Check if policy number already exists for a different policy
    const { data: existingPolicy } = await (supabase as any)
      .from('insurance_policies')
      .select('id')
      .eq('policy_number', policyNumber)
      .neq('id', id)
      .eq('is_active', true)
      .single();

    if (existingPolicy) {
      return NextResponse.json(
        { error: 'Policy number already exists' },
        { status: 409 }
      );
    }

    // Update the policy
    const { data: updatedPolicy, error } = await (supabase as any)
      .from('insurance_policies')
      .update({
        name,
        policy_number: policyNumber,
        policy_amount: parseFloat(policyAmount) || 0,
        deductible_premium: parseFloat(deductiblePremium) || 0,
        policy_type: policyType,
        policy_company: policyCompany,
        expiry_date: parseDate(expiryDate),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update insurance policy', details: error.message },
        { status: 500 }
      );
    }

    if (!updatedPolicy) {
      return NextResponse.json(
        { error: 'Insurance policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        policy: updatedPolicy,
        message: 'Insurance policy updated successfully'
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
    const { data: deletedPolicy, error } = await (supabase as any)
      .from('insurance_policies')
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
        { error: 'Failed to delete insurance policy', details: error.message },
        { status: 500 }
      );
    }

    if (!deletedPolicy) {
      return NextResponse.json(
        { error: 'Insurance policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Insurance policy deleted successfully'
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
