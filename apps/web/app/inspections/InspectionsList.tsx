'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, FileSpreadsheet, Plus, Eye, ArrowRight, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { SummaryCard } from '../reusableComponents/SummaryCard';
import { SearchBar } from '../reusableComponents/SearchBar';
import CustomButton from '../reusableComponents/CustomButton';
import CustomTable, { TableColumn, TableAction } from '../reusableComponents/CustomTable';
import CustomCard from '../reusableComponents/CustomCard';
import { CollapsibleSection } from '../reusableComponents/CollapsibleSection';
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

export default function InspectionsList() {
  const router = useRouter();

  // State management
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [inspectorFilter, setInspectorFilter] = useState('all');
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

  // Mock data for demonstration
  const mockInspections: Inspection[] = [
    {
      id: '1',
      inspection_id: 'INSP-1234',
      inspection_date: '2024-01-15',
      inspection_type: 'Check-out',
      status: 'Pending',
      inspector: 'Omar Al-Farsi',
      vehicle: {
        id: 'v1',
        plate_number: 'Z27846',
        make: 'Toyota',
        model: 'Camry',
        branch: 'Branch #1'
      },
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      inspection_id: 'INSP-5678',
      inspection_date: '2024-01-14',
      inspection_type: 'Check-in',
      status: 'Done',
      inspector: 'Bilal Al-Hakim',
      vehicle: {
        id: 'v2',
        plate_number: 'Z27847',
        make: 'Honda',
        model: 'Civic',
        branch: 'Branch #1'
      },
      created_at: '2024-01-14T14:30:00Z'
    },
    {
      id: '3',
      inspection_id: 'INSP-9101',
      inspection_date: '2024-01-13',
      inspection_type: 'Check-out',
      status: 'With Damages',
      inspector: 'Hassan Al-Jabari',
      vehicle: {
        id: 'v3',
        plate_number: 'Z27848',
        make: 'Ford',
        model: 'Focus',
        branch: 'Branch #2'
      },
      created_at: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      inspection_id: 'INSP-1121',
      inspection_date: '2024-01-12',
      inspection_type: 'Check-in',
      status: 'Done',
      inspector: 'Yusuf Al-Sayed',
      vehicle: {
        id: 'v4',
        plate_number: 'Z27849',
        make: 'Nissan',
        model: 'Altima',
        branch: 'Branch #1'
      },
      created_at: '2024-01-12T16:45:00Z'
    },
    {
      id: '5',
      inspection_id: 'INSP-3141',
      inspection_date: '2024-01-11',
      inspection_type: 'Check-out',
      status: 'Pending',
      inspector: 'Khalid Al-Rashid',
      vehicle: {
        id: 'v5',
        plate_number: 'Z27850',
        make: 'Hyundai',
        model: 'Elantra',
        branch: 'Branch #2'
      },
      created_at: '2024-01-11T11:20:00Z'
    }
  ];

  // Mock summary data
  const summaryData = [
    { label: 'Inspections', value: '120', icon: <Calendar className="w-6 h-6" /> },
    { label: 'Completed', value: '108', icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'With Damages', value: '54', icon: <AlertTriangle className="w-6 h-6" /> }
  ];

  // Filter inspections based on current filters
  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = !searchTerm ||
      inspection.inspection_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || inspection.vehicle.id === vehicleFilter;
    const matchesInspector = inspectorFilter === 'all' || inspection.inspector === inspectorFilter;

    return matchesSearch && matchesStatus && matchesVehicle && matchesInspector;
  });

  // Pagination
  const startIndex = (currentPage - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedInspections = filteredInspections.slice(startIndex, endIndex);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setInspections(paginatedInspections);
      setPagination(prev => ({
        ...prev,
        total: filteredInspections.length,
        totalPages: Math.ceil(filteredInspections.length / prev.limit)
      }));
      setLoading(false);
    }, 500);
  }, [currentPage, statusFilter, vehicleFilter, inspectorFilter, searchTerm]);

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
      render: (value: any) => (
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
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Done': 'bg-green-100 text-green-800',
          'With Damages': 'bg-red-100 text-red-800'
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
    // In a real app, you would refetch the data here
  };

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Vehicle Inspections</h1>
      </div>

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
            className={statusFilter === 'Pending' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => handleStatusFilter('Pending')}
          >
            Pending
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'Done' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => handleStatusFilter('Done')}
          >
            Done
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
            className={statusFilter === 'With Damages' ? 'bg-primary text-white border-primary' : ''}
            onClick={() => handleStatusFilter('With Damages')}
          >
            With Damages
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
          data={paginatedInspections}
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
