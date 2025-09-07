'use client';
import React, { useState, useEffect } from 'react';
import CustomTable, { TableColumn } from '../../../reusableComponents/CustomTable';
import { SummaryCard } from '../../../reusableComponents/SummaryCard';
import { RadioButtonGroup } from '../../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import CustomButton from '../../../reusableComponents/CustomButton';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import { Badge } from '@kit/ui/badge';
import { FileSpreadsheet, Filter } from 'lucide-react';

interface ContractInvoicesProps {
  contractId: string | undefined;
}

// Mock data for invoices
const mockInvoices = [
  {
    id: 'INV-9876',
    invoiceNo: 'INV-9876',
    date: '14/03/2022',
    amount: 'SAR 23,456',
    status: 'Unpaid',
    method: '-'
  },
  {
    id: 'INV-5432',
    invoiceNo: 'INV-5432',
    date: '22/11/2021',
    amount: 'SAR 9,876',
    status: 'Paid',
    method: 'Cash'
  },
  {
    id: 'INV-8765',
    invoiceNo: 'INV-8765',
    date: '30/07/2020',
    amount: 'SAR 34,567',
    status: 'Paid',
    method: 'Card'
  },
  {
    id: 'INV-1122',
    invoiceNo: 'INV-1122',
    date: '15/12/2020',
    amount: 'SAR 32,210',
    status: 'Paid',
    method: 'Bank Transfer'
  }
];

export default function ContractInvoices({ contractId }: ContractInvoicesProps) {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchValue, setSearchValue] = useState('');

  // Summary calculations
  const totalInvoices = invoices.length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid').length;
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;

  // Filter invoices based on status and search
  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'unpaid' && invoice.status === 'Unpaid') ||
      (filterStatus === 'paid' && invoice.status === 'Paid');

    const matchesSearch = searchValue === '' ||
      invoice.invoiceNo.toLowerCase().includes(searchValue.toLowerCase()) ||
      invoice.amount.toLowerCase().includes(searchValue.toLowerCase()) ||
      invoice.method.toLowerCase().includes(searchValue.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const summaryData = [
    { label: 'Invoices', value: totalInvoices },
    { label: 'Unpaid', value: unpaidInvoices },
    { label: 'Paid', value: paidInvoices }
  ];

  const radioOptions = [
    { value: 'all', label: 'All invoices' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'paid', label: 'Paid' }
  ];

  const columns: TableColumn[] = [
    {
      key: 'invoiceNo',
      label: 'Invoice No.',
      type: 'text',
      sortable: true
    },
    {
      key: 'date',
      label: 'Date',
      type: 'text',
      sortable: true
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      render: (value: string) => (
        <Badge
          className={`${
            value === 'Paid'
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
          }`}
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'method',
      label: 'Method',
      type: 'text'
    },
    {
      key: 'actions',
      label: '',
      type: 'action',
      render: (value: string, row: any) => (
        <div className="flex gap-2">
          {row.status === 'Unpaid' && (
            <CustomButton
              variant="primary"
              size="sm"
            >
              Settle Now
            </CustomButton>
          )}
          <CustomButton
            isText
          >
            View Details
          </CustomButton>
        </div>
      )
    }
  ];

  useEffect(() => {
    // Mock loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [contractId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0065F2]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCard data={summaryData} />
      </div>

      {/* Invoices Section */}
      <CollapsibleSection
        title="Invoices"
        defaultOpen={true}
        className="mb-6 mx-0"
        headerClassName="bg-[#F6F9FF]"
      >
        <div className="flex items-center justify-between mb-4">
          <RadioButtonGroup
            options={radioOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            name="invoiceFilter"
          />

          <div className="flex items-center gap-2">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search"
              width="w-64"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-5 h-5 text-primary" />
            </CustomButton>
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </CustomButton>
          </div>
        </div>

        <CustomTable
          data={filteredInvoices}
          columns={columns}
          loading={false}
          emptyMessage="No invoices found"
          className="w-full"
          searchable={false}
          actionsColumn={false}
        />
      </CollapsibleSection>
    </div>
  );
}