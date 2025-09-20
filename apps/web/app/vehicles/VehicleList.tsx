'use client';

import { toast } from '@kit/ui/sonner';
import { ArrowRight, Calendar, Car, CheckCircle, FileSpreadsheet, Filter, Wrench } from 'lucide-react';
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
  }, [debouncedSearch, pagination.page, pagination.limit, status, model, year]);

  useEffect(() => {
    fetchVehicleStatuses();
    fetchVehicles();
  }, [fetchVehicleStatuses, fetchVehicles]);

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
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-5 h-5 text-primary" />
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