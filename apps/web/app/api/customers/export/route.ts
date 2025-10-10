import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import * as XLSX from 'xlsx';

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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const classification = searchParams.get('classification') || 'all';
    const blacklisted = searchParams.get('blacklisted') === 'true';
    const branchId = searchParams.get('branch_id');

    let query = supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id); // Filter by authenticated user

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,id_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
    }
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (classification !== 'all') {
      query = query.eq('classification', classification);
    }
    if (blacklisted) {
      query = query.eq('status', 'Blacklisted');
    }

    const { data: customers, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    // Transform data for Excel export
    const excelData = (customers || []).map((customer: any) => ({
      'Name': customer.name || 'N/A',
      'ID Number': customer.id_number || 'N/A',
      'ID Type': customer.id_type || 'N/A',
      'Classification': customer.classification || 'N/A',
      'License Type': customer.license_type || 'N/A',
      'Date of Birth': customer.date_of_birth || 'N/A',
      'Address': customer.address || 'N/A',
      'Mobile Number': customer.mobile_number || 'N/A',
      'Nationality': customer.nationality || 'N/A',
      'Status': customer.status || 'N/A',
      'Created Date': customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 15 }, // ID Number
      { wch: 12 }, // ID Type
      { wch: 15 }, // Classification
      { wch: 15 }, // License Type
      { wch: 12 }, // Date of Birth
      { wch: 30 }, // Address
      { wch: 15 }, // Mobile Number
      { wch: 12 }, // Nationality
      { wch: 10 }, // Status
      { wch: 15 }  // Created Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', 'attachment; filename="customers.xlsx"');

    return response;

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}