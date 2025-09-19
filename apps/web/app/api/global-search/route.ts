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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '3');
    const type = searchParams.get('type') || 'all'; // all, vehicles, customers, contracts

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        results: {
          vehicles: [],
          customers: [],
          contracts: []
        },
        totalResults: 0
      });
    }

    const searchTerm = `%${query}%`;

    // Search vehicles
    let vehicleResults: any[] = [];
    if (type === 'all' || type === 'vehicles') {
      // First search by direct vehicle fields
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          id,
          plate_number,
          serial_number,
          make_year,
          make:vehicle_makes!make_id(name),
          model:vehicle_models!model_id(name),
          color:vehicle_colors!color_id(name),
          status:vehicle_statuses!status_id(name)
        `)
        .eq('user_id', user.id)
        .or(`plate_number.ilike.${searchTerm},serial_number.ilike.${searchTerm}`)
        .limit(limit);

      if (!vehicleError && vehicles) {
        // Also search by make, model, color names
        const [makeResults, modelResults, colorResults] = await Promise.all([
          supabase.from('vehicle_makes').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_models').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_colors').select('id').ilike('name', searchTerm)
        ]);

        const makeIds = makeResults.data?.map(m => m.id) || [];
        const modelIds = modelResults.data?.map(m => m.id) || [];
        const colorIds = colorResults.data?.map(c => c.id) || [];

        let additionalVehicles: any[] = [];

        if (makeIds.length > 0 || modelIds.length > 0 || colorIds.length > 0) {
          const { data: additionalVehiclesData, error: additionalError } = await supabase
            .from('vehicles')
            .select(`
              id,
              plate_number,
              serial_number,
              make_year,
              make:vehicle_makes!make_id(name),
              model:vehicle_models!model_id(name),
              color:vehicle_colors!color_id(name),
              status:vehicle_statuses!status_id(name)
            `)
            .eq('user_id', user.id)
            .or([
              ...(makeIds.length > 0 ? [`make_id.in.(${makeIds.join(',')})`] : []),
              ...(modelIds.length > 0 ? [`model_id.in.(${modelIds.join(',')})`] : []),
              ...(colorIds.length > 0 ? [`color_id.in.(${colorIds.join(',')})`] : [])
            ].join(','))
            .limit(limit);

          if (!additionalError && additionalVehiclesData) {
            additionalVehicles = additionalVehiclesData;
          }
        }

        // Combine and deduplicate results
        const allVehicleResults = [...vehicles, ...additionalVehicles];
        const uniqueVehicles = allVehicleResults.filter((vehicle, index, self) =>
          index === self.findIndex(v => v.id === vehicle.id)
        ).slice(0, limit);

        vehicleResults = uniqueVehicles.map(vehicle => ({
          id: vehicle.id,
          type: 'vehicle',
          title: vehicle.plate_number,
          subtitle: `${vehicle.make?.name || 'N/A'} ${vehicle.model?.name || 'N/A'} • ${vehicle.make_year || 'N/A'}`,
          badge: 'Vehicle',
          badgeColor: 'bg-blue-100 text-blue-800',
          data: vehicle
        }));
      }
    }

    // Search customers
    let customerResults: any[] = [];
    if (type === 'all' || type === 'customers') {
      console.log('🔍 Searching customers with term:', searchTerm);

      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          mobile_number,
          id_number,
          address,
          classification:customer_classifications(classification),
          status:customer_statuses(name)
        `)
        .or(`name.ilike.${searchTerm},mobile_number.ilike.${searchTerm},id_number.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .limit(limit);

      console.log('👤 Customer search results:', {
        customers: customers?.length || 0,
        error: customerError,
        searchTerm,
        customersData: customers,
        query: `name.ilike.${searchTerm},mobile_number.ilike.${searchTerm},id_number.ilike.${searchTerm},address.ilike.${searchTerm}`
      });

      if (!customerError && customers) {
        customerResults = customers.map(customer => ({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: `${customer.mobile_number || 'N/A'} • ${customer.classification?.classification || 'N/A'}`,
          badge: 'Customer',
          badgeColor: 'bg-green-100 text-green-800',
          status: customer.status,
          data: customer
        }));
      }
    }

    // Search contracts
    let contractResults: any[] = [];
    if (type === 'all' || type === 'contracts') {
      const { data: contracts, error: contractError } = await supabase
        .from('contracts')
        .select(`
          id,
          contract_number,
          tajeer_number,
          customer_name,
          vehicle_plate,
          vehicle_serial_number
        `)
        .or(`contract_number.ilike.${searchTerm},tajeer_number.ilike.${searchTerm},customer_name.ilike.${searchTerm},vehicle_plate.ilike.${searchTerm},vehicle_serial_number.ilike.${searchTerm}`)
        .limit(limit);

      if (!contractError && contracts) {
        contractResults = contracts.map(contract => ({
          id: contract.id,
          type: 'contract',
          title: contract.contract_number || contract.tajeer_number || `Contract #${contract.id.slice(-6)}`,
          subtitle: `${contract.customer_name} • ${contract.vehicle_plate || 'N/A'}`,
          badge: 'Contract',
          badgeColor: 'bg-purple-100 text-purple-800',
          status: { name: contract.status, color: '#6B7280' },
          data: contract
        }));
      }
    }

    const allResults = [...vehicleResults, ...customerResults, ...contractResults];
    const totalResults = allResults.length;
    const limitedResults = allResults.slice(0, limit);

    return NextResponse.json({
      success: true,
      results: {
        vehicles: vehicleResults,
        customers: customerResults,
        contracts: contractResults
      },
      allResults: limitedResults,
      totalResults,
      hasMoreResults: totalResults > limit,
      query
    });

  } catch (error) {
    console.error('Global search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
