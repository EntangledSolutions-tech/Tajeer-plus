'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SummaryCard } from '../../reusableComponents/SummaryCard';
import { SearchBar } from '../../reusableComponents/SearchBar';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { Filter, FileSpreadsheet, Loader2, Eye, ArrowRight, FileText, CheckCircle, Calendar } from 'lucide-react';
import CustomCard from '../../reusableComponents/CustomCard';

interface Contract {
  id: string;
  contract_number: string;
  tajeer_number?: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status_id?: string;
  status?: string; // Keep for backward compatibility
  status_details?: {
    name: string;
    description?: string;
    color: string;
  };
  total_amount: number;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  contracts: Contract[];
  summary: {
    total: number;
    active: number;
    completed: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function VehicleContract() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params?.id as string;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch contracts for this vehicle
  const fetchContracts = async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/vehicles/${vehicleId}/contracts?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch contracts`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setContracts(data.contracts);
        setSummary(data.summary);
        setPagination(data.pagination);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      console.error('Error fetching vehicle contracts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contracts on component mount and when dependencies change
  useEffect(() => {
    fetchContracts();
  }, [vehicleId, currentPage, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page on new search
      } else {
        fetchContracts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);



  // Prepare summary data for SummaryCard
  const summaryData = [
    { label: 'Contracts', value: summary.total, icon: <FileText className="w-6 h-6" /> },
    { label: 'Active', value: summary.active, icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'Completed', value: summary.completed, icon: <Calendar className="w-6 h-6" /> }
  ];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'contract_number',
      label: 'Contract No.',
      type: 'text',
      render: (value, row) => (
        <span className="font-medium text-primary">
          {value || row.tajeer_number || row.id.slice(0, 8)}
        </span>
      )
    },
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
    {
      key: 'customer_name',
      label: 'Customer',
      type: 'text',
      render: (value) => (
        <span className="text-primary font-medium">{value}</span>
      )
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date'
    },
    {
      key: 'end_date',
      label: 'End Date',
      type: 'date'
    },
    {
      key: 'total_amount',
      label: 'Amount',
      type: 'currency'
    }
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4" />,
      variant: 'ghost',
      onClick: (row) => {
        router.push(`/contracts/${row.id}`);
      },
      className: 'text-primary',
      iconPosition: 'right'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCard data={summaryData} />
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

          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
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
          emptyMessage={
            searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'This vehicle has no contracts yet.'
          }
          searchable={false}
          pagination={pagination.totalPages > 1}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          currentLimit={pagination.limit}
        />
      </CustomCard>
    </div>
  );
}