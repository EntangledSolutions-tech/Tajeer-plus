import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import FilterModal, { FilterSection } from '../../../reusableComponents/FilterModal';
import { Car, Calendar, Palette, MapPin, Fuel, Gauge, Plus, Filter, DollarSign } from 'lucide-react';
import { useHttpService } from '../../../../lib/http-service';
import { useBranch } from '../../../../contexts/branch-context';

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
  const { selectedBranch } = useBranch();
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    makes: [],
    models: []
  });

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

  // Calculate active filters count
  const activeFiltersCount = Object.values(selectedFilters).filter(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      // For filter objects like {white: true, black: true}, check if any values are true
      return Object.values(value).some(v => v === true);
    }
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Fetch filter options from backend APIs
  const fetchFilterOptions = async () => {
    try {
      const [colorsResponse, makesResponse] = await Promise.all([
        getRequest('/api/vehicle-configuration/colors'),
        getRequest('/api/vehicle-configuration/makes')
      ]);

      const colors = colorsResponse.success && colorsResponse.data?.colors
        ? colorsResponse.data.colors.map((color: any) => ({
            label: color.name,
            value: color.name, // Use actual name, not lowercase
            id: color.id,
            hexCode: color.hex_code
          }))
        : [];

      const makes = makesResponse.success && makesResponse.data?.makes
        ? makesResponse.data.makes.map((make: any) => ({
            label: make.name,
            value: make.name, // Use actual name, not lowercase
            id: make.id
          }))
        : [];

      setFilterOptions({ colors, makes, models: [] });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Fetch models based on selected make
  const fetchModels = async (makeName: string) => {
    try {
      const response = await getRequest(`/api/vehicle-configuration/models?make_name=${makeName}`);
      if (response.success && response.data?.models) {
        const models = response.data.models.map((model: any) => ({
          label: model.name,
          value: model.name, // Use actual name, not lowercase
          id: model.id,
          makeId: model.make_id
        }));
        setFilterOptions(prev => ({ ...prev, models }));
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  // Fetch vehicles from API
  const fetchVehicles = async (query: string) => {
    if (!query.trim() && activeFiltersCount === 0) {
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
        limit: '-1', // Increased limit for better search results
        page: '1'
      });

      // Add branch_id filter if a branch is selected
      if (selectedBranch) {
        params.append('branch_id', selectedBranch.id);
      }

      // Apply filters to API call
      // selectedFilters.colors is an object like {white: true, black: true}
      if (selectedFilters.colors && Object.keys(selectedFilters.colors).length > 0) {
        // Extract selected color names from the object
        const selectedColorNames = Object.keys(selectedFilters.colors).filter(key => selectedFilters.colors[key]);
        console.log('Selected color names:', selectedColorNames);

        // Convert color names to IDs and send color_id parameters
        selectedColorNames.forEach((colorName: string) => {
          const colorOption = filterOptions.colors.find((c: any) => c.value === colorName);
          if (colorOption && (colorOption as any).id) {
            params.append('color_id', (colorOption as any).id);
            console.log('Added color_id:', (colorOption as any).id, 'for color:', colorName);
          }
        });
      }

      // selectedFilters.make is an object like {honda: true, toyota: true}
      if (selectedFilters.make && Object.keys(selectedFilters.make).length > 0) {
        // Extract selected make names from the object
        const selectedMakeNames = Object.keys(selectedFilters.make).filter(key => selectedFilters.make[key]);
        console.log('Selected make names:', selectedMakeNames);

        // Convert make names to IDs and send make_id parameters
        selectedMakeNames.forEach((makeName: string) => {
          const makeOption = filterOptions.makes.find((m: any) => m.value === makeName);
          if (makeOption && (makeOption as any).id) {
            params.append('make_id', (makeOption as any).id);
            console.log('Added make_id:', (makeOption as any).id, 'for make:', makeName);
          }
        });
      }

      // selectedFilters.model is an object like {civic: true, accord: true}
      if (selectedFilters.model && Object.keys(selectedFilters.model).length > 0) {
        // Extract selected model names from the object
        const selectedModelNames = Object.keys(selectedFilters.model).filter(key => selectedFilters.model[key]);
        console.log('Selected model names:', selectedModelNames);

        // Convert model names to IDs and send model_id parameters
        selectedModelNames.forEach((modelName: string) => {
          const modelOption = filterOptions.models.find((m: any) => m.value === modelName);
          if (modelOption && (modelOption as any).id) {
            params.append('model_id', (modelOption as any).id);
            console.log('Added model_id:', (modelOption as any).id, 'for model:', modelName);
          }
        });
      }

      if (selectedFilters.priceRange) {
        if (selectedFilters.priceRange.min !== undefined) {
          params.append('min_expected_sale_price', selectedFilters.priceRange.min.toString());
        }
        if (selectedFilters.priceRange.max !== undefined) {
          params.append('max_expected_sale_price', selectedFilters.priceRange.max.toString());
        }
      }

      if (selectedFilters.ageRange) {
        if (selectedFilters.ageRange.min !== undefined) {
          const currentYear = new Date().getFullYear();
          const maxYear = currentYear - selectedFilters.ageRange.min;
          params.append('max_make_year', maxYear.toString());
        }
        if (selectedFilters.ageRange.max !== undefined) {
          const currentYear = new Date().getFullYear();
          const minYear = currentYear - selectedFilters.ageRange.max;
          params.append('min_make_year', minYear.toString());
        }
      }

      console.log('API call parameters:', params.toString()); // Debug log
      console.log('Selected filters:', selectedFilters); // Debug log
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

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTerm.trim() || activeFiltersCount > 0) {
      setSearchInitiated(true);
      const timeoutId = setTimeout(() => {
        fetchVehicles(searchTerm);
      }, 300); // Reduced debounce time for better responsiveness

      return () => clearTimeout(timeoutId);
    } else {
      setVehicles([]);
      setSearchInitiated(false);
    }
  }, [searchTerm, selectedFilters, activeFiltersCount, selectedBranch]);

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
    // Find the color in our filter options (from backend)
    const colorFromBackend = filterOptions.colors.find((color: any) =>
      color.name === colorName || color.label === colorName || color.value === colorName
    );

    if (colorFromBackend && (colorFromBackend as any).hexCode) {
      return (colorFromBackend as any).hexCode;
    }

    // Default to gray if color not found in backend data
    return '#808080';
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
      options: filterOptions.colors,
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
      options: filterOptions.makes
    },
    {
      id: 'model',
      title: 'Model',
      type: 'searchable-checkbox',
      searchPlaceholder: 'Search model',
      options: filterOptions.models
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

    // If make is selected, fetch models for that make
    if (sectionId === 'make' && value && Object.keys(value).length > 0) {
      // Extract selected make names from the object
      const selectedMakeNames = Object.keys(value).filter(key => value[key]);
      if (selectedMakeNames.length > 0) {
        // Fetch models for the first selected make (you can extend this for multiple makes)
        fetchModels(selectedMakeNames[0] || '');
      }
    } else if (sectionId === 'make' && (!value || Object.keys(value).length === 0)) {
      // Clear models if no make is selected
      setFilterOptions(prev => ({ ...prev, models: [] }));
    }
  };

  const handleClearAllFilters = () => {
    setSelectedFilters({});
  };

  const handleShowFilterResults = () => {
    // Apply filters to the vehicle search by triggering a new search
    setIsFilterModalOpen(false);
    // Trigger a new search with current filters
    if (searchTerm.trim() || activeFiltersCount > 0) {
      fetchVehicles(searchTerm);
    }
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
          <div className="relative">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2"
              icon={<Filter className="w-4 h-4 text-primary" />}
            >
              <span className="sr-only">Filter</span>
            </CustomButton>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {activeFiltersCount}
              </span>
            )}
          </div>
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
        <div className="text-center py-8 text-muted-foreground">
          <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No vehicles found</p>
          <p className="text-sm mb-4">Try adjusting your search terms</p>
          <CustomButton
            onClick={handleCreateVehicle}
            variant="ghost"
            className="text-primary underline hover:text-primary/80 font-medium flex items-center gap-2 mx-auto p-0 h-auto"
          >
            <Plus className="w-4 h-4" />
            Create Vehicle
          </CustomButton>
        </div>
      )}

      {/* Show create vehicle option when no search is initiated */}
      {!searchInitiated && !searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Search for a vehicle</p>
          <p className="text-sm mb-4">Enter a make, model, color, plate number, or serial number to find existing vehicles</p>
          <CustomButton
            onClick={handleCreateVehicle}
            variant="ghost"
            className="text-primary underline hover:text-primary/80 font-medium flex items-center gap-2 mx-auto p-0 h-auto"
          >
            <Plus className="w-4 h-4" />
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
