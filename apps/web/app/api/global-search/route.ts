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
        .or(`
          plate_number.ilike.${searchTerm},
          serial_number.ilike.${searchTerm},
          make_year.ilike.${searchTerm}
        `)
        .limit(limit);

      if (!vehicleError && vehicles) {
        // Also search by make, model, color, status names
        const [makeResults, modelResults, colorResults, statusResults] = await Promise.all([
          supabase.from('vehicle_makes').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_models').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_colors').select('id').ilike('name', searchTerm),
          supabase.from('vehicle_statuses').select('id').ilike('name', searchTerm)
        ]);

        const makeIds = makeResults.data?.map(m => m.id) || [];
        const modelIds = modelResults.data?.map(m => m.id) || [];
        const colorIds = colorResults.data?.map(c => c.id) || [];
        const statusIds = statusResults.data?.map(s => s.id) || [];

        if (makeIds.length > 0 || modelIds.length > 0 || colorIds.length > 0 || statusIds.length > 0) {
          const { data: additionalVehicles, error: additionalError } = await supabase
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
              ...(colorIds.length > 0 ? [`color_id.in.(${colorIds.join(',')})`] : []),
              ...(statusIds.length > 0 ? [`status_id.in.(${statusIds.join(',')})`] : [])
            ].join(','))
            .limit(limit);

          if (!additionalError && additionalVehicles) {
            vehicleResults = [...vehicles, ...additionalVehicles].slice(0, limit);
          } else {
            vehicleResults = vehicles;
          }
        } else {
          vehicleResults = vehicles;
        }

        vehicleResults = vehicleResults.map(vehicle => ({
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
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          mobile_number,
          id_number,
          classification:customer_classifications(classification),
          status:customer_statuses(name)
        `)
        .or(`
          name.ilike.${searchTerm},
          mobile_number.ilike.${searchTerm},
          id_number.ilike.${searchTerm}
        `)
        .limit(limit);

      if (!customerError && customers) {
        customerResults = customers.map(customer => ({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: `${customer.mobile_number || 'N/A'} • ${customer.id_number || 'N/A'}`,
          badge: 'Customer',
          badgeColor: 'bg-green-100 text-green-800',
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
          status_id,
          status:contract_statuses(name, color)
        `)
        .or(`
          contract_number.ilike.${searchTerm},
          tajeer_number.ilike.${searchTerm},
          customer_name.ilike.${searchTerm},
          vehicle_plate.ilike.${searchTerm}
        `)
        .limit(limit);

      if (!contractError && contracts) {
        contractResults = contracts.map(contract => ({
          id: contract.id,
          type: 'contract',
          title: contract.contract_number || contract.tajeer_number || `Contract #${contract.id.slice(-6)}`,
          subtitle: contract.customer_name,
          badge: 'Contract',
          badgeColor: 'bg-purple-100 text-purple-800',
          status: contract.status,
          data: contract
        }));
      }
    }

    const allResults = [...vehicleResults, ...customerResults, ...contractResults];
    const totalResults = allResults.length;

    return NextResponse.json({
      success: true,
      results: {
        vehicles: vehicleResults,
        customers: customerResults,
        contracts: contractResults
      },
      allResults: allResults.slice(0, limit),
      totalResults,
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
