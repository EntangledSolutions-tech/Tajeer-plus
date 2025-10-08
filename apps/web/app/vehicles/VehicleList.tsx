'use client';

import { toast } from '@kit/ui/sonner';
import { ArrowRight, Calendar, Car, CheckCircle, FileSpreadsheet, Filter, Wrench, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import CustomButton from '../reusableComponents/CustomButton';
import CustomCard from '../reusableComponents/CustomCard';
import CustomTable, { TableAction, TableColumn } from '../reusableComponents/CustomTable';
import { SearchBar } from '../reusableComponents/SearchBar';
import { SummaryCard } from '../reusableComponents/SummaryCard';
import VehicleModal from './VehicleModal/index';
import { useHttpService } from '../../lib/http-service';

interface Vehicle {
  id: string;
  make: { name: string } | string;
  make_year: string;
  color: { name: string; hex_code?: string } | string;
  plate_number: string;
  mileage: number;
  expected_sale_price: number;
  branch: string;
  created_at: string;
  documents: any[];
  status: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function VehicleList() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();

  // Column definitions for CustomTable
  const columns: TableColumn[] = [
    {
      key: 'plate_number',
      label: 'Plate',
      type: 'text',
      sortable: true
    },
    {
      key: 'make_year',
      label: 'Year',
      type: 'text',
      width: '100px'
    },
    {
      key: 'model',
      label: 'Model',
      type: 'text',
      sortable: true
    },
    {
      key: 'make',
      label: 'Make',
      type: 'text',
      sortable: true,
      render: (value: any, row: any) => {
        const makeName = typeof row.make === 'object' ? row.make.name : row.make;
        return makeName || 'Unknown';
      }
    },
    {
      key: 'color',
      label: 'Color',
      type: 'text',
      render: (value: any, row: any) => {
        const colorName = row.color || 'Unknown';
        const colorHex = row.colorHex;

        if (colorHex) {
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: colorHex }}
              />
              <span>{colorName}</span>
            </div>
          );
        }
        return colorName;
      }
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      width: '120px',
            render: (value: any, row: any) => {
        const statusName = value || 'Unknown';
        const statusInfo = statusConfig.status[statusName];

        if (statusInfo) {
          return (
            <span
              className={statusInfo.className}
              style={statusInfo.style}
            >
              {statusInfo.label}
            </span>
          );
        }

        // Fallback for unknown status
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">
            {statusName}
          </span>
        );
      }
    },
    {
      key: 'mileage',
      label: 'Current km',
      type: 'number',
      align: 'right',
      sortable: true
    },
    {
      key: 'expected_sale_price',
      label: 'Sale Price',
      type: 'currency',
      align: 'right',
      sortable: true
    }
  ];

  // Actions for CustomTable
  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'Details',
      iconPosition: 'right',
      icon: <ArrowRight className="w-4 h-4 ml-2" />,
      variant: 'ghost',
      className: 'text-primary  flex items-center',
      onClick: (row) => {
        router.push(`/vehicles/${row.id}`);
      }
    }
  ];

  // Status configuration for CustomTable - will be populated from database
  const [statusConfig, setStatusConfig] = useState<any>({ status: {} });
  const [statusOptions, setStatusOptions] = useState<Array<{ label: string; value: string }>>([
    { label: 'All Status', value: 'all' }
  ]);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Current limit state for server-side pagination
  const [currentLimit, setCurrentLimit] = useState(10);

  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  // Enhanced filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    color: '',
    carClass: '',
    branch: '',
    plateRegistrationType: '',
    minMileage: '',
    maxMileage: '',
    minExpectedSalePrice: '',
    maxExpectedSalePrice: '',
    isActive: ''
  });

  // Options for filters
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [makesResponse, colorsResponse, branchesResponse] = await Promise.all([
        getRequest('/api/vehicle-configuration/makes?limit=1000'),
        getRequest('/api/vehicle-configuration/colors?limit=1000'),
        getRequest('/api/branches?limit=1000')
      ]);

      if (makesResponse.success && makesResponse.data) {
        setMakes(makesResponse.data.makes || []);
      }

      if (colorsResponse.success && colorsResponse.data) {
        setColors(colorsResponse.data.colors || []);
      }

      if (branchesResponse.success && branchesResponse.data) {
        setBranches(branchesResponse.data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Fetch vehicle statuses from database
  const fetchVehicleStatuses = useCallback(async () => {
    try {
      const response = await getRequest('/api/vehicle-configuration/statuses?limit=100');

      if (response.success && response.data) {
        const result = response.data;
        // Convert statuses to the format expected by CustomTable
        const statusConfigData: any = { status: {} };
        const statusOptionsData = [{ label: 'All Status', value: 'all' }];

        result.statuses.forEach((status: any) => {
          // Use inline styles instead of dynamic CSS classes to avoid parsing issues
          statusConfigData.status[status.name] = {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: status.name,
            style: {
              backgroundColor: `${status.color}20`, // 20% opacity
              color: status.color,
              border: `1px solid ${status.color}40` // 40% opacity for border
            }
          };
          statusOptionsData.push({
            label: status.name,
            value: status.name.toLowerCase().replace(/\s+/g, '_')
          });
        });

        setStatusConfig(statusConfigData);
        setStatusOptions(statusOptionsData);
      } else {
        console.error('Error fetching vehicle statuses:', response.error);
        if (response.error) {
          alert(`Error: ${response.error}`);
        }
        // Fallback to default status config if API fails
        setStatusConfig({
          status: {
            'Available': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Available',
              style: {
                backgroundColor: '#10B98120',
                color: '#10B981',
                border: '1px solid #10B98140'
              }
            },
            'Rented': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Rented',
              style: {
                backgroundColor: '#3B82F620',
                color: '#3B82F6',
                border: '1px solid #3B82F640'
              }
            },
            'Maintenance': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Maintenance',
              style: {
                backgroundColor: '#F59E0B20',
                color: '#F59E0B',
                border: '1px solid #F59E0B40'
              }
            },
            'Out of Service': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Out of Service',
              style: {
                backgroundColor: '#EF444420',
                color: '#EF4444',
                border: '1px solid #EF444440'
              }
            }
          }
        });
        setStatusOptions([
          { label: 'All Status', value: 'all' },
          { label: 'Available', value: 'available' },
          { label: 'Rented', value: 'rented' },
          { label: 'Maintenance', value: 'maintenance' },
          { label: 'Out of Service', value: 'out_of_service' }
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching vehicle statuses:', err);
      // Fallback to default status config if API fails
      setStatusConfig({
        status: {
          'Available': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Available',
            style: {
              backgroundColor: '#10B98120',
              color: '#10B981',
              border: '1px solid #10B98140'
            }
          },
          'Rented': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Rented',
            style: {
              backgroundColor: '#3B82F620',
              color: '#3B82F6',
              border: '1px solid #3B82F640'
            }
          },
          'Maintenance': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Maintenance',
            style: {
              backgroundColor: '#F59E0B20',
              color: '#F59E0B',
              border: '1px solid #F59E0B40'
            }
          },
          'Out of Service': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Out of Service',
            style: {
              backgroundColor: '#EF444420',
              color: '#EF4444',
              border: '1px solid #EF444440'
            }
          }
        }
      });
      setStatusOptions([
        { label: 'All Status', value: 'all' },
        { label: 'Available', value: 'available' },
        { label: 'Rented', value: 'rented' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Out of Service', value: 'out_of_service' }
      ]);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: currentLimit.toString(),
        search: debouncedSearch,
        status: status,
        model: model,
        year: year
      });

      // Add enhanced filters
      if (filters.make) params.append('make_id', filters.make);
      if (filters.model) params.append('model_id', filters.model);
      if (filters.color) params.append('color_id', filters.color);
      if (filters.carClass) params.append('car_class', filters.carClass);
      if (filters.branch) params.append('branch_id', filters.branch);
      if (filters.plateRegistrationType) params.append('plate_registration_type', filters.plateRegistrationType);
      if (filters.minMileage) params.append('min_mileage', filters.minMileage);
      if (filters.maxMileage) params.append('max_mileage', filters.maxMileage);
      if (filters.minExpectedSalePrice) params.append('min_expected_sale_price', filters.minExpectedSalePrice);
      if (filters.maxExpectedSalePrice) params.append('max_expected_sale_price', filters.maxExpectedSalePrice);
      if (filters.isActive) params.append('is_active', filters.isActive);

      const response = await getRequest(`/api/vehicles?${params}`);

      if (response.success && response.data) {
        const result = response.data;
        // Add status field to vehicles data and normalize make/color/model
        const vehiclesWithStatus = (result.vehicles || []).map((vehicle: any) => {
          // Handle the joined data structure with foreign keys
          const makeName = vehicle.make?.name || 'Unknown';
          const modelName = vehicle.model?.name || 'Unknown';
          const colorName = vehicle.color?.name || 'Unknown';
          const colorHex = vehicle.color?.hex_code;
          const statusName = vehicle.status?.name || 'Available';
          const ownerName = vehicle.owner?.name || 'Unknown';
          const actualUserName = vehicle.actual_user?.name || 'Unknown';

          return {
            ...vehicle,
            make: makeName,
            model: modelName,
            color: colorName,
            colorHex: colorHex,
            status: statusName,
            owner: ownerName,
            actual_user: actualUserName
          };
        });
        setVehicles(vehiclesWithStatus);
        setPagination(result.pagination || pagination);
      } else {
        console.error('Error fetching vehicles:', response.error);
        if (response.error) {
          alert(`Error: ${response.error}`);
        }
        setVehicles([]);
      }
    } catch (err: any) {
      toast.error('Error fetching vehicles: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit, status, model, year, filters]);

  useEffect(() => {
    fetchVehicleStatuses();
    fetchFilterOptions();
    fetchVehicles();
  }, [fetchVehicleStatuses, fetchFilterOptions, fetchVehicles]);

  // Separate effect for refetch trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      fetchVehicles();
    }
  }, [refetchTrigger, fetchVehicles]);

  const handleVehicleAdded = () => {
    // Refetch vehicles when a new one is added
    setRefetchTrigger(prev => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setCurrentLimit(newLimit);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Calculate active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  // Handle filter changes
  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      make: '',
      model: '',
      color: '',
      carClass: '',
      branch: '',
      plateRegistrationType: '',
      minMileage: '',
      maxMileage: '',
      minExpectedSalePrice: '',
      maxExpectedSalePrice: '',
      isActive: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear specific filter
  const clearFilter = (filterKey: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: ''
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExportExcel = async () => {
    try {
      // Build query parameters for export (without pagination)
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: status,
        model: model,
        year: year
      });

      const response = await getRequest(`/api/vehicles/export?${params}`);

      if (response.success && response.data) {
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vehicles_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Vehicles exported successfully');
      } else {
        throw new Error(response.error || 'Failed to export vehicles');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export vehicles');
    }
  };

  // Calculate summary statistics from vehicles data
  const calculateSummaryData = () => {
    const totalVehicles = pagination.total;
    const availableCount = vehicles.filter(v => v.status === 'Available').length;
    const reservedCount = vehicles.filter(v => v.status === 'Reserved').length;
    const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;

    return [
      {
        label: 'Vehicles',
        value: totalVehicles,
        icon: <Car className="w-6 h-6" />
      },
      {
        label: 'Available',
        value: availableCount,
        icon: <CheckCircle className="w-6 h-6" />
      },
      {
        label: 'Reserved',
        value: reservedCount,
        icon: <Calendar className="w-6 h-6" />
      },
      {
        label: 'Maintenance',
        value: maintenanceCount,
        icon: <Wrench className="w-6 h-6" />
      },
    ];
  };

  const summaryData = calculateSummaryData();



  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Error AlertDialog */}
      {/* Error AlertDialog */}

      {/* Heading and Add Vehicle Button */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Vehicles</h1>
        <VehicleModal onVehicleAdded={handleVehicleAdded} />
      </div>

      {/* Summary Cards */}
      <SummaryCard data={summaryData} />

      {/* Table Container with CustomCard */}
      <CustomCard
        shadow="sm"
        radius="xl"
        padding="none"
        className="overflow-hidden"
      >
        {/* Filter/Search Bar */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-100">
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={statusOptions}
            onDropdownSelect={(option) => setStatus(option.value)}
          >
            Status
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={[
              { label: 'All Models', value: '' },
              { label: 'Accent', value: 'accent' },
              { label: 'Elantra', value: 'elantra' },
              { label: 'Sonata', value: 'sonata' },
              { label: 'Tucson', value: 'tucson' }
            ]}
            onDropdownSelect={(option) => setModel(option.value)}
          >
            Model
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={[
              { label: 'All Years', value: '' },
              { label: '2024', value: '2024' },
              { label: '2023', value: '2023' },
              { label: '2022', value: '2022' },
              { label: '2021', value: '2021' },
              { label: '2020', value: '2020' }
            ]}
            onDropdownSelect={(option) => setYear(option.value)}
          >
            Year
          </CustomButton>
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search"
              width="w-72"
            />
            <CustomButton
              isSecondary
              size="sm"
              className="p-2 relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5 text-primary" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </CustomButton>
            <CustomButton
              isSecondary
              size="sm"
              className="p-2"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </CustomButton>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Filter Vehicles</h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Make Filter */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Make
                </label>
                <select
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Makes</option>
                  {makes.map((make) => (
                    <option key={make.id} value={make.id}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Color
                </label>
                <select
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Colors</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Car Class Filter */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Car Class
                </label>
                <select
                  value={filters.carClass}
                  onChange={(e) => handleFilterChange('carClass', e.target.value)}
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Classes</option>
                  <option value="economy">Economy</option>
                  <option value="compact">Compact</option>
                  <option value="midsize">Midsize</option>
                  <option value="fullsize">Full Size</option>
                  <option value="luxury">Luxury</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                </select>
              </div>

              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Branch
                </label>
                <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mileage Range */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Min Mileage
                </label>
                <input
                  type="number"
                  value={filters.minMileage}
                  onChange={(e) => handleFilterChange('minMileage', e.target.value)}
                  placeholder="Min mileage"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Max Mileage
                </label>
                <input
                  type="number"
                  value={filters.maxMileage}
                  onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                  placeholder="Max mileage"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minExpectedSalePrice}
                  onChange={(e) => handleFilterChange('minExpectedSalePrice', e.target.value)}
                  placeholder="Min price"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxExpectedSalePrice}
                  onChange={(e) => handleFilterChange('maxExpectedSalePrice', e.target.value)}
                  placeholder="Max price"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (value === '') return null;
                    const displayValue = key.includes('make') ? makes.find(m => m.id === value)?.name :
                                      key.includes('color') ? colors.find(c => c.id === value)?.name :
                                      key.includes('branch') ? branches.find(b => b.id === value)?.name :
                                      value;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                      >
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: {displayValue}</span>
                        <button
                          onClick={() => clearFilter(key)}
                          className="text-primary/60 hover:text-primary"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CustomTable */}
        <CustomTable
          data={vehicles}
          columns={columns}
          loading={loading}
          tableBackground="transparent"
          emptyMessage={
            search || status !== 'all' || model || year
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first vehicle to the fleet.'
          }
          emptyIcon={
            <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          statusConfig={statusConfig}
          actions={actions}
          searchable={false}
          pagination={true}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          currentLimit={currentLimit}
          onLimitChange={handleLimitChange}
          sortable={false}
          sortColumn=""
          sortDirection="asc"
          onSort={(column, direction) => {
            // Handle sorting if needed
            console.log('Sort:', column, direction);
          }}
        />
      </CustomCard>


    </div>
  );
}