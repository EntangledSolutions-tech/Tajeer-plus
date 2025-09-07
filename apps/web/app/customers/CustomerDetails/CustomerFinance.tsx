'use client';
import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import {
  Search,
  Filter,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import { SummaryCard } from '../../reusableComponents/SummaryCard';

interface FinanceTransaction {
  id: string;
  date: string;
  transaction_type: string;
  description: string;
  method: string;
  amount: number;
  linked_invoice: string;
}

export default function CustomerFinance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  // Mock data
  const transactions: FinanceTransaction[] = [
    {
      id: '1',
      date: '14/03/2022',
      transaction_type: 'Contract Closure',
      description: 'Lorem Ipsum text',
      method: 'Cash',
      amount: 23456,
      linked_invoice: 'INV-9876'
    },
    {
      id: '2',
      date: '22/11/2021',
      transaction_type: 'Contract Closure',
      description: 'Lorem Ipsum text',
      method: 'Cash',
      amount: 9876,
      linked_invoice: 'INV-5432'
    },
    {
      id: '3',
      date: '30/07/2020',
      transaction_type: 'Car fixes',
      description: 'Lorem Ipsum text',
      method: 'Card',
      amount: 34567,
      linked_invoice: 'INV-8765'
    },
    {
      id: '4',
      date: '15/12/2020',
      transaction_type: 'Contract Opening',
      description: 'Lorem Ipsum text',
      method: 'Cash',
      amount: 32210,
      linked_invoice: 'INV-1122'
    }
  ];

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString()}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.linked_invoice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = transactionTypeFilter === 'all' || transaction.transaction_type === transactionTypeFilter;
    const matchesPeriod = periodFilter === 'all';
    return matchesSearch && matchesType && matchesPeriod;
  });

  const outstandingAmount = 5901.89;
  const totalPaidAmount = 7846.84;
  const totalCostAmount = 29348.98;

  const summaryData = [
    { label: 'Outstanding (SAR)', value: outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'Total Paid (SAR)', value: totalPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'Total Cost (SAR)', value: totalCostAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Summary Cards */}
      <SummaryCard data={summaryData} />

      {/* Filters and Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-lg border border-[#0065F2] bg-background text-[#0065F2] font-medium hover:bg-[#E3F0FF] hover:text-[#0065F2]"
            onClick={() => setTransactionTypeFilter('all')}
          >
            Transaction Type
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            className="rounded-lg border border-[#0065F2] bg-background text-[#0065F2] font-medium hover:bg-[#E3F0FF] hover:text-[#0065F2]"
            onClick={() => setPeriodFilter('all')}
          >
            Period
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex-1 flex justify-end gap-2">
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground px-4 py-2 focus:border-[#0065F2] hover:border-[#0065F2] focus:ring-0"
          />
          <Button variant="outline" size="icon" className="border border-border bg-background hover:bg-accent">
            <Filter className="w-5 h-5 text-primary" />
          </Button>
          <Button variant="outline" size="icon" className="border border-border bg-background hover:bg-accent">
            <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </Button>
        </div>
      </div>

      {/* Finance Transactions Table */}
      <div className="rounded-xl border border-border bg-card shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sidebar text-sidebar-foreground">
              <TableHead className="font-semibold text-sidebar-foreground">Date</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Transaction type</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Description</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Method</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Amount</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Linked Invoice</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-foreground mb-2">No finance transactions found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || transactionTypeFilter !== 'all' || periodFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'No finance transactions available for this customer.'
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-sidebar-accent/40 group">
                  <TableCell className="text-sidebar-foreground font-medium">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {transaction.transaction_type}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {transaction.method}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground">
                    <button className="text-[#0065F2] hover:text-[#0052CC] hover:underline">
                      {transaction.linked_invoice}
                    </button>
                  </TableCell>
                  <TableCell className="text-sidebar-foreground">
                    <button className="text-[#0065F2] hover:text-[#0052CC] hover:underline">
                      View Details
                    </button>
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