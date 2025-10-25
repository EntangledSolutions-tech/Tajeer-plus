'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { useParams } from 'next/navigation';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';
import CustomButton from '../../reusableComponents/CustomButton';
import { useHttpService } from '../../../lib/http-service';

interface Vehicle {
  id: string;
  serial_number: string;
  plate_number: string;
  plate_registration_type: string;
  make_year: string;
  make: { name: string } | string;
  model: { name: string } | string;
  color: { name: string; hex_code?: string } | string;
  status: { name: string; color?: string } | string;
  owner: { name: string; code: string } | string;
  actual_user: { name: string; code: string } | string;
  mileage: number;
  expected_sale_price: number;
  branch: { name: string; code: string; address?: string; phone?: string; email?: string } | string;
  daily_rental_rate: number;
  daily_minimum_rate: number;
  daily_hourly_delay_rate: number;
  daily_permitted_km: number;
  daily_excess_km_rate: number;
  daily_open_km_rate: number;
  monthly_rental_rate: number;
  monthly_minimum_rate: number;
  monthly_hourly_delay_rate: number;
  monthly_permitted_km: number;
  monthly_excess_km_rate: number;
  monthly_open_km_rate: number;
  hourly_rental_rate: number;
  hourly_permitted_km: number;
  hourly_excess_km_rate: number;
  car_pricing: number;
  acquisition_date: string;
  operation_date: string;
  depreciation_rate: number;
  depreciation_years: number;
  chassis_number: string;
  insurance_value: number;
  owner_id: string;
  actual_user_id: string;
  vehicle_load_capacity: number;
  insurance_policy: {
    policy_company: string;
    policy_type: string;
    policy_number: string;
    deductible_premium: number;
    policy_amount: number;
  } | null;
}

