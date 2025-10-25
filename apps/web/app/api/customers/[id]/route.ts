import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getAuthenticatedUser, updateUserRecord, deleteUserRecord } from '../../../../lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: customerId } = await params;

    // Get branch_id from query params for validation
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');

    // Fetch customer details with related data
    let query = supabase
      .from('customers')
      .select(`
        *,
        classification:customer_classifications(classification),
        license_type:customer_license_types(license_type),
        nationality:customer_nationalities(nationality),
        status:customer_statuses(name, color)
      `)
      .eq('id', customerId)
      .eq('user_id', user.id); // Filter by user

    // Also filter by branch_id if provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: customer, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found or access denied', code: 'UNAUTHORIZED_ACCESS' },
          { status: 403 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: customerId } = await params;
    const body = await request.json();

    // Map field names from camelCase to snake_case for database
    const customerData: any = { ...body };

    // Handle GCC-specific field mappings
    if (body.id_type === 'GCC Countries Citizens' || body.idType === 'GCC Countries Citizens') {
      if (body.nationalOrGccIdNumber) {
        customerData.gcc_id_number = body.nationalOrGccIdNumber;
        delete customerData.nationalOrGccIdNumber;
      }
      if (body.idCopyNumber !== undefined) {
        customerData.id_copy_number = body.idCopyNumber;
        delete customerData.idCopyNumber;
      }
      if (body.licenseNumber) {
        customerData.license_number = body.licenseNumber;
        delete customerData.licenseNumber;
      }
      if (body.idExpiryDate) {
        customerData.id_expiry_date = body.idExpiryDate;
        delete customerData.idExpiryDate;
      }
      if (body.licenseExpiryDate) {
        customerData.license_expiry_date = body.licenseExpiryDate;
        delete customerData.licenseExpiryDate;
      }
      if (body.licenseType) {
        customerData.license_type = body.licenseType;
        delete customerData.licenseType;
      }
      if (body.placeOfIdIssue) {
        customerData.place_of_id_issue = body.placeOfIdIssue;
        delete customerData.placeOfIdIssue;
      }
      if (body.rentalType) {
        customerData.rental_type = body.rentalType;
        delete customerData.rentalType;
      }
    }

    // Update customer with user ownership validation
    const { data: updatedCustomer, error } = await updateUserRecord(
      supabase,
      'customers',
      customerId,
      customerData,
      user.id
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }

    return NextResponse.json(updatedCustomer);

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: customerId } = await params;

    // Delete customer with user ownership validation
    const { error } = await deleteUserRecord(
      supabase,
      'customers',
      customerId,
      user.id
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}