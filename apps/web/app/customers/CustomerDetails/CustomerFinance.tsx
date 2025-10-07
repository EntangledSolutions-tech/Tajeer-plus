'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import { SummaryCard } from '../../reusableComponents/SummaryCard';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { SimpleSelect } from '../../reusableComponents/CustomSelect';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { useHttpService } from '../../../lib/http-service';
import { toast } from '@kit/ui/sonner';

interface FinanceTransaction {
  id: string;
  transaction_date: string;
  transaction_type: string;
  description: string;
  payment_method: string;
  amount: number;
  invoice_number: string;
  transaction_number: string;
  currency: string;
  created_at: string;
}

interface CustomerFinanceProps {
  customerId: string;
}

export default function CustomerFinance({ customerId }: CustomerFinanceProps) {
  const { getRequest } = useHttpService();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [summaryData, setSummaryData] = useState({
    outstanding: 0,
    totalPaid: 0,
    totalCost: 0
  });
  const [loading, setLoading] = useState({
    transactions: false,
    summary: false
  });

  // Fetch customer finance transactions
  const fetchCustomerTransactions = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const response = await getRequest(`/api/finance/customer-transactions/${customerId}`);

      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
      } else {
        console.error('Error fetching customer transactions:', response.error);
        toast.error('Failed to load customer transactions');
      }
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      toast.error('An unexpected error occurred while loading transactions');
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Fetch customer finance summary
  const fetchCustomerSummary = async () => {
    try {
      setLoading(prev => ({ ...prev, summary: true }));
      const response = await getRequest(`/api/finance/customer-summary/${customerId}`);

      if (response.success && response.data) {
        setSummaryData({
          outstanding: response.data.outstanding || 0,
          totalPaid: response.data.totalPaid || 0,
          totalCost: response.data.totalCost || 0
        });
      } else {
        console.error('Error fetching customer summary:', response.error);
        toast.error('Failed to load customer summary');
      }
    } catch (error) {
      console.error('Error fetching customer summary:', error);
      toast.error('An unexpected error occurred while loading summary');
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (customerId) {
      fetchCustomerTransactions();
      fetchCustomerSummary();
    }
  }, [customerId]);

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = transactionTypeFilter === 'all' || transaction.transaction_type === transactionTypeFilter;
    const matchesPeriod = periodFilter === 'all';
    return matchesSearch && matchesType && matchesPeriod;
  });

  const summaryDataArray = [
    { label: 'Outstanding (SAR)', value: summaryData.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'Total Paid (SAR)', value: summaryData.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'Total Cost (SAR)', value: summaryData.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  ];

  // Table configuration
  const columns: TableColumn[] = [
    {
      key: 'transaction_date',
      label: 'Date',
      type: 'text',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'transaction_type',
      label: 'Transaction Type',
      type: 'text'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text'
    },
    {
      key: 'payment_method',
      label: 'Method',
      type: 'text'
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'invoice_number',
      label: 'Linked Invoice',
      type: 'text',
      render: (value: string) => (
        <button className="text-primary hover:text-primary/80 hover:underline">
          {value}
        </button>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <span>→</span>,
      variant: 'ghost',
      onClick: (row) => {
        // Handle view details action
        console.log('View details for transaction:', row.id);
      },
      className: 'text-primary underline',
      iconPosition: 'right'
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Summary Cards */}
      <SummaryCard data={summaryDataArray} />

      {/* Filters and Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-4">
          <SimpleSelect
            value={transactionTypeFilter}
            onChange={(value: string) => setTransactionTypeFilter(value)}
            options={[
              { value: 'all', label: 'All Transaction Types' },
              { value: 'Contract Closure', label: 'Contract Closure' },
              { value: 'Contract Opening', label: 'Contract Opening' },
              { value: 'Maintenance', label: 'Maintenance' },
              { value: 'Penalty', label: 'Penalty' },
              { value: 'Insurance', label: 'Insurance' }
            ]}
            className="w-48"
          />
          <SimpleSelect
            value={periodFilter}
            onChange={(value: string) => setPeriodFilter(value)}
            options={[
              { value: 'all', label: 'All Periods' },
              { value: 'this-month', label: 'This Month' },
              { value: 'last-month', label: 'Last Month' },
              { value: 'this-year', label: 'This Year' },
              { value: 'last-year', label: 'Last Year' }
            ]}
            className="w-32"
          />
        </div>
        <div className="flex-1 flex justify-end gap-2">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search transactions"
            width="w-72"
            variant="white-bg"
          />
          <CustomButton isSecondary size="sm" className="p-2">
            <Filter className="w-5 h-5 text-primary" />
          </CustomButton>
          <CustomButton isSecondary size="sm" className="p-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </CustomButton>
        </div>
      </div>

      {/* Finance Transactions Table */}
      <CustomTable
        data={filteredTransactions}
        columns={columns}
        actions={actions}
        loading={loading.transactions}
        emptyMessage="No finance transactions found"
        tableBackground="transparent"
        searchable={false}
        pagination={false}
      />
    </div>
  );
}