export default function VehicleOverview() {
  const params = useParams();
  const vehicleId = params?.id as string;

  // Data and loading states
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getRequest, postRequest, putRequest } = useHttpService();

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!vehicleId) {
          throw new Error('Vehicle ID not found');
        }

        // Check if vehicleId is a UUID (vehicle ID) or plate number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicleId);

        let actualVehicleId = vehicleId;

        if (!isUUID) {
          // If it's not a UUID, treat it as a plate number and fetch the vehicle ID
          const vehicleResponse = await getRequest(`/api/vehicles?plate_number=${vehicleId}`);

          if (vehicleResponse.success && vehicleResponse.data) {
            // Handle the API response format
            let vehicleData;
            if (Array.isArray(vehicleResponse.data)) {
              vehicleData = vehicleResponse.data;
            } else if (vehicleResponse.data.vehicles && Array.isArray(vehicleResponse.data.vehicles)) {
              vehicleData = vehicleResponse.data.vehicles;
            } else {
              throw new Error('Unexpected vehicle response format');
            }

            if (!vehicleData || !Array.isArray(vehicleData) || vehicleData.length === 0) {
              throw new Error(`Vehicle not found for plate number: ${vehicleId}`);
            }

            const foundVehicleId = vehicleData[0]?.id;
            if (!foundVehicleId) {
              throw new Error('Vehicle ID not found in response');
            }

            actualVehicleId = foundVehicleId;
          } else {
            throw new Error(vehicleResponse.error || 'Failed to fetch vehicle data');
          }
        }

        // Fetch vehicle details
        const response = await getRequest(`/api/vehicles/${actualVehicleId}`);

        if (response.success && response.data) {
          setVehicle(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicle data');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mx-4 mt-4">
          No vehicle data found
        </div>
      </div>
    );
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString()}`;
  };

  // Helper function to format number
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Helper function to extract value from joined data
  const getValue = (field: any, defaultValue: string = '-') => {

    try {
      if (!field) return defaultValue;
      if (typeof field === 'string') return field;
      if (typeof field === 'object' && field.name) return field.name;
      if (typeof field === 'object' && field.color && typeof field.color === 'string') return field.color;
      if (typeof field === 'object') {
        // For any other object, try to find a meaningful string value
        const values = Object.values(field).filter(v => typeof v === 'string');
        if (values.length > 0) return values[0];
        // If no string values found, return default
        console.warn('Object field with no string values:', field);
        return defaultValue;
      }
      return String(field);
    } catch (error) {
      console.error('Error in getValue:', error, 'Field:', field);
      return defaultValue;
    }
  };

  // Helper function to extract color hex code
  const getColorHex = (color: any) => {
    if (!color) return null;
    if (typeof color === 'object' && color.hex_code) return color.hex_code;
    return null;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-none">
          {/* Vehicle Details */}
          <CollapsibleSection
            title="Vehicle details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Serial Number</div>
                <div className="font-bold text-primary text-base">{vehicle.serial_number || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Plate</div>
                <div className="font-bold text-primary text-base">{vehicle.plate_number || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Plate registration type</div>
                <div className="font-bold text-primary text-base">{vehicle.plate_registration_type || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Year</div>
                <div className="font-bold text-primary text-base">{vehicle.make_year || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Make</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.make))}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Model</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.model))}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Color</div>
                <div className="font-bold text-primary text-base">
                  <div className="flex items-center gap-2">
                    {getColorHex(vehicle.color) && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorHex(vehicle.color) }}
                      />
                    )}
                    <span>{String(getValue(vehicle.color))}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Status</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.status))}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Mileage (in km)</div>
                <div className="font-bold text-primary text-base">{vehicle.mileage !== null && vehicle.mileage !== undefined ? formatNumber(vehicle.mileage) : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Car Pricing</div>
                <div className="font-bold text-primary text-base">{vehicle.car_pricing !== null && vehicle.car_pricing !== undefined ? formatCurrency(vehicle.car_pricing) : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Acquisition Date</div>
                <div className="font-bold text-primary text-base">{formatDate(vehicle.acquisition_date)}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Operation Date</div>
                <div className="font-bold text-primary text-base">{formatDate(vehicle.operation_date)}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Depreciation Rate</div>
                <div className="font-bold text-primary text-base">{vehicle.depreciation_rate !== null && vehicle.depreciation_rate !== undefined ? `${vehicle.depreciation_rate}%` : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Depreciation Years</div>
                <div className="font-bold text-primary text-base">{vehicle.depreciation_years !== null && vehicle.depreciation_years !== undefined ? vehicle.depreciation_years : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Expected Sale Price</div>
                <div className="font-bold text-primary text-base">{vehicle.expected_sale_price !== null && vehicle.expected_sale_price !== undefined ? formatCurrency(vehicle.expected_sale_price) : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Branch</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.branch))}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Chassis Number</div>
                <div className="font-bold text-primary text-base">{vehicle.chassis_number || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Vehicle Load Capacity</div>
                <div className="font-bold text-primary text-base">{vehicle.vehicle_load_capacity !== null && vehicle.vehicle_load_capacity !== undefined ? vehicle.vehicle_load_capacity : '-'}</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Pricing */}
          <CollapsibleSection
            title="Pricing"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="flex flex-col gap-4">
              {/* Daily rent */}
              <div>
                <div className="font-bold text-primary text-base mb-2">Daily rent</div>
                <div className="grid grid-cols-6 gap-4 text-base">
                  <div><span className="text-sm text-primary font-medium">Daily rental rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.daily_rental_rate !== null && vehicle.daily_rental_rate !== undefined ? formatCurrency(vehicle.daily_rental_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Minimum rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.daily_minimum_rate !== null && vehicle.daily_minimum_rate !== undefined ? formatCurrency(vehicle.daily_minimum_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Hourly delay rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.daily_hourly_delay_rate !== null && vehicle.daily_hourly_delay_rate !== undefined ? formatCurrency(vehicle.daily_hourly_delay_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Permitted daily km</span><br /><span className="text-lg text-primary font-bold">{vehicle.daily_permitted_km !== null && vehicle.daily_permitted_km !== undefined ? formatNumber(vehicle.daily_permitted_km) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Excess km rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.daily_excess_km_rate !== null && vehicle.daily_excess_km_rate !== undefined ? formatCurrency(vehicle.daily_excess_km_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Open km rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.daily_open_km_rate !== null && vehicle.daily_open_km_rate !== undefined ? formatCurrency(vehicle.daily_open_km_rate) : '-'}</span></div>
                </div>
              </div>
              <div className="border-t border-primary my-2" />
              {/* Monthly rent */}
              <div>
                <div className="font-bold text-primary text-base mb-2">Monthly rent</div>
                <div className="grid grid-cols-6 gap-4 text-base">
                  <div><span className="text-sm text-primary font-medium">Monthly rental rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.monthly_rental_rate !== null && vehicle.monthly_rental_rate !== undefined ? formatCurrency(vehicle.monthly_rental_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Minimum rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.monthly_minimum_rate !== null && vehicle.monthly_minimum_rate !== undefined ? formatCurrency(vehicle.monthly_minimum_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Hourly delay rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.monthly_hourly_delay_rate !== null && vehicle.monthly_hourly_delay_rate !== undefined ? formatCurrency(vehicle.monthly_hourly_delay_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Permitted daily km</span><br /><span className="text-lg text-primary font-bold">{vehicle.monthly_permitted_km !== null && vehicle.monthly_permitted_km !== undefined ? formatNumber(vehicle.monthly_permitted_km) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Excess km rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.monthly_excess_km_rate !== null && vehicle.monthly_excess_km_rate !== undefined ? formatCurrency(vehicle.monthly_excess_km_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Open km rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.monthly_open_km_rate !== null && vehicle.monthly_open_km_rate !== undefined ? formatCurrency(vehicle.monthly_open_km_rate) : '-'}</span></div>
                </div>
              </div>
              <div className="border-t border-primary my-2" />
              {/* Hourly rent */}
              <div>
                <div className="font-bold text-primary text-base mb-2">Hourly rent</div>
                <div className="grid grid-cols-6 gap-4 text-base">
                  <div><span className="text-sm text-primary font-medium">Hourly rental rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.hourly_rental_rate !== null && vehicle.hourly_rental_rate !== undefined ? formatCurrency(vehicle.hourly_rental_rate) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Permitted km per hour</span><br /><span className="text-lg text-primary font-bold">{vehicle.hourly_permitted_km !== null && vehicle.hourly_permitted_km !== undefined ? formatNumber(vehicle.hourly_permitted_km) : '-'}</span></div>
                  <div><span className="text-sm text-primary font-medium">Excess km rate</span><br /><span className="text-lg text-primary font-bold">{vehicle.hourly_excess_km_rate !== null && vehicle.hourly_excess_km_rate !== undefined ? formatCurrency(vehicle.hourly_excess_km_rate) : '-'}</span></div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Legal & Access Details */}
          <CollapsibleSection
            title="Legal & Access Details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            {/* Legal Details */}
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base mb-6">
              <div>
                <div className="text-sm text-primary font-medium">Car Status</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.status))}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Owner's Name</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.owner)) || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Owner ID</div>
                <div className="font-bold text-primary text-base">{(typeof vehicle.owner === 'object' ? vehicle.owner?.code : '-') || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Actual User</div>
                <div className="font-bold text-primary text-base">{String(getValue(vehicle.actual_user)) || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">User ID</div>
                <div className="font-bold text-primary text-base">{(typeof vehicle.actual_user === 'object' ? vehicle.actual_user?.code : '-') || '-'}</div>
              </div>
            </div>

            {/* Insurance Subsection */}
            <div className="border-t border-primary pt-4">
              <div className="font-bold text-primary text-base mb-4">Insurance</div>
              <div className="grid grid-cols-3 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Insurance Company</div>
                  <div className="font-bold text-primary text-base">{vehicle.insurance_policy?.policy_company || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Type</div>
                  <div className="font-bold text-primary text-base">{vehicle.insurance_policy?.policy_type || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Policy Number</div>
                  <div className="font-bold text-primary text-base">{vehicle.insurance_policy?.policy_number || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Insurance Value</div>
                  <div className="font-bold text-primary text-base">{vehicle.insurance_value !== null && vehicle.insurance_value !== undefined ? formatCurrency(vehicle.insurance_value) : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Deductible Premium</div>
                  <div className="font-bold text-primary text-base">{vehicle.insurance_policy?.deductible_premium !== null && vehicle.insurance_policy?.deductible_premium !== undefined ? formatCurrency(vehicle.insurance_policy.deductible_premium) : '-'}</div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}