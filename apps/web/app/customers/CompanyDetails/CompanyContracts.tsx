import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { useHttpService } from '../../../lib/http-service';
import { toast } from '@kit/ui/sonner';

interface Contract {
  id: string;
  contract_number: string;
  status: string;
  vehicle_plate: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status_details?: {
    name: string;
    color: string;
  };
}

interface CompanyContractsProps {
  companyId: string;
}

export default function CompanyContracts({ companyId }: CompanyContractsProps) {
  const router = useRouter();
  const { getRequest } = useHttpService();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        company_id: companyId
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const result = await getRequest(`/api/contracts?${params}`);

      if (result.success && result.data) {
        setContracts(result.data.data || []);
        setTotalPages(result.data.totalPages || 0);
        setTotalContracts(result.data.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch contracts');
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, companyId, getRequest]);

  useEffect(() => {
    if (companyId) {
      fetchContracts();
    }
  }, [fetchContracts, companyId]);

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
          return (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                border: `1px solid ${statusColor}40`
              }}
            >
              {statusName}
            </span>
          );
        }

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
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchContracts}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Company Contracts</h3>
        <div className="text-sm text-gray-600">
          {totalContracts} contract{totalContracts !== 1 ? 's' : ''} found
        </div>
      </div>

      <CustomTable
        data={contracts}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={true}
        searchValue={search}
        onSearchChange={setSearch}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage
        }}
        emptyMessage="No contracts found for this company"
      />
    </div>
  );
}
