'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Filter, FileSpreadsheet, MoreHorizontal, ChevronDown } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { ExpenseForm } from './ExpenseForm';
import { IncomeForm } from './IncomeForm';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useHttpService } from '../../../lib/http-service';

// Interfaces
interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
}

interface Vehicle {
  id: string;
  plate_number: string;
  make: { name: string };
  model: { name: string };
  make_year: string;
}

interface Contract {
  id: string;
  contract_number: string;
  customer_name: string;
  start_date: string;
  end_date: string;
}

interface ExpenseFormValues {
  amount: string;
  date: string;
  transactionType: string;
  vehicle: string;
  branch: string;
  employee: string;
  description: string;
}

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
  isIncome: boolean;
}


export default function RentalFinancesLayout() {
  const router = useRouter();
  const { getRequest } = useHttpService();

  // State management
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState({
    branches: false,
    vehicles: false,
    contracts: false,
    transactions: false,
    expenseSubmit: false,
    incomeSubmit: false,
    summary: false
  });

  // Summary data state
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0
  });

  // Calculate summary cards dynamically
  const summaryCards = [
    {
      title: 'Revenue',
      value: `SAR ${summaryData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">$</span>
      </div>
    },
    {
      title: 'Expenses',
      value: `SAR ${summaryData.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">↗</span>
      </div>
    },
    {
      title: 'Net Balance',
      value: `SAR ${summaryData.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">~</span>
      </div>
    }
  ];

  // Fetch summary data from API
  const fetchSummaryData = async (period: string = 'all') => {
    try {
      setLoading(prev => ({ ...prev, summary: true }));

      const response = await getRequest(`/api/finance/summary?period=${period}`);
      if (response.success && response.data) {
        setSummaryData({
          totalRevenue: response.data.summary.totalRevenue,
          totalExpenses: response.data.summary.totalExpenses,
          netBalance: response.data.summary.netBalance
        });
      }
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true, summary: true }));

      // Fetch both income and expense transactions
      const [incomeResponse, expenseResponse] = await Promise.all([
        getRequest('/api/finance/income?limit=-1'),
        getRequest('/api/finance/expense?limit=-1')
      ]);

      const incomeData = incomeResponse.success ? incomeResponse.data : { transactions: [] };
      const expenseData = expenseResponse.success ? expenseResponse.data : { transactions: [] };

      // Combine and format transactions
      const allTransactions: Transaction[] = [
        ...incomeData.transactions.map((t: any) => ({
          ...t,
          isIncome: true,
          transaction: 'Income'
        })),
        ...expenseData.transactions.map((t: any) => ({
          ...t,
          isIncome: false,
          transaction: 'Expense'
        }))
      ];

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

      setTransactions(allTransactions);

      // Fetch summary data from API (not from paginated transactions)
      await fetchSummaryData();
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  const [transactionFilter, setTransactionFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentLimit, setCurrentLimit] = React.useState(10);

  // API fetching functions
  const fetchBranches = async () => {
    try {
      setLoading(prev => ({ ...prev, branches: true }));
      const response = await getRequest('/api/branches');
      if (response.success && response.data) {
        setBranches(response.data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(prev => ({ ...prev, branches: false }));
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(prev => ({ ...prev, vehicles: true }));
      const response = await getRequest('/api/vehicles?limit=100');
      if (response.success && response.data) {
        setVehicles(response.data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(prev => ({ ...prev, contracts: true }));
      const response = await getRequest('/api/contracts?limit=100');
      if (response.success && response.data) {
        setContracts(response.data.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(prev => ({ ...prev, contracts: false }));
    }
  };

  // Form handlers
  const handleExpenseSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, expenseSubmit: true }));

      // The actual API call is now handled in ExpenseForm
      console.log('Expense submitted:', values);

      // Refresh transactions and summary data after successful submission
      await fetchTransactions();
      await fetchSummaryData();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setLoading(prev => ({ ...prev, expenseSubmit: false }));
    }
  };

  const handleIncomeSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, incomeSubmit: true }));

      // The actual API call is now handled in IncomeForm
      console.log('Income submitted:', values);

      // Refresh transactions and summary data after successful submission
      await fetchTransactions();
      await fetchSummaryData();
    } catch (error) {
      console.error('Error submitting income:', error);
    } finally {
      setLoading(prev => ({ ...prev, incomeSubmit: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBranches();
    fetchVehicles();
    fetchContracts();
    fetchTransactions();
  }, []);

  const filterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = transactionFilter === 'All' ||
      (transactionFilter === 'Income' && transaction.isIncome) ||
      (transactionFilter === 'Expense' && !transaction.isIncome);

    const matchesSearch = searchTerm === '' ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.employee_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const columns: TableColumn[] = [
    {
      key: 'transaction_date',
      label: 'Date',
      type: 'text',
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
      type: 'text',
      render: (value: string, row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isIncome
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'transaction_type',
      label: 'Transaction type',
      type: 'text',
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
      type: 'text',
      render: (value: number, row: any) => (
        <span className={row.isIncome ? 'text-green-600' : 'text-red-600'}>
          SAR {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <span>→</span>,
      variant: 'ghost',
      onClick: (row, index) => {
        console.log('View details for:', row.id, 'index:', index);
        const detailPath = row.isIncome ? `/finance/income/${row.id}` : `/finance/expense/${row.id}`;
        console.log('Navigating to:', detailPath);
        try {
          router.push(detailPath);
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback to window.location
          window.location.href = detailPath;
        }
      },
      className: 'text-primary',
      iconPosition: 'right'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/finance" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Rental Company Finances</h1>
            <p className="text-white/80 mt-2">
              Manage rental company financial transactions and reporting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CustomButton variant="primary" className="bg-transparent text-white border border-white hover:bg-white hover:text-primary hover:border-white">
                <Plus className="w-4 h-4 mr-2" />
                Add
                <ChevronDown className="w-4 h-4 ml-2" />
              </CustomButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsExpenseModalOpen(true)}>
                Expense
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsIncomeModalOpen(true)}>
                Income
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                  {loading.summary ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-sm text-primary font-medium">
                  {card.title}
                </div>
              </div>
            </div>
          </CustomCard>
        ))}
      </div>

      {/* Transactions Table */}
      <CustomCard shadow="sm" radius="xl" padding="none" className="overflow-hidden">
        {/* Filters and Search */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <RadioButtonGroup
            options={filterOptions}
            value={transactionFilter}
            onChange={setTransactionFilter}
            name="transactionFilter"
            className="flex gap-4"
          />
          <div className="flex items-center gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Q Search"
              width="w-72"
              variant="white-bg"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-5 h-5 text-primary" />
            </CustomButton>
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </CustomButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CustomButton isSecondary size="sm" className="p-2">
                  <MoreHorizontal className="w-5 h-5 text-primary" />
                </CustomButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuItem>Print Report</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CustomTable
          data={filteredTransactions}
          columns={columns}
          actions={actions}
          loading={false}
          emptyMessage="No transactions found"
          tableBackground="transparent"
          searchable={false}
          pagination={true}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredTransactions.length / currentLimit)}
          onPageChange={setCurrentPage}
          currentLimit={currentLimit}
          onLimitChange={setCurrentLimit}
        />
      </CustomCard>

      {/* Expense Modal */}
      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleExpenseSubmit}
        vehicles={vehicles}
        branches={branches}
        loading={loading.expenseSubmit}
      />

      {/* Income Modal */}
      <IncomeForm
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSubmit={handleIncomeSubmit}
        vehicles={vehicles}
        branches={branches}
        contracts={contracts}
        loading={loading.incomeSubmit}
      />
    </div>
  );
}
