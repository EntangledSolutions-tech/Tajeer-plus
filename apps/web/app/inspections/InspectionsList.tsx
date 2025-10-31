'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, FileSpreadsheet, ArrowRight, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { SummaryCard } from '../reusableComponents/SummaryCard';
import { SearchBar } from '../reusableComponents/SearchBar';
import CustomButton from '../reusableComponents/CustomButton';
import CustomTable, { TableColumn, TableAction } from '../reusableComponents/CustomTable';
import CustomCard from '../reusableComponents/CustomCard';
import InspectionModal from './InspectionModal';

interface Inspection {
  id: string;
  inspection_id: string;
  inspection_date: string;
  inspection_type: string;
  status: string;
  inspector: string;
  vehicle: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
    branch: string;
  };
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface InspectionWithDamages extends Inspection {
  total_damages?: number;
  exterior_damages?: number;
  interior_damages?: number;
}

export default function InspectionsList() {
  const router = useRouter();

  // State management
  const [inspections, setInspections] = useState<InspectionWithDamages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Summary state
  const [summaryData, setSummaryData] = useState([
    { label: 'Inspections', value: '0', icon: <Calendar className="w-6 h-6" /> },
    { label: 'Completed', value: '0', icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'With Damages', value: '0', icon: <AlertTriangle className="w-6 h-6" /> }
  ]);

  // Fetch inspections from API
  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/inspections?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inspections');
      }

      const result = await response.json();

      if (result.success) {
        setInspections(result.data);
        setPagination(result.pagination);

        // Calculate summary statistics
        const totalInspections = result.pagination.total;
        const completedCount = result.data.filter((i: InspectionWithDamages) => i.status === 'Completed').length;
        const withDamagesCount = result.data.filter((i: InspectionWithDamages) => 
          i.total_damages !== undefined && i.total_damages > 0
        ).length;

        setSummaryData([
          { label: 'Inspections', value: totalInspections.toString(), icon: <Calendar className="w-6 h-6" /> },
          { label: 'Completed', value: completedCount.toString(), icon: <CheckCircle className="w-6 h-6" /> },
          { label: 'With Damages', value: withDamagesCount.toString(), icon: <AlertTriangle className="w-6 h-6" /> }
        ]);
      }
    } catch (err) {
      console.error('Error fetching inspections:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inspections';
      setError(errorMessage);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, pagination.limit]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'inspection_date',
      label: 'Date',
      type: 'date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'inspection_id',
      label: 'Inspection ID',
      type: 'text',
      render: (value: string) => (
        <span className="font-medium text-primary">{value}</span>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      type: 'text',
      render: (value: Inspection['vehicle']) => (
        <span className="text-primary underline cursor-pointer hover:text-primary/80">
          {value.plate_number}
        </span>
      )
    },
    {
      key: 'inspection_type',
      label: 'Type',
      type: 'text'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      render: (value: string) => {
        const statusColors: { [key: string]: string } = {
          'In Progress': 'bg-yellow-100 text-yellow-800',
          'Completed': 'bg-green-100 text-green-800'
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'inspector',
      label: 'Inspector',
      type: 'text'
    }
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <ArrowRight className="w-4 h-4" />,
      variant: 'ghost',
      onClick: (row) => {
        router.push(`/inspections/${row.id}`);
      },
      className: 'text-primary',
      iconPosition: 'right'
    }
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleInspectionAdded = () => {
    // Refresh the list
    setIsModalOpen(false);
    fetchInspections();
  };

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Vehicle Inspections</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

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
            onClick={() => handleStatusFilter('all')}
          >
            All Status
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'In Progress' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => handleStatusFilter('In Progress')}
          >
            In Progress
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'Completed' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => handleStatusFilter('Completed')}
          >
            Completed
          </CustomButton>

          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search inspections..."
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
          data={inspections}
          columns={columns}
          actions={actions}
          loading={loading}
          tableBackground="transparent"
          emptyMessage={
            searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No inspections found.'
          }
          searchable={false}
          pagination={pagination.totalPages > 1}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          currentLimit={pagination.limit}
        />
      </CustomCard>

      {/* Inspection Modal */}
      <InspectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInspectionAdded}
      />
    </div>
  );
}
