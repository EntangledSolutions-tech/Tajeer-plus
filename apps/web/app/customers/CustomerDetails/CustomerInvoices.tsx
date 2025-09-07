'use client';
import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import {
  Search,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { SummaryCard } from '../../reusableComponents/SummaryCard';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';
import CustomButton from '../../reusableComponents/CustomButton';

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  contract: string;
  amount: number;
  status: string;
  method: string;
}

export default function CustomerInvoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'INV-9876',
      date: '14/03/2022',
      contract: '123',
      amount: 1450,
      status: 'Unpaid',
      method: 'Cash'
    },
    {
      id: '2',
      invoice_number: 'INV-5432',
      date: '11/22/2021',
      contract: '123',
      amount: 1237,
      status: 'Unpaid',
      method: 'Bank Transfer'
    },
    {
      id: '3',
      invoice_number: 'INV-1122',
      date: '28/02/2023',
      contract: '123',
      amount: 1654,
      status: 'Paid',
      method: 'Card'
    },
    {
      id: '4',
      invoice_number: 'INV-3344',
      date: '15/01/2023',
      contract: '124',
      amount: 980,
      status: 'Paid',
      method: 'Cash'
    }
  ];

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString()}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'unpaid':
        return 'bg-blue-500 text-white';
      case 'paid':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.contract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const summaryData = [
    { label: 'Invoices', value: invoices.length },
    { label: 'Unpaid', value: invoices.filter(i => i.status === 'Unpaid').length },
    { label: 'Paid', value: invoices.filter(i => i.status === 'Paid').length },
  ];

  const radioOptions = [
    { value: 'all', label: 'All invoices' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'paid', label: 'Paid' }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Summary Cards */}
      <SummaryCard data={summaryData} />

      {/* Filters and Search */}
      <div className="flex items-center gap-4 mb-4">
        <RadioButtonGroup
          options={radioOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          name="statusFilter"
        />
        <div className="flex-1 flex justify-end gap-2">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search"
          />
          <CustomButton isSecondary size="sm" className="p-2">
            <Filter className="w-5 h-5 text-primary" />
          </CustomButton>
          <CustomButton isSecondary size="sm" className="p-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </CustomButton>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sidebar text-sidebar-foreground">
              <TableHead className="font-semibold text-sidebar-foreground">Invoice</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Date</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Contract</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Amount</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Status</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Method</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'No invoices available for this customer.'
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-sidebar-accent/40 group">
                  <TableCell className="text-sidebar-foreground font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {invoice.contract}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground">
                    <Badge className={getStatusBadgeColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {invoice.method}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground">
                    <div className="flex gap-2">
                      {invoice.status === 'Unpaid' && (
                        <button className="text-[#0065F2] hover:text-[#0052CC] hover:underline text-sm">
                          Settle Now
                        </button>
                      )}
                      <CustomButton isText>
                        View Details
                      </CustomButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}