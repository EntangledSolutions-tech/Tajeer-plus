'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '../reusableComponents/SearchBar';
import CustomButton from '../reusableComponents/CustomButton';
import CustomCard from '../reusableComponents/CustomCard';
import { SummaryCard } from '../reusableComponents/SummaryCard';
import { Filter, Plus, FileSpreadsheet, ChevronLeft, ChevronRight, Search, AlertTriangle, Eye, ArrowRight, Users, UserX, DollarSign, CheckCircle } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@kit/ui/alert-dialog';
import CustomerModal from './CustomerModal/index';
import CustomTable, { TableColumn, TableAction } from '../reusableComponents/CustomTable';
import Link from 'next/link';
import { Badge } from '@kit/ui/badge';
import { useHttpService } from '../../lib/http-service';
import { useBranch } from '../../contexts/branch-context';

interface Customer {
  id: string;
  name: string;
  id_number: string;
  mobile: string;
  classification: 'Individual' | 'Company';
  nationality: string;
  status: 'Active' | 'Blacklisted';
  last_contract_no: string;
  dues: number;
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

export default function CustomerList() {
  const router = useRouter();
  const { getRequest } = useHttpService();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(10);
  const { selectedBranch, isLoading: isBranchLoading } = useBranch();

  // Column definitions for CustomTable
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      sortable: true
    },
    {
      key: 'id_number',
      label: 'ID Number',
      type: 'text',
      sortable: true
    },
    {
      key: 'mobile',
      label: 'Mobile',
      type: 'text'
    },
    {
      key: 'classification',
      label: 'Classification',
      type: 'text',
      className: 'capitalize',
      render: (value: any, row: any) => {
        const classificationName = value || 'Unknown';
        const classificationInfo = statusConfig.classification[classificationName];

        if (classificationInfo) {
          return (
            <span
              className={classificationInfo.className}
              style={classificationInfo.style}
            >
              {classificationInfo.label}
            </span>
          );
        }

        // Fallback for unknown classification
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">
            {classificationName}
          </span>
        );
      }
    },
    {
      key: 'nationality',
      label: 'Nationality',
      type: 'text'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      width: '100px',
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
      key: 'last_contract_no',
      label: 'Last Contract',
      type: 'text'
    },
    {
      key: 'dues',
      label: 'Dues',
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
      icon: <ArrowRight className="w-4 h-4" />,
      iconPosition: 'right',
      variant: 'ghost',
      className: 'text-primary flex items-center gap-2',
      onClick: (row) => {
        router.push(`/customers/${row.id}`);
      }
    }
  ];

  // Status configuration for CustomTable - will be populated from database
  const [statusConfig, setStatusConfig] = useState<any>({ status: {}, classification: {} });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classification, setClassification] = useState('all');
  const [status, setStatus] = useState('all');
  const [blacklisted, setBlacklisted] = useState(false);
  const [withDues, setWithDues] = useState(false);
  const [myOfficeOnly, setMyOfficeOnly] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    active: 0,
    blacklisted: 0,
    withDues: 0
  });

  const summaryData = [
    {
      label: 'Customers',
      value: summaryStats.total,
      icon: <Users className="w-6 h-6" />
    },
    {
      label: 'Blacklisted',
      value: summaryStats.blacklisted,
      icon: <UserX className="w-6 h-6" />
    },
    {
      label: 'With Dues',
      value: summaryStats.withDues,
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      label: 'Active',
      value: summaryStats.active,
      icon: <CheckCircle className="w-6 h-6" />
    },
  ];

  // Fetch customer statuses and classifications from database
  const fetchCustomerStatuses = useCallback(async () => {
    try {
      // Fetch customer classifications
      const classificationResult = await getRequest('/api/customer-configurations/classifications?limit=-1');

      if (classificationResult.success && classificationResult.data) {
        // Convert statuses to the format expected by CustomTable
        const statusConfigData: any = {
          status: {
            // Use static status config for now since customer_statuses table has issues
            'Active': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Active',
              style: {
                backgroundColor: '#10B98120',
                color: '#10B981',
                border: '1px solid #10B98140'
              }
            },
            'Inactive': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Inactive',
              style: {
                backgroundColor: '#6B728020',
                color: '#6B7280',
                border: '1px solid #6B728040'
              }
            },
            'Blacklisted': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Blacklisted',
              style: {
                backgroundColor: '#EF444420',
                color: '#EF4444',
                border: '1px solid #EF444440'
              }
            },
            'Suspended': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Suspended',
              style: {
                backgroundColor: '#F59E0B20',
                color: '#F59E0B',
                border: '1px solid #F59E0B40'
              }
            },
            'VIP': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'VIP',
              style: {
                backgroundColor: '#8B5CF620',
                color: '#8B5CF6',
                border: '1px solid #8B5CF640'
              }
            },
            'Corporate': {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              label: 'Corporate',
              style: {
                backgroundColor: '#3B82F620',
                color: '#3B82F6',
                border: '1px solid #3B82F640'
              }
            }
          },
          classification: {}
        };

        // Process classifications from API
        classificationResult.data.data?.forEach((classification: any) => {
          statusConfigData.classification[classification.classification] = {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: classification.classification,
            style: {
              backgroundColor: `${classification.color || '#6B7280'}20`, // 20% opacity
              color: classification.color || '#6B7280',
              border: `1px solid ${classification.color || '#6B7280'}40` // 40% opacity for border
            }
          };
        });

        setStatusConfig(statusConfigData);
      }
    } catch (err: any) {
      console.error('Error fetching customer statuses:', err);
      // Fallback to default status config if API fails
      setStatusConfig({
        status: {
          'Active': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Active',
            style: {
              backgroundColor: '#10B98120',
              color: '#10B981',
              border: '1px solid #10B98140'
            }
          },
          'Blacklisted': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Blacklisted',
            style: {
              backgroundColor: '#EF444420',
              color: '#EF4444',
              border: '1px solid #EF444440'
            }
          }
        },
        classification: {
          'Individual': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Individual',
            style: {
              backgroundColor: '#3B82F620',
              color: '#3B82F6',
              border: '1px solid #3B82F640'
            }
          },
          'Company': {
            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            label: 'Company',
            style: {
              backgroundColor: '#8B5CF620',
              color: '#8B5CF6',
              border: '1px solid #8B5CF640'
            }
          }
        }
      });
    }
  }, [getRequest]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    // Don't fetch if branch context is still loading
    if (isBranchLoading) {
      return;
    }

    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: currentLimit.toString(),
        search: debouncedSearch,
        classification: classification,
        status: status,
        blacklisted: blacklisted.toString(),
        withDues: withDues.toString(),
        myOfficeOnly: myOfficeOnly.toString()
      });

      // Add selected branch filter if a branch is selected
      if (selectedBranch) {
        params.append('branch_id', selectedBranch.id);
      }

      const result = await getRequest(`/api/customers?${params}`);

      if (result.success && result.data) {
        setCustomers(result.data.customers || []);
        setPagination(result.data.pagination || pagination);

        setSummaryStats(result.data.summaryStats || {
          total: 0,
          active: 0,
          blacklisted: 0,
          withDues: 0
        });
      } else {
        setError(result.error || 'Failed to fetch customers');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      setError('Error fetching customers: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, currentLimit, classification, status, blacklisted, withDues, myOfficeOnly, selectedBranch, isBranchLoading, getRequest]);

  useEffect(() => {
    fetchCustomerStatuses();
    fetchCustomers();
  }, [fetchCustomerStatuses, fetchCustomers]);

  const handleCustomerAdded = () => {
    setRefetchTrigger(prev => prev + 1);
    fetchCustomers();
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
      // Build query parameters for export
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (classification !== 'all') params.append('classification', classification);
      if (blacklisted) params.append('blacklisted', 'true');

      const result = await getRequest(`/api/customers/export?${params.toString()}`);

      if (result.success && result.data) {
        // Create blob and download
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(result.error || 'Failed to export customers');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export customers');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full  mx-auto">
      {/* Error AlertDialog */}
      {error && (
        <AlertDialog open={!!error}>
          <AlertDialogContent className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Heading and Add Customer Button */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Customers</h1>
        <CustomerModal onCustomerAdded={handleCustomerAdded} />
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
              { label: 'All Classifications', value: 'all' },
              { label: 'Individual', value: 'individual' },
              { label: 'Company', value: 'company' }
            ]}
            onDropdownSelect={(option) => setClassification(option.value)}
          >
            Classification
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={[
              { label: 'All', value: 'all' },
              { label: 'Blacklisted', value: 'blacklisted' },
              { label: 'Not Blacklisted', value: 'not_blacklisted' }
            ]}
            onDropdownSelect={(option) => setBlacklisted(option.value === 'blacklisted')}
          >
            Blacklisted
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={[
              { label: 'All', value: 'all' },
              { label: 'With Dues', value: 'with_dues' },
              { label: 'No Dues', value: 'no_dues' }
            ]}
            onDropdownSelect={(option) => setWithDues(option.value === 'with_dues')}
          >
            With Dues
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            size="sm"
          >
            My Office only
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
          data={customers}
          columns={columns}
          loading={loading}
          tableBackground="transparent"
          emptyMessage={
            search || classification !== 'all' || status !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first customer.'
          }
          emptyIcon={
            <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a5 5 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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