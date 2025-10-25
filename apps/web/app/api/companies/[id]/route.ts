import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@kit/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = params.id;
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');

    // Build the query
    let query = supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', user.id);

    // Add branch filter if provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: company, error } = await query.single();

    if (error) {
      console.error('Error fetching company:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
    }

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error('Error in GET /api/companies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = params.id;
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'companyName',
      'taxNumber',
      'commercialRegistrationNumber',
      'mobileNumber',
      'email',
      'country',
      'city',
      'address',
      'licenseNumber',
      'licenseType',
      'licenseExpiryDate',
      'establishmentDate',
      'authorizedPersonName',
      'authorizedPersonId',
      'authorizedPersonEmail',
      'authorizedPersonMobile',
      'rentalType'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check if company exists and belongs to user
    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id, user_id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingCompany) {
      return NextResponse.json({ error: 'Company not found or access denied' }, { status: 404 });
    }

    // Check for duplicate tax number (excluding current company)
    if (body.taxNumber) {
      const { data: taxCheck } = await supabase
        .from('companies')
        .select('id')
        .eq('tax_number', body.taxNumber)
        .neq('id', companyId)
        .single();

      if (taxCheck) {
        return NextResponse.json({ error: 'Tax Number already exists' }, { status: 400 });
      }
    }

    // Check for duplicate commercial registration number (excluding current company)
    if (body.commercialRegistrationNumber) {
      const { data: crCheck } = await supabase
        .from('companies')
        .select('id')
        .eq('commercial_registration_number', body.commercialRegistrationNumber)
        .neq('id', companyId)
        .single();

      if (crCheck) {
        return NextResponse.json({ error: 'Commercial Registration Number already exists' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {
      company_name: body.companyName,
      tax_number: body.taxNumber,
      commercial_registration_number: body.commercialRegistrationNumber,
      mobile_number: body.mobileNumber,
      email: body.email,
      country: body.country,
      city: body.city,
      address: body.address,
      license_number: body.licenseNumber,
      license_type: body.licenseType,
      license_expiry_date: body.licenseExpiryDate,
      establishment_date: body.establishmentDate,
      authorized_person_name: body.authorizedPersonName,
      authorized_person_id: body.authorizedPersonId,
      authorized_person_email: body.authorizedPersonEmail,
      authorized_person_mobile: body.authorizedPersonMobile,
      rental_type: body.rentalType,
      updated_at: new Date().toISOString()
    };

    // Update the company
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating company:', updateError);
      return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedCompany });
  } catch (error) {
    console.error('Error in PUT /api/companies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = params.id;

    // Check if company exists and belongs to user
    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id, user_id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingCompany) {
      return NextResponse.json({ error: 'Company not found or access denied' }, { status: 404 });
    }

    // Delete the company
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting company:', deleteError);
      return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/companies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
