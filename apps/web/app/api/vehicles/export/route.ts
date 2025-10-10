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
    const model = searchParams.get('model') || '';
    const year = searchParams.get('year') || '';
    const branchId = searchParams.get('branch_id');

    let query = supabase
      .from('vehicles')
      .select(`
        *,
        make:vehicle_makes!make_id(name),
        color:vehicle_colors!color_id(name)
      `);

    // Filter by user_id for proper authentication
    query = query.eq('user_id', user.id);

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    if (search) {
      query = query.or(`plate_number.ilike.%${search}%,make_year.ilike.%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (model) {
      query = query.eq('make_year', model);
    }

    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        query = query.eq('year_of_manufacture', yearNum);
      }
    }

    const { data: vehicles, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      );
    }

    // Transform data for Excel export
    const excelData = (vehicles || []).map((vehicle: any) => ({
      'Plate Number': vehicle.plate_number,
      'Year': vehicle.year_of_manufacture?.toString() || 'N/A',
      'Model': vehicle.make_year || 'Unknown',
      'Make': vehicle.make?.name || 'Unknown',
      'Color': vehicle.color?.name || 'Unknown',
      'Status': 'Available', // Default status
      'Current KM': vehicle.mileage ? vehicle.mileage.toString() : '0',
      'Sale Price': vehicle.expected_sale_price ? `SAR ${vehicle.expected_sale_price.toLocaleString()}` : 'SAR 0',
      'Branch': vehicle.branch || 'N/A',
      'Created Date': vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Plate Number
      { wch: 8 },  // Year
      { wch: 15 }, // Model
      { wch: 15 }, // Make
      { wch: 12 }, // Color
      { wch: 12 }, // Status
      { wch: 12 }, // Current KM
      { wch: 15 }, // Sale Price
      { wch: 15 }, // Branch
      { wch: 15 }  // Created Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicles');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="vehicles_export_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return response;

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}