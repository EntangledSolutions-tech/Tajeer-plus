import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

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
      vehicle,
      pricing,
      expirations,
      depreciation,
      additional_details,
      documents
    } = body;

    // Helper function to convert string to date
    const parseDate = (dateString: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

    // Ensure each document has a created_at property
    const documentsWithCreatedAt = (documents || []).map((doc: any) => ({
      ...doc,
      created_at: doc.created_at || new Date().toISOString(),
    }));

    // Insert vehicle data into the database
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        // Vehicle details - map form field names to database column names
        make_id: vehicle.make, // Form sends 'make' field with UUID value
        model_id: vehicle.model, // Form sends 'model' field with UUID value
        make_year: vehicle.makeYear,
        color_id: vehicle.color, // Form sends 'color' field with UUID value
        age_range: vehicle.ageRange,
        serial_number: vehicle.serialNumber,
        plate_number: vehicle.plateNumber,
        mileage: parseInt(vehicle.mileage) || 0,
        year_of_manufacture: vehicle.yearOfManufacture,
        car_class: vehicle.carClass,
        plate_registration_type: vehicle.plateRegistrationType,
        expected_sale_price: Math.min(parseFloat(vehicle.expectedSalePrice) || 0, 99999999.99),
        branch_id: vehicle.branch_id, // Form sends 'branch_id' field with UUID value

        // Pricing details
        daily_rental_rate: Math.min(parseFloat(pricing.dailyRentalRate) || 0, 99999999.99),
        daily_minimum_rate: Math.min(parseFloat(pricing.dailyMinimumRate) || 0, 99999999.99),
        daily_hourly_delay_rate: Math.min(parseFloat(pricing.dailyHourlyDelayRate) || 0, 99999999.99),
        daily_permitted_km: parseInt(pricing.dailyPermittedKm) || 0,
        daily_excess_km_rate: Math.min(parseFloat(pricing.dailyExcessKmRate) || 0, 99999999.99),
        daily_open_km_rate: Math.min(parseFloat(pricing.dailyOpenKmRate) || 0, 99999999.99),
        monthly_rental_rate: Math.min(parseFloat(pricing.monthlyRentalRate) || 0, 99999999.99),
        monthly_minimum_rate: Math.min(parseFloat(pricing.monthlyMinimumRate) || 0, 99999999.99),
        monthly_hourly_delay_rate: Math.min(parseFloat(pricing.monthlyHourlyDelayRate) || 0, 99999999.99),
        monthly_permitted_km: parseInt(pricing.monthlyPermittedKm) || 0,
        monthly_excess_km_rate: Math.min(parseFloat(pricing.monthlyExcessKmRate) || 0, 99999999.99),
        monthly_open_km_rate: Math.min(parseFloat(pricing.monthlyOpenKmRate) || 0, 99999999.99),
        hourly_rental_rate: Math.min(parseFloat(pricing.hourlyRentalRate) || 0, 99999999.99),
        hourly_permitted_km: parseInt(pricing.hourlyPermittedKm) || 0,
        hourly_excess_km_rate: Math.min(parseFloat(pricing.hourlyExcessKmRate) || 0, 99999999.99),

        // Expiration dates
        form_license_expiration: parseDate(expirations.formLicenseExpiration),
        insurance_policy_expiration: parseDate(expirations.insurancePolicyExpiration),
        periodic_inspection_end: parseDate(expirations.periodicInspectionEnd),
        operating_card_expiration: parseDate(expirations.operatingCardExpiration),

        // Vehicle pricing & depreciation
        car_pricing: Math.min(parseFloat(depreciation.carPricing) || 0, 99999999.99),
        acquisition_date: parseDate(depreciation.acquisitionDate),
        operation_date: parseDate(depreciation.operationDate),
        depreciation_rate: Math.min(parseFloat(depreciation.depreciationRate) || 0, 100), // Max 100%
        depreciation_years: parseInt(depreciation.depreciationYears) || 0,

        // Additional details
        status_id: additional_details.carStatus,
        owner_id: additional_details.ownerName,
        actual_user_id: additional_details.actualUser,
        insurance_policy_id: additional_details.insuranceType,
        chassis_number: additional_details.chassisNumber,
        insurance_value: Math.min(parseFloat(additional_details.insuranceValue) || 0, 99999999.99),

        // Documents (stored as JSON)
        documents: documentsWithCreatedAt,

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save vehicle data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        vehicle_id: data.id,
        message: 'Vehicle added successfully'
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