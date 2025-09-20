import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { Car, Calendar, Palette, MapPin, Fuel, Gauge } from 'lucide-react';
import { useHttpService } from '../../../../lib/http-service';

interface Vehicle {
  id: string;
  plate_number: string;
  serial_number: string;
  plate_registration_type: string;
  make_year: string;
  model: string;
  make: string;
  color: string;
  mileage: number;
  status: string;
  availability?: string;
}

export default function VehicleDetailsStep() {
  const formik = useFormikContext<any>();
  const { getRequest } = useHttpService();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Fetch vehicles from API
  const fetchVehicles = async (query: string) => {
    if (!query.trim()) {
      setVehicles([]);
      setSearchInitiated(false);
      return;
    }

    try {
      setLoading(true);
      setSearchInitiated(true);

      // Build query parameters - search across all vehicle fields
      const params = new URLSearchParams({
        search: query,
        limit: '50', // Increased limit for better search results
        page: '1'
      });

      const response = await getRequest(`/api/vehicles?${params}`);
      if (response.success && response.data) {
        console.log('Vehicles API response:', response.data); // Debug log

        // Filter only available vehicles and map to expected format
        const availableVehicles = response.data.vehicles
          .filter((vehicle: any) =>
            vehicle.status?.name === 'Available' ||
            vehicle.status?.name === 'Active' ||
            !vehicle.status
          )
          .map((vehicle: any) => ({
            id: vehicle.id,
            plate_number: vehicle.plate_number || 'N/A',
            serial_number: vehicle.serial_number || 'N/A',
            plate_registration_type: vehicle.plate_registration_type || 'Private',
            make_year: vehicle.make_year || vehicle.year_of_manufacture || 'N/A',
            model: vehicle.model?.name || 'N/A',
            make: vehicle.make?.name || 'N/A',
            color: vehicle.color?.name || 'N/A',
            mileage: vehicle.mileage || 0,
            status: vehicle.status?.name || 'Available'
          }));
        setVehicles(availableVehicles);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchInitiated(true);
      const timeoutId = setTimeout(() => {
        fetchVehicles(searchTerm);
      }, 300); // Reduced debounce time for better responsiveness

      return () => clearTimeout(timeoutId);
    } else {
      setVehicles([]);
      setSearchInitiated(false);
      setSelectedVehicle(null);
    }
  }, [searchTerm]);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    // Update Formik values
    formik.setFieldValue('selectedVehicleId', vehicle.id);
    formik.setFieldValue('vehiclePlate', vehicle.plate_number);
    formik.setFieldValue('vehicleSerialNumber', vehicle.serial_number);
    // Trigger validation to enable continue button
    setTimeout(() => formik.validateForm(), 100);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Vehicle Details
      </h2>
      <p className="text-primary/70 mb-8">
        Search and select a vehicle for this contract. You can search by make, model, color, plate number, or serial number.
      </p>

      {/* Vehicle Search */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by make, model, color, plate number, or serial number..."
          width="w-full"
          variant="white-bg"
        />
        <p className="text-xs text-primary/60 mt-1">
          Example: "Honda Civic", "Gray", "BJQ-752", "8881212"
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-primary/70">Searching vehicles...</p>
        </div>
      )}

      {/* No Results */}
      {searchInitiated && !loading && vehicles.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p>No vehicles found</p>
          <p className="text-sm">Try searching by make, model, color, plate number, or serial number</p>
        </div>
      )}

      {/* Vehicle Results */}
      {!loading && vehicles.length > 0 && (
        <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedVehicle?.id === vehicle.id
                  ? 'border-primary bg-primary/5'
                  : 'border-primary/30 bg-white hover:border-primary/50'
              }`}
              onClick={() => handleVehicleSelect(vehicle)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-primary text-lg">{vehicle.plate_number}</h4>
                  <p className="text-sm text-primary/70 mt-1">
                    Serial Number: {vehicle.serial_number}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-primary/70">
                    <div className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {vehicle.make_year}
                    </div>
                    <div className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {vehicle.color}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      {formatNumber(vehicle.mileage)} km
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  vehicle.status === 'Available' || vehicle.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {vehicle.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden inputs for form validation */}
      <input type="hidden" name="selectedVehicleId" value={formik.values.selectedVehicleId || ''} />
      <input type="hidden" name="vehiclePlate" value={formik.values.vehiclePlate || ''} />
      <input type="hidden" name="vehicleSerialNumber" value={formik.values.vehicleSerialNumber || ''} />
    </>
  );
}
