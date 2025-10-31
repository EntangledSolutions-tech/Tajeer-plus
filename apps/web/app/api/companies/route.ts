import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getAuthenticatedUser, getPaginationParams } from '../../../lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { page, limit, search, offset } = getPaginationParams(request);
    const branchId = new URL(request.url).searchParams.get('branch_id');

    // Build query
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id); // Filter by user

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    // Apply search filter
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,tax_number.ilike.%${search}%,commercial_registration_number.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Order by created_at descending (latest first)
    query = query.order('created_at', { ascending: false });

    // Apply pagination - only if limit is not -1
    if (limit !== -1) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    // Transform data to include mobile field (aliasing mobile_number)
    const transformedCompanies = companies?.map((company: any) => ({
      ...company,
      mobile: company.mobile_number
    })) || [];

    // Calculate pagination info
    const totalPages = limit === -1 ? 1 : Math.ceil((count || 0) / limit);
    const pagination = {
      page,
      limit,
      total: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return NextResponse.json({
      success: true,
      companies: transformedCompanies,
      pagination
    });

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
      company_name,
      tax_number,
      commercial_registration_number,
      mobile_number,
      email,
      country,
      city,
      address,
      license_number,
      license_type,
      license_expiry_date,
      establishment_date,
      authorized_person_name,
      authorized_person_id,
      authorized_person_email,
      authorized_person_mobile,
      rental_type,
      documents,
      branch_id
    } = body;

    // Validate required fields
    if (!company_name || !tax_number || !commercial_registration_number || !mobile_number || !email || !branch_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if tax number already exists
    const { data: existingTaxNumber, error: taxCheckError } = await supabase
      .from('companies')
      .select('tax_number')
      .eq('tax_number', tax_number)
      .single();

    if (existingTaxNumber) {
      return NextResponse.json(
        { error: 'Tax number already exists' },
        { status: 400 }
      );
    }

    if (taxCheckError && taxCheckError.code !== 'PGRST116') {
      console.error('Error checking tax number:', taxCheckError);
      return NextResponse.json(
        { error: 'Failed to validate tax number' },
        { status: 500 }
      );
    }

    // Check if commercial registration number already exists
    const { data: existingCRNumber, error: crCheckError } = await supabase
      .from('companies')
      .select('commercial_registration_number')
      .eq('commercial_registration_number', commercial_registration_number)
      .single();

    if (existingCRNumber) {
      return NextResponse.json(
        { error: 'Commercial registration number already exists' },
        { status: 400 }
      );
    }

    if (crCheckError && crCheckError.code !== 'PGRST116') {
      console.error('Error checking commercial registration number:', crCheckError);
      return NextResponse.json(
        { error: 'Failed to validate commercial registration number' },
        { status: 500 }
      );
    }

    // Helper function to convert string to date
    const parseDate = (dateString: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

    // Insert company data into the database
    const { data, error } = await supabase
      .from('companies')
      .insert({
        user_id: user.id,
        company_name,
        tax_number,
        commercial_registration_number,
        mobile_number,
        email,
        country,
        city,
        address,
        license_number,
        license_type,
        license_expiry_date: parseDate(license_expiry_date),
        establishment_date: parseDate(establishment_date),
        authorized_person_name,
        authorized_person_id,
        authorized_person_email,
        authorized_person_mobile,
        rental_type,
        branch_id,
        documents: documents || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save company data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        company: data,
        message: 'Company added successfully'
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
