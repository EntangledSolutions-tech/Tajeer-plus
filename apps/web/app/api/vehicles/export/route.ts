import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import ExcelJS from 'exceljs';

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

    // Query with all related data (similar to main vehicles endpoint)
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        make:vehicle_makes!make_id(name),
        model:vehicle_models!model_id(name),
        color:vehicle_colors!color_id(name, hex_code),
        status:vehicle_statuses!status_id(name, color),
        owner:vehicle_owners!owner_id(name, code),
        actual_user:vehicle_actual_users!actual_user_id(name, code),
        branch:branches!branch_id(name, code, address, phone, email)
      `);

    // Filter by user_id for proper authentication
    query = query.eq('user_id', user.id);

    // Filter by branch if branch_id is provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    // Apply search filter
    if (search) {
      query = query.or(`plate_number.ilike.%${search}%,serial_number.ilike.%${search}%`);
    }

    // Apply status filter (using status_id instead of status)
    if (status !== 'all') {
      // Convert status name to lowercase with underscores and query status table
      const { data: statusData } = await supabase
        .from('vehicle_statuses')
        .select('id')
        .ilike('name', status.replace(/_/g, ' '))
        .single();

      if (statusData) {
        query = query.eq('status_id', statusData.id);
      }
    }

    if (model) {
      query = query.eq('model_id', model);
    }

    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        query = query.eq('year_of_manufacture', yearNum);
      }
    }

    // Fetch ALL vehicles (no limit)
    const { data: vehicles, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      );
    }

    // Create workbook and worksheet with ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicles');

    // Define columns with headers
    worksheet.columns = [
      { header: 'Plate Number', key: 'plateNumber', width: 15 },
      { header: 'Serial Number', key: 'serialNumber', width: 20 },
      { header: 'Year', key: 'year', width: 8 },
      { header: 'Make Year', key: 'makeYear', width: 12 },
      { header: 'Make', key: 'make', width: 15 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'Color', key: 'color', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Current KM', key: 'currentKm', width: 12 },
      { header: 'Daily Rental Rate', key: 'dailyRate', width: 18 },
      { header: 'Monthly Rental Rate', key: 'monthlyRate', width: 18 },
      { header: 'Sale Price', key: 'salePrice', width: 15 },
      { header: 'Owner', key: 'owner', width: 20 },
      { header: 'Actual User', key: 'actualUser', width: 20 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Car Class', key: 'carClass', width: 12 },
      { header: 'Plate Type', key: 'plateType', width: 15 },
      { header: 'Created Date', key: 'createdDate', width: 15 }
    ];

    // Style the header row (bold with primary color background)
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' } // Primary color
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 25;

    // Helper function to convert hex to ARGB
    const hexToArgb = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      return 'FF' + cleanHex; // Add full opacity
    };

    // Add data rows
    vehicles.forEach((vehicle: any) => {
      const row = worksheet.addRow({
        plateNumber: vehicle.plate_number,
        serialNumber: vehicle.serial_number || 'N/A',
        year: vehicle.year_of_manufacture?.toString() || 'N/A',
        makeYear: vehicle.make_year || 'N/A',
        make: vehicle.make?.name || 'Unknown',
        model: vehicle.model?.name || 'Unknown',
        color: vehicle.color?.name || 'Unknown',
        status: vehicle.status?.name || 'Unknown',
        currentKm: vehicle.mileage ? vehicle.mileage.toLocaleString() : '0',
        dailyRate: vehicle.daily_rental_rate ? `SAR ${vehicle.daily_rental_rate.toLocaleString()}` : 'SAR 0',
        monthlyRate: vehicle.monthly_rental_rate ? `SAR ${vehicle.monthly_rental_rate.toLocaleString()}` : 'SAR 0',
        salePrice: vehicle.expected_sale_price ? `SAR ${vehicle.expected_sale_price.toLocaleString()}` : 'SAR 0',
        owner: vehicle.owner?.name || 'N/A',
        actualUser: vehicle.actual_user?.name || 'N/A',
        branch: vehicle.branch?.name || 'N/A',
        carClass: vehicle.car_class || 'N/A',
        plateType: vehicle.plate_registration_type || 'N/A',
        createdDate: vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'
      });

      // Apply status color to the Status column (column 8) - text color only
      if (vehicle?.status?.color) {
        const statusCell = row.getCell(8);
        statusCell.font = {
          color: { argb: hexToArgb(vehicle.status.color) },
          bold: true
        };
        statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    // Generate Excel file buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Format filename with complete date and time: DD_MM_YYYY__HH_mm_ss
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const fullYear = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const filename = `vehicles_export_${day}_${month}_${fullYear}__${hours}_${minutes}_${seconds}.xlsx`;

    // Create response with Excel file
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return response;

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}