'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Filter,
  FileSpreadsheet,
  Eye,
  ArrowRight,
  FileText,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { SummaryCard } from '../reusableComponents/SummaryCard';
import { SearchBar } from '../reusableComponents/SearchBar';
import CustomButton from '../reusableComponents/CustomButton';
import CustomCard from '../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../reusableComponents/CustomTable';
import ContractModal from './ContractModal/index';
import { useHttpService } from '../../lib/http-service';
import { useBranch } from '../../contexts/branch-context';

interface Contract {
  id: string;
  contract_number: string;
  tajeer_number?: string;
  customer_name: string;
  customer_type: 'existing' | 'new';
  vehicle_plate: string;
  start_date: string;
  end_date: string;
  status_id?: string;
  status?: { name: string; color?: string };
  total_amount: number;
  created_at: string;
  // Relations
  customers?: {
    id: string;
    name: string;
    id_number: string;
  };
  vehicles?: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
  };
}

interface ApiResponse {
  success: boolean;
  contracts: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function ContractsList() {
  const router = useRouter();
  const { getRequest } = useHttpService();
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { selectedBranch, isLoading: isBranchLoading } = useBranch();

  const handleContractAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setCurrentLimit(newLimit);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  // Fetch contracts from API
  const fetchContracts = async () => {
    // Don't fetch if branch context is still loading
    if (isBranchLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      // Add selected branch filter if a branch is selected
      if (selectedBranch) {
        params.append('branch_id', selectedBranch.id);
      }

      const response = await getRequest(`/api/contracts?${params}`);
      if (response.success && response.data) {
        setContracts(response.data.contracts);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.error || 'API returned error');
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch contracts on component mount and when dependencies change
  useEffect(() => {
    fetchContracts();
  }, [currentPage, currentLimit, debouncedSearch, statusFilter, refreshTrigger, selectedBranch, isBranchLoading]);

  // Reset page to 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, statusFilter]);

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  // Export functionality
  const handleExport = useCallback(() => {
    // Helper function to escape CSV fields
    const escapeCSVField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const csvContent = [
      ['Contract No.', 'Customer Name', 'Vehicle', 'Start Date', 'End Date', 'Status', 'Price'],
      ...contracts.map(contract => [
        contract.contract_number || contract.tajeer_number || contract.id.slice(0, 8),
        contract.customer_name || contract.customers?.name || 'N/A',
        contract.vehicle_plate || contract.vehicles?.plate_number || 'N/A',
        formatDate(contract.start_date),
        formatDate(contract.end_date),
        contract.status?.name || contract.status || 'Unknown',
        formatCurrency(contract.total_amount)
      ])
    ].map(row => row.map(field => escapeCSVField(typeof field === 'string' ? field : String(field))).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'contracts.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }, [contracts]);

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'contract_number',
      label: 'Contract No.',
      type: 'text',
      render: (value, row) => (
        <span className="font-medium">
          {value || row.tajeer_number || row.id.slice(0, 8)}
        </span>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer Name',
      type: 'text',
      render: (value, row) => (
        <span className=" font-medium">
          {value || row.customers?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'vehicle_plate',
      label: 'Vehicle',
      type: 'text',
      render: (value, row) => (
        <span className=" font-medium">
          {value || row.vehicles?.plate_number || 'N/A'}
        </span>
      )
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date',
      render: (value) => (
        <span className=" font-medium">
          {formatDate(value)}
        </span>
      )
    },
    {
      key: 'end_date',
      label: 'End Date',
      type: 'date',
      render: (value) => (
        <span className=" font-medium">
          {formatDate(value)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      render: (value: any, row: any) => {
        // Use status color directly from backend join
        const statusName = row.status?.name || value || 'Unknown';
        const statusColor = row.status?.color;

        if (statusColor) {
          return (
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
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

        // Fallback for unknown status (no color from backend)
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">
            {statusName}
          </span>
        );
      }
    },
    {
      key: 'total_amount',
      label: 'Price',
      type: 'currency',
      render: (value) => (
        <span className=" font-medium">
          {formatCurrency(value)}
        </span>
      )
    }
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4 ml-2" />,
      iconPosition: 'right',
      variant: 'ghost',
      onClick: (row) => {
        // window.location.href = `/contracts/${row.id}`;
        router.push(`/contracts/${row.id}`);
      },
      className: 'text-primary flex items-center'
    }
  ];

  // Calculate summary data
  const summaryData = [
    {
      label: 'Contracts',
      value: pagination.total,
      icon: <FileText className="w-6 h-6" />
    },
    {
      label: 'Active',
      value: contracts.filter(c => {
        const statusName = c.status?.name || c.status;
        return statusName === 'active';
      }).length,
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      label: 'Completed',
      value: contracts.filter(c => {
        const statusName = c.status?.name || c.status;
        return statusName === 'completed';
      }).length,
      icon: <Calendar className="w-6 h-6" />
    }
  ];

  return (
    <div className="w-full  mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Contracts</h1>
          <ContractModal onContractAdded={handleContractAdded} />
        </div>
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
            dropdownOptions={[
              { label: 'All Status', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' }
            ]}
            onDropdownSelect={(option) => setStatusFilter(option.value)}
          >
            Status
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
          >
            Customer
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
          >
            Period
          </CustomButton>
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={search}
              onChange={setSearch}
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
              onClick={handleExport}
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </CustomButton>
          </div>
        </div>

        {/* Custom Table */}
        <CustomTable
          data={contracts}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage={
            debouncedSearch || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first contract.'
          }
          searchable={false}
          pagination={true}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          currentLimit={currentLimit}
          onLimitChange={handleLimitChange}
        />
      </CustomCard>
    </div>
  );
}