'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '../reusableComponents/SearchBar';
import CustomButton from '../reusableComponents/CustomButton';
import CustomCard from '../reusableComponents/CustomCard';
import { SummaryCard } from '../reusableComponents/SummaryCard';
import { Filter, Plus, FileSpreadsheet, ArrowRight, Users, Building2 } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@kit/ui/alert-dialog';
import CompanyModal from '../customers/CompanyModal/index';
import CustomTable, { TableColumn, TableAction } from '../reusableComponents/CustomTable';
import { useHttpService } from '../../lib/http-service';
import { useBranch } from '../../contexts/branch-context';

interface Company {
  id: string;
  company_name: string;
  tax_number: string;
  commercial_registration_number: string;
  mobile: string;
  email: string;
  city: string;
  rental_type: string;
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

export default function CompaniesList() {
  const router = useRouter();
  const { getRequest } = useHttpService();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(10);
  const { selectedBranch, isLoading: isBranchLoading } = useBranch();

  // Column definitions for Companies table
  const companyColumns: TableColumn[] = [
    {
      key: 'company_name',
      label: 'Company Name',
      type: 'text',
      sortable: true,
      className: 'max-w-xs',
      render: (value: any) => (
        <div className="min-w-0 break-words overflow-hidden text-wrap">{value}</div>
      )
    },
    {
      key: 'tax_number',
      label: 'Tax Number',
      type: 'text',
      className: 'max-w-[120px]',
      render: (value: any) => (
        <div className="break-words overflow-hidden">{value}</div>
      )
    },
    {
      key: 'commercial_registration_number',
      label: 'CR Number',
      type: 'text',
      className: 'max-w-[120px]',
      render: (value: any) => (
        <div className="break-words overflow-hidden">{value}</div>
      )
    },
    {
      key: 'mobile',
      label: 'Mobile',
      type: 'text',
      className: 'max-w-[140px]',
      render: (value: any) => (
        <div className="break-words overflow-hidden">{value}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      className: 'max-w-xs',
      render: (value: any) => (
        <div className="min-w-0 break-words overflow-hidden text-wrap">{value}</div>
      )
    },
    {
      key: 'city',
      label: 'City',
      type: 'text',
      className: 'max-w-[120px]',
      render: (value: any) => (
        <div className="break-words overflow-hidden">{value}</div>
      )
    },
    {
      key: 'rental_type',
      label: 'Rental Type',
      type: 'text',
      className: 'max-w-[150px]',
      render: (value: any) => (
        <div className="break-words overflow-hidden">{value}</div>
      )
    }
  ];

  // Actions for CustomTable
  const getActions = (): TableAction[] => [
    {
      key: 'view',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4" />,
      iconPosition: 'right',
      variant: 'ghost',
      className: 'text-primary flex items-center gap-2',
      onClick: (row) => {
        router.push(`/companies/${row.id}`);
      }
    }
  ];

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
  const [summaryStats, setSummaryStats] = useState({
    total: 0
  });

  const summaryData = [
    {
      label: 'Companies',
      value: summaryStats.total,
      icon: <Building2 className="w-6 h-6" />
    },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    // Don't fetch if branch context is still loading
    if (isBranchLoading) {
      return;
    }

    try {
      setLoading(true);

      // Fetch companies from /api/companies
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: currentLimit.toString(),
        search: debouncedSearch,
      });

      // Add selected branch filter if a branch is selected
      if (selectedBranch) {
        params.append('branch_id', selectedBranch.id);
      }

      const result = await getRequest(`/api/companies?${params}`);

      if (result.success && result.data) {
        const companiesData = result.data.companies || [];

        // Set companies state
        setCompanies(companiesData);

        // Update pagination with fresh data
        if (result.data.pagination) {
          setPagination({
            page: result.data.pagination.page,
            limit: result.data.pagination.limit,
            total: result.data.pagination.total,
            totalPages: result.data.pagination.totalPages,
            hasNextPage: result.data.pagination.hasNextPage,
            hasPrevPage: result.data.pagination.hasPrevPage
          });
        }

        // Update summary stats for companies
        setSummaryStats({
          total: result.data.pagination?.total || 0
        });
      } else {
        setError(result.error || 'Failed to fetch companies');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      setError('Error fetching data: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, currentLimit, selectedBranch, isBranchLoading, getRequest]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCompanyAdded = () => {
    setRefetchTrigger(prev => prev + 1);
    fetchCompanies();
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

  return (
    <div className="w-full mx-auto">
      {/* Error AlertDialog */}
      {error && (
        <AlertDialog open={!!error}>
          <AlertDialogContent className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Heading and Add Company Button */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Companies</h1>
        <CompanyModal onCompanyAdded={handleCompanyAdded} />
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
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </CustomButton>
          </div>
        </div>

        {/* CustomTable */}
        <CustomTable
          data={companies}
          columns={companyColumns}
          loading={loading}
          tableBackground="transparent"
          emptyMessage={
            search
              ? 'Try adjusting your search.'
              : 'Get started by adding your first company.'
          }
          emptyIcon={
            <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          actions={getActions()}
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
            console.log('Sort:', column, direction);
          }}
        />
      </CustomCard>
    </div>
  );
}

