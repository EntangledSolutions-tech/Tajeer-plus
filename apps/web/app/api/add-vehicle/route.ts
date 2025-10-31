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
      documents,
      branch_id
    } = body;

    // Validate that branch_id is provided
    if (!branch_id) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Convert plate number and chassis number to uppercase
    const plateNumberUpper = vehicle.plateNumber?.toUpperCase();
    const chassisNumberUpper = vehicle.chassis_number?.toUpperCase();

    // Check if plate number already exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('plate_number')
      .eq('plate_number', plateNumberUpper)
      .single();

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Plate number already exists' },
        { status: 400 }
      );
    }

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking plate number:', checkError);
      return NextResponse.json(
        { error: 'Failed to validate plate number' },
        { status: 500 }
      );
    }

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

    // Fetch the "Available" status ID dynamically
    const { data: availableStatus, error: statusError } = await supabase
      .from('vehicle_statuses')
      .select('id')
      .eq('name', 'Available')
      .single();

    if (statusError || !availableStatus) {
      console.error('Error fetching Available status:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle status', details: statusError?.message },
        { status: 500 }
      );
    }

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
        age_range: depreciation.ageRange, // Moved to pricing step
        serial_number: vehicle.serialNumber,
        plate_number: plateNumberUpper,
        mileage: parseInt(vehicle.mileage) || 0,
        year_of_manufacture: null, // Field removed from form, set to null
        car_class: vehicle.carClass,
        plate_registration_type: vehicle.plateRegistrationType,
        expected_sale_price: Math.min(parseFloat(depreciation.expectedSalePrice) || 0, 99999999.99), // Moved to pricing step
        branch_id: branch_id, // From body root level

        // Additional vehicle fields
        chassis_number: chassisNumberUpper,
        vehicle_load_capacity: vehicle.vehicle_load_capacity,

        // Pricing details
        daily_rental_rate: Math.min(parseFloat(pricing.dailyRentalRate) || 0, 99999999.99),
        daily_minimum_rate: Math.min(parseFloat(pricing.dailyMinimumRate) || 0, 99999999.99),
        daily_permitted_km: parseInt(pricing.dailyPermittedKm) || 0,
        daily_excess_km_rate: Math.min(parseFloat(pricing.dailyExcessKmRate) || 0, 99999999.99),
        daily_open_km_rate: Math.min(parseFloat(pricing.dailyOpenKmRate) || 0, 99999999.99),
        monthly_rental_rate: Math.min(parseFloat(pricing.monthlyRentalRate) || 0, 99999999.99),
        monthly_minimum_rate: Math.min(parseFloat(pricing.monthlyMinimumRate) || 0, 99999999.99),
        monthly_permitted_km: parseInt(pricing.monthlyPermittedKm) || 0,
        monthly_excess_km_rate: Math.min(parseFloat(pricing.monthlyExcessKmRate) || 0, 99999999.99),
        monthly_open_km_rate: Math.min(parseFloat(pricing.monthlyOpenKmRate) || 0, 99999999.99),
        hourly_rental_rate: Math.min(parseFloat(pricing.hourlyRentalRate) || 0, 99999999.99),
        hourly_permitted_km: parseInt(pricing.hourlyPermittedKm) || 0,
        hourly_excess_km_rate: Math.min(parseFloat(pricing.hourlyExcessKmRate) || 0, 99999999.99),
        hourly_delay_rate: Math.min(parseFloat(pricing.hourlyDelayRate) || 0, 99999999.99),

        // Expiration dates
        form_license_expiration: parseDate(expirations.formLicenseExpiration),
        insurance_policy_expiration: parseDate(expirations.insurancePolicyExpiration),
        periodic_inspection_end: parseDate(expirations.periodicInspectionEnd),
        operating_card_expiration: parseDate(expirations.operatingCardExpiration),

        // Payment type
        payment_type: depreciation.paymentType || 'cash',

        // Vehicle pricing & depreciation (for cash payment)
        car_pricing: Math.min(parseFloat(depreciation.carPricing) || 0, 99999999.99),
        acquisition_date: parseDate(depreciation.acquisitionDate),
        operation_date: parseDate(depreciation.operationDate),
        depreciation_rate: Math.min(parseFloat(depreciation.depreciationRate) || 0, 100), // Max 100%
        depreciation_years: parseInt(depreciation.depreciationYears) || 0,

        // Lease-to-own fields
        installment_value: depreciation.paymentType === 'LeaseToOwn' ? Math.min(parseFloat(depreciation.installmentValue) || 0, 99999999.99) : null,
        interest_rate: depreciation.paymentType === 'LeaseToOwn' ? Math.min(parseFloat(depreciation.interestRate) || 0, 100) : null,
        total_price: depreciation.paymentType === 'LeaseToOwn' ? Math.min(parseFloat(depreciation.totalPrice) || 0, 99999999.99) : null,
        number_of_installments: depreciation.paymentType === 'LeaseToOwn' ? parseInt(depreciation.numberOfInstallments) || 0 : null,

        // Additional details
        status_id: availableStatus.id,
        owner_id: vehicle.ownerName,
        actual_user_id: vehicle.actualUser,
        insurance_policy_id: additional_details.insuranceType,
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