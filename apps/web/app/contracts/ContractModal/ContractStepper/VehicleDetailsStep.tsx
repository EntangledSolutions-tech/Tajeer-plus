import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import FilterModal, { FilterSection } from '../../../reusableComponents/FilterModal';
import { Car, Calendar, Palette, MapPin, Fuel, Gauge, Plus, Filter, DollarSign } from 'lucide-react';
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
  daily_rent_rate?: number;
  daily_hourly_delay_rate?: number;
  daily_permitted_km?: number;
  daily_excess_km_rate?: number;
}

export default function VehicleDetailsStep() {
  const formik = useFormikContext<any>();
  const { getRequest } = useHttpService();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});

  // Get selected vehicle from Formik values
  const selectedVehicle = vehicles.find(v => v.id === formik.values.selectedVehicleId) ||
    (formik.values.selectedVehicleId ? {
      id: formik.values.selectedVehicleId,
      plate_number: formik.values.vehiclePlate || '',
      serial_number: formik.values.vehicleSerialNumber || '',
      plate_registration_type: formik.values.vehiclePlateRegistrationType || 'Private',
      make_year: formik.values.vehicleMakeYear || '',
      model: formik.values.vehicleModel || '',
      make: formik.values.vehicleMake || '',
      color: formik.values.vehicleColor || '',
      mileage: formik.values.vehicleMileage || 0,
      status: formik.values.vehicleStatus || 'Available',
      daily_rent_rate: formik.values.vehicleDailyRentRate || 0,
      daily_hourly_delay_rate: formik.values.vehicleHourlyDelayRate || 0,
      daily_permitted_km: formik.values.vehiclePermittedDailyKm || 0,
      daily_excess_km_rate: formik.values.vehicleExcessKmRate || 0
    } as Vehicle : null);

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
            status: vehicle.status?.name || 'Available',
            daily_rent_rate: vehicle.daily_rental_rate || 0,
            daily_hourly_delay_rate: vehicle.daily_hourly_delay_rate || 0,
            daily_permitted_km: vehicle.daily_permitted_km || 0,
            daily_excess_km_rate: vehicle.daily_excess_km_rate || 0
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
    }
  }, [searchTerm]);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    // Update Formik values with all vehicle data
    formik.setFieldValue('selectedVehicleId', vehicle.id);
    formik.setFieldValue('vehiclePlate', vehicle.plate_number);
    formik.setFieldValue('vehicleSerialNumber', vehicle.serial_number);
    formik.setFieldValue('vehiclePlateRegistrationType', vehicle.plate_registration_type);
    formik.setFieldValue('vehicleMakeYear', vehicle.make_year);
    formik.setFieldValue('vehicleModel', vehicle.model);
    formik.setFieldValue('vehicleMake', vehicle.make);
    formik.setFieldValue('vehicleColor', vehicle.color);
    formik.setFieldValue('vehicleMileage', vehicle.mileage);
    formik.setFieldValue('vehicleStatus', vehicle.status);
    formik.setFieldValue('vehicleDailyRentRate', vehicle.daily_rent_rate);
    formik.setFieldValue('vehicleHourlyDelayRate', vehicle.daily_hourly_delay_rate);
    formik.setFieldValue('vehiclePermittedDailyKm', vehicle.daily_permitted_km);
    formik.setFieldValue('vehicleExcessKmRate', vehicle.daily_excess_km_rate);

    // Trigger validation to enable the next button
    setTimeout(() => {
      formik.validateForm();
    }, 100);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'white': '#ffffff',
      'black': '#000000',
      'silver': '#c0c0c0',
      'gray': '#808080',
      'grey': '#808080',
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#008000',
      'yellow': '#ffff00',
      'orange': '#ffa500',
      'brown': '#a52a2a',
      'purple': '#800080',
      'pink': '#ffc0cb',
      'gold': '#ffd700',
      'navy': '#000080',
      'maroon': '#800000',
      'beige': '#f5f5dc',
      'cream': '#fffdd0',
      'burgundy': '#800020',
      'champagne': '#f7e7ce',
      'pearl': '#f8f6f0',
      'metallic': '#8c8c8c',
      'charcoal': '#36454f'
    };

    const normalizedColor = colorName.toLowerCase().trim();
    return colorMap[normalizedColor] || '#808080'; // Default to gray if color not found
  };

  const handleCreateVehicle = () => {
    // Navigate to vehicles page
    router.push('/vehicles');
  };

  // Filter sections for the FilterModal
  const filterSections: FilterSection[] = [
    {
      id: 'colors',
      title: 'Colors',
      type: 'searchable-checkbox',
      searchPlaceholder: 'Search colors',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Black', value: 'black' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gray', value: 'gray' },
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Orange', value: 'orange' },
        { label: 'Brown', value: 'brown' }
      ],
      isExpanded: true
    },
    {
      id: 'priceRange',
      title: 'Price Range',
      type: 'range',
      minValue: 0,
      maxValue: 500000,
      step: 1000,
      unit: 'SAR'
    },
    {
      id: 'make',
      title: 'Make',
      type: 'searchable-checkbox',
      searchPlaceholder: 'Search make',
      options: [
        { label: 'Toyota', value: 'toyota' },
        { label: 'Honda', value: 'honda' },
        { label: 'Nissan', value: 'nissan' },
        { label: 'Hyundai', value: 'hyundai' },
        { label: 'Kia', value: 'kia' },
        { label: 'Mazda', value: 'mazda' },
        { label: 'Mitsubishi', value: 'mitsubishi' },
        { label: 'Lexus', value: 'lexus' },
        { label: 'Infiniti', value: 'infiniti' },
        { label: 'BMW', value: 'bmw' },
        { label: 'Mercedes-Benz', value: 'mercedes' },
        { label: 'Audi', value: 'audi' }
      ]
    },
    {
      id: 'model',
      title: 'Model',
      type: 'searchable-checkbox',
      searchPlaceholder: 'Search model',
      options: [
        { label: 'Camry', value: 'camry' },
        { label: 'Corolla', value: 'corolla' },
        { label: 'Accord', value: 'accord' },
        { label: 'Civic', value: 'civic' },
        { label: 'Altima', value: 'altima' },
        { label: 'Sentra', value: 'sentra' },
        { label: 'Elantra', value: 'elantra' },
        { label: 'Sonata', value: 'sonata' },
        { label: 'Sportage', value: 'sportage' },
        { label: 'Sorento', value: 'sorento' },
        { label: 'CX-5', value: 'cx-5' },
        { label: 'CX-9', value: 'cx-9' }
      ]
    },
    {
      id: 'ageRange',
      title: 'Age Range',
      type: 'range',
      minValue: 0,
      maxValue: 20,
      step: 1,
      unit: 'years'
    }
  ];

  const handleFilterChange = (sectionId: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const handleClearAllFilters = () => {
    setSelectedFilters({});
  };

  const handleShowFilterResults = () => {
    // Apply filters to the vehicle search
    // For now, we'll just close the modal and could implement filtering logic here
    setIsFilterModalOpen(false);
    // You can add filtering logic here based on selectedFilters
    console.log('Applied filters:', selectedFilters);
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
        <div className="flex gap-2">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by make, model, color, plate number, or serial number..."
            width="flex-1"
            variant="white-bg"
          />
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            className="p-2"
            icon={<Filter className="w-4 h-4 text-primary" />}
          >
            <span className="sr-only">Filter</span>
          </CustomButton>
        </div>
        <p className="text-xs text-primary/60 mt-1">
          Example: "Honda Civic", "Gray", "BJQ-752", "8881212"
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
          <p className="mt-3 text-gray-600 font-medium">Searching vehicles...</p>
        </div>
      )}

      {/* No Results */}
      {searchInitiated && !loading && vehicles.length === 0 && searchTerm && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">Try adjusting your search terms or create a new vehicle</p>
          <CustomButton
            variant="outline"
            onClick={handleCreateVehicle}
            className="inline-flex items-center gap-2"
            icon={<Plus className="w-4 h-4" />}
          >
            Create Vehicle
          </CustomButton>
        </div>
      )}

      {/* Show create vehicle option when no search is initiated */}
      {!searchInitiated && !searchTerm && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for a vehicle</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Enter a make, model, color, plate number, or serial number to find existing vehicles</p>
          <CustomButton
            variant="outline"
            onClick={handleCreateVehicle}
            className="inline-flex items-center gap-2"
            icon={<Plus className="w-4 h-4" />}
          >
            Create New Vehicle
          </CustomButton>
        </div>
      )}

      {/* Vehicle Results */}
      {!loading && vehicles.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto mb-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`group relative p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
                selectedVehicle?.id === vehicle.id
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm'
              }`}
              onClick={() => handleVehicleSelect(vehicle)}
            >

              <div className="flex items-start gap-4">
                {/* Vehicle Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>

                {/* Vehicle Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-primary text-xl">{vehicle.plate_number}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      vehicle.status === 'Available' || vehicle.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium min-w-[60px]">Serial:</span>
                      <span className="text-gray-900 font-medium">{vehicle.serial_number}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium min-w-[60px]">Make/Model:</span>
                      <span className="text-gray-900 font-medium">{vehicle.make} {vehicle.model}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium min-w-[60px]">Year:</span>
                      <span className="text-gray-900 font-medium">{vehicle.make_year}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium min-w-[60px]">Color:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: getColorValue(vehicle.color) }}
                        ></div>
                        <span className="text-gray-900 font-medium">{vehicle.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium min-w-[60px]">Mileage:</span>
                      <span className="text-gray-900 font-medium">{formatNumber(vehicle.mileage)} km</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium min-w-[60px]">Daily Rate:</span>
                      <span className="text-primary font-bold text-base">{vehicle.daily_rent_rate || 0} SAR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Vehicle Display */}
      {selectedVehicle && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">Selected Vehicle</span>
          </div>
          <div className="p-5 border-2 border-green-200 bg-green-50 rounded-xl">
            <div className="flex items-start gap-4">
              {/* Vehicle Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>

              {/* Vehicle Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-primary text-xl">{selectedVehicle.plate_number}</h4>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    selectedVehicle.status === 'Available' || selectedVehicle.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">Serial:</span>
                    <span className="text-gray-900 font-medium">{selectedVehicle.serial_number}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">Make/Model:</span>
                    <span className="text-gray-900 font-medium">{selectedVehicle.make} {selectedVehicle.model}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">Year:</span>
                    <span className="text-gray-900 font-medium">{selectedVehicle.make_year}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: getColorValue(selectedVehicle.color) }}
                      ></div>
                      <span className="text-gray-900 font-medium">{selectedVehicle.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">Mileage:</span>
                    <span className="text-gray-900 font-medium">{formatNumber(selectedVehicle.mileage)} km</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">Daily Rate:</span>
                    <span className="text-primary font-bold text-base">{selectedVehicle.daily_rent_rate || 0} SAR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation error display */}
      {formik.touched.selectedVehicleId && formik.errors.selectedVehicleId && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{String(formik.errors.selectedVehicleId)}</p>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Vehicle Filters"
        sections={filterSections}
        onClearAll={handleClearAllFilters}
        onShowResults={handleShowFilterResults}
        onFilterChange={handleFilterChange}
        selectedFilters={selectedFilters}
      />
    </>
  );
}
