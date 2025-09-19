'use client';

import { Button } from '@kit/ui/button';
import { ArrowLeft, ArrowRight, DollarSign, TrendingUp, TrendingDown, Plus, Filter, FileSpreadsheet, MoreVertical, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableAction, TableColumn } from '../../reusableComponents/CustomTable';
import { SearchBar } from '../../reusableComponents/SearchBar';

interface Transaction {
  id: string;
  date: string;
  transaction: string;
  transactionType: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function RentalCompanyFinances() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);

  // Dummy transaction data
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '03/14/2022',
      transaction: 'Income',
      transactionType: 'Contract Closure',
      description: 'Lorem Ipsum text',
      amount: 23456,
      type: 'income'
    },
    {
      id: '2',
      date: '11/22/2021',
      transaction: 'Income',
      transactionType: 'Contract Closure',
      description: 'Lorem Ipsum text',
      amount: 9876,
      type: 'income'
    },
    {
      id: '3',
      date: '07/30/2020',
      transaction: 'Expense',
      transactionType: 'General spending',
      description: 'Lorem Ipsum text',
      amount: 34567,
      type: 'expense'
    },
    {
      id: '4',
      date: '01/05/2023',
      transaction: 'Expense',
      transactionType: 'Tire Change',
      description: 'Lorem Ipsum text',
      amount: 12345,
      type: 'expense'
    },
    {
      id: '5',
      date: '09/12/2022',
      transaction: 'Expense',
      transactionType: 'Maintenance',
      description: 'Lorem Ipsum text',
      amount: 67890,
      type: 'expense'
    },
    {
      id: '6',
      date: '05/19/2021',
      transaction: 'Expense',
      transactionType: 'Maintenance',
      description: 'Lorem Ipsum text',
      amount: 45678,
      type: 'expense'
    },
    {
      id: '7',
      date: '02/28/2023',
      transaction: 'Expense',
      transactionType: 'General spending',
      description: 'Lorem Ipsum text',
      amount: 78901,
      type: 'expense'
    },
    {
      id: '8',
      date: '12/15/2020',
      transaction: 'Income',
      transactionType: 'Contract Closure',
      description: 'Lorem Ipsum text',
      amount: 32210,
      type: 'income'
    }
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: 'Revenue',
      value: 'SAR 12,450.00',
      icon: <DollarSign className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Expenses',
      value: 'SAR 10,000.00',
      icon: <TrendingUp className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Net Balance',
      value: 'SAR 2,450.00',
      icon: <TrendingDown className="w-6 h-6 text-gray-600" />
    }
  ];

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'date',
      label: 'Date',
      type: 'text',
      sortable: true,
      width: '120px'
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
      key: 'transactionType',
      label: 'Transaction type',
      type: 'text',
      sortable: true
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
            SAR {value.toLocaleString()}
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
      onClick: (row) => {
        console.log('View details for transaction:', row.id);
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
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
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
            onDropdownSelect={(option) => console.log('Transaction filter:', option.value)}
          >
            Transaction
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={periodOptions}
            onDropdownSelect={(option) => console.log('Period filter:', option.value)}
          >
            Period
          </CustomButton>
          <CustomButton
            isSecondary
            isOval
            isDropdown
            size="sm"
            dropdownOptions={transactionTypeOptions}
            onDropdownSelect={(option) => console.log('Type filter:', option.value)}
          >
            Transaction Type
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
          loading={false}
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
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
          currentLimit={currentLimit}
          onLimitChange={setCurrentLimit}
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
