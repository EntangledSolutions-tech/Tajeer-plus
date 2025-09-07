'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { SearchBar } from '../../reusableComponents/SearchBar';
import CustomButton from '../../reusableComponents/CustomButton';
import { SummaryCard } from '../../reusableComponents/SummaryCard';
import { ArrowRight, FileText, CheckCircle, Calendar, Filter, FileSpreadsheet } from 'lucide-react';

interface Contract {
  id: string;
  contract_number?: string;
  tajeer_number?: string;
  status_id?: string;
  status?: string; // Keep for backward compatibility
  status_details?: {
    name: string;
    description?: string;
    color: string;
  };
  vehicle_plate?: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  customer_name: string;
  created_at: string;
}

interface CustomerContractsProps {
  customerId: string;
}

export default function CustomerContracts({ customerId }: CustomerContractsProps) {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [summaryData, setSummaryData] = useState({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    cancelled: 0
  });
  const [statusConfig, setStatusConfig] = useState<any>({ status: {} });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch contracts from API
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/customers/${customerId}/contracts?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch contracts`);
      }

      const data = await response.json();


      if (data.success) {
        setContracts(data.contracts || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });

        // Calculate summary data on client side using status_details
        const summary = {
          total: data.pagination?.total || 0,
          active: data.contracts?.filter((c: Contract) => c.status_details?.name === 'Active').length || 0,
          completed: data.contracts?.filter((c: Contract) => c.status_details?.name === 'Completed').length || 0,
          draft: data.contracts?.filter((c: Contract) => c.status_details?.name === 'Draft').length || 0,
          cancelled: data.contracts?.filter((c: Contract) => c.status_details?.name === 'Cancelled').length || 0
        };
        setSummaryData(summary);

        // Create status configuration using status_details from joined data
        const statusConfig: any = { status: {} };
        const uniqueStatuses = new Set();

        // Collect unique statuses from contracts
        data.contracts?.forEach((contract: Contract) => {
          if (contract.status_details?.name) {
            uniqueStatuses.add(contract.status_details.name);
          }
        });

        // Create configuration for each status using color from status_details
        uniqueStatuses.forEach((statusName: any) => {
          const contract = data.contracts?.find((c: Contract) => c.status_details?.name === statusName);
          const color = contract?.status_details?.color;

          // Convert hex color to Tailwind classes
          const colorClass = color ? `bg-[${color}]20 text-[${color}]600` : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';

          statusConfig.status[statusName] = {
            className: colorClass,
            label: statusName
          };
        });
        setStatusConfig(statusConfig);
      }
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError(err.message || 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  }, [customerId, currentPage, currentLimit, debouncedSearch, statusFilter]);

  // Fetch contracts on component mount and when dependencies change
  useEffect(() => {
    if (customerId) {
      fetchContracts();
    }
  }, [fetchContracts, customerId]);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, statusFilter]);






  // Define columns for CustomTable
  const columns: TableColumn[] = [
    { key: 'contract_number', label: 'Contract No.' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      render: (value: any, row: Contract) => {
        const statusName = row.status_details?.name;
        const statusColor = row.status_details?.color;


        if (statusName && statusColor) {
          // Use inline styles instead of dynamic CSS classes to avoid parsing issues
          return (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${statusColor}20`, // 20% opacity
                color: statusColor,
                border: `1px solid ${statusColor}40` // 40% opacity for border
              }}
            >
              {statusName}
            </span>
          );
        }

        // Fallback if no status details
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">
            {statusName || 'Unknown'}
          </span>
        );
      }
    },
    { key: 'vehicle_plate', label: 'Vehicle' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'total_amount', label: 'Amount' }
  ];

  // Define actions for CustomTable
  const actions: TableAction[] = [
    {
      key: 'details',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4" />,
      variant: 'ghost',
      className: 'text-primary',
      onClick: (contract) => router.push(`/contracts/${contract.id}`)
    }
  ];


  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCard data={[
          { label: 'Contracts', value: summaryData.total, icon: <FileText className="w-6 h-6" /> },
          { label: 'Active', value: summaryData.active, icon: <CheckCircle className="w-6 h-6" /> },
          { label: 'Completed', value: summaryData.completed, icon: <Calendar className="w-6 h-6" /> }
        ]} />
      </div>

      {/* CustomCard wrapper for table and filters */}
      <CustomCard shadow="sm" radius="xl" padding="none" className="overflow-hidden">
        {/* Filter/Search Bar */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-100">
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'all' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => setStatusFilter('all')}
          >
            All Status
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'Active' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => setStatusFilter('Active')}
          >
            Active
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'Completed' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => setStatusFilter('Completed')}
          >
            Completed
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'Draft' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => setStatusFilter('Draft')}
          >
            Draft
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'Cancelled' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => setStatusFilter('Cancelled')}
          >
            Cancelled
          </CustomButton>

          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search contracts..."
              width="w-72"
              variant="white-bg"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-5 h-5 text-primary" />
            </CustomButton>
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </CustomButton>
          </div>
        </div>

        {/* CustomTable */}
        <CustomTable
          data={contracts}
          columns={columns}
          actions={actions}
          loading={loading}
          tableBackground="transparent"
          emptyMessage={debouncedSearch || statusFilter !== 'all'
            ? 'No contracts found matching your search criteria.'
            : 'No contracts found for this customer.'
          }
          statusConfig={statusConfig}
          searchable={false}
          pagination={false}
        />
      </CustomCard>
    </div>
  );
}