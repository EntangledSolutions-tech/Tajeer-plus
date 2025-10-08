'use client';

import { ArrowLeft, ArrowRight, DollarSign, TrendingUp, TrendingDown, Plus, Filter, FileSpreadsheet, MoreVertical, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableAction, TableColumn } from '../../reusableComponents/CustomTable';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { useHttpService } from '../../../lib/http-service';

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_date: string;
  amount: number;
  description: string;
  employee_name: string;
  status: string;
  transaction_type: {
    name: string;
    category: string;
  };
  branch?: {
    name: string;
  };
  vehicle?: {
    plate_number: string;
  };
  contract?: {
    contract_number: string;
  };
  transaction: string;
  type: 'income' | 'expense';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function RentalCompanyFinances() {
  const router = useRouter();
  const { getRequest } = useHttpService();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    revenue: 0,
    expenses: 0,
    netBalance: 0
  });

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
  const [transactionType, setTransactionType] = useState('all');
  const [period, setPeriod] = useState('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch transactions from API with pagination
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: currentLimit.toString(),
        search: debouncedSearch,
        transactionType: transactionType,
        period: period
      });

      // Fetch both income and expense transactions with pagination
      const [incomeResponse, expenseResponse] = await Promise.all([
        getRequest(`/api/finance/income?${params}`),
        getRequest(`/api/finance/expense?${params}`)
      ]);

      const incomeData = incomeResponse.success ? incomeResponse.data : { transactions: [], pagination: pagination };
      const expenseData = expenseResponse.success ? expenseResponse.data : { transactions: [], pagination: pagination };

      // Combine and format transactions
      const allTransactions: Transaction[] = [
        ...incomeData.transactions.map((t: any) => ({
          ...t,
          transaction: 'Income',
          type: 'income' as const
        })),
        ...expenseData.transactions.map((t: any) => ({
          ...t,
          transaction: 'Expense',
          type: 'expense' as const
        }))
      ];

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

      setTransactions(allTransactions);

      console.log('All transactions:', allTransactions);
      console.log('First transaction:', allTransactions[0]);

      // Calculate total count from both APIs
      const totalCount = (incomeData.pagination?.total || 0) + (expenseData.pagination?.total || 0);
      const totalPages = Math.ceil(totalCount / currentLimit);
      const hasNextPage = pagination.page < totalPages;
      const hasPrevPage = pagination.page > 1;

      setPagination({
        page: pagination.page,
        limit: currentLimit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      });

      // Calculate summary stats from all data (not just current page)
      const revenue = incomeData.transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      const expenses = expenseData.transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      setSummaryStats({
        revenue,
        expenses,
        netBalance: revenue - expenses
      });

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, currentLimit, transactionType, period, getRequest]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setCurrentLimit(newLimit);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  // Summary cards data
  const summaryCards = [
    {
      title: 'Revenue',
      value: `SAR ${summaryStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Expenses',
      value: `SAR ${summaryStats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <TrendingUp className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Net Balance',
      value: `SAR ${summaryStats.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <TrendingDown className="w-6 h-6 text-gray-600" />
    }
  ];

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'transaction_date',
      label: 'Date',
      type: 'text',
      sortable: true,
      width: '120px',
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      }
    },
    {
      key: 'transaction',
      label: 'Transaction',
      type: 'badge',
      width: '120px',
      render: (value: any, row: any) => {
        const isIncome = row.type === 'income';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isIncome
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'transaction_type',
      label: 'Transaction type',
      type: 'text',
      sortable: true,
      render: (value: any) => value?.name || 'N/A'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text'
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      align: 'right',
      sortable: true,
      render: (value: any, row: any) => {
        const isIncome = row.type === 'income';
        return (
          <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            SAR {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    }
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      iconPosition: 'right',
      icon: <ArrowRight className="w-4 h-4 ml-2" />,
      variant: 'ghost',
      className: 'text-primary flex items-center',
      onClick: (row, index) => {
        console.log('View Details clicked for row:', row, 'index:', index);
        const detailPath = row.type === 'income' ? `/finance/income/${row.id}` : `/finance/expense/${row.id}`;
        console.log('Navigating to:', detailPath);
        try {
          router.push(detailPath);
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback to window.location
          window.location.href = detailPath;
        }
      }
    }
  ];

  // Filter options
  const transactionOptions = [
    { label: 'All Transactions', value: 'all' },
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' }
  ];

  const periodOptions = [
    { label: 'All Periods', value: 'all' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Last Year', value: 'last_year' }
  ];

  const transactionTypeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Contract Closure', value: 'contract_closure' },
    { label: 'General spending', value: 'general_spending' },
    { label: 'Tire Change', value: 'tire_change' },
    { label: 'Maintenance', value: 'maintenance' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/finance" className="text-white hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Rental Company Finances</h1>
            <p className="text-white/80 mt-2">
              Manage rental company financial transactions and reporting
            </p>
          </div>
        </div>
        <CustomButton
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={handleRefresh}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </CustomButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <CustomCard key={index} className="bg-white" padding="default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="text-primary">
                  {card.icon}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-bold text-gray-800">
                  {card.value}
                </div>
                <div className="text-sm text-primary font-medium">
                  {card.title}
                </div>
              </div>
            </div>
          </CustomCard>
        ))}
      </div>

      {/* Transaction Table */}
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
            dropdownOptions={transactionOptions}
            onDropdownSelect={(option) => {
              setTransactionType(option.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            Transaction
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={periodOptions}
            onDropdownSelect={(option) => {
              setPeriod(option.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            Period
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={transactionTypeOptions}
            onDropdownSelect={(option) => {
              setTransactionType(option.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            Transaction Type
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
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </CustomButton>
            <CustomButton isSecondary size="sm" className="p-2">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </CustomButton>
          </div>
        </div>

        {/* CustomTable */}
        <CustomTable
          data={transactions}
          columns={columns}
          loading={loading}
          tableBackground="transparent"
          emptyMessage="No transactions found. Try adjusting your search or filters."
          emptyIcon={
            <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
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
            console.log('Sort:', column, direction);
          }}
        />
      </CustomCard>
    </div>
  );
}
