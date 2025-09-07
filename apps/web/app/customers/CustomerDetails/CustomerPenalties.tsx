'use client';
import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import {
  Search,
  Plus
} from 'lucide-react';

interface Penalty {
  id: string;
  date: string;
  amount: number;
  status: 'Unpaid' | 'Paid';
  linked_invoice: string;
  notes: string;
}

export default function CustomerPenalties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const penalties: Penalty[] = [
    {
      id: '1',
      date: '14/03/2022',
      amount: 23456,
      status: 'Unpaid',
      linked_invoice: 'INV-9876',
      notes: 'Lorem Ipsum is simply dummy text'
    },
    {
      id: '2',
      date: '22/11/2021',
      amount: 9876,
      status: 'Paid',
      linked_invoice: 'INV-5432',
      notes: 'Lorem Ipsum is simply dummy text'
    },
    {
      id: '3',
      date: '22/11/2021',
      amount: 2424,
      status: 'Paid',
      linked_invoice: 'INV-1242',
      notes: 'Lorem Ipsum is simply dummy text'
    },
    {
      id: '4',
      date: '22/11/2021',
      amount: 1346,
      status: 'Paid',
      linked_invoice: 'INV-1242',
      notes: 'Lorem Ipsum is simply dummy text'
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

  const filteredPenalties = penalties.filter(penalty => {
    const matchesSearch = penalty.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         penalty.linked_invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         penalty.amount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || penalty.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">Penalties</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 pl-10 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-[#0065F2] hover:border-[#0065F2] focus:ring-0"
            />
          </div>
          <Button className="bg-[#0065F2] text-white px-4 py-2 rounded-lg hover:bg-[#0056E0] transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add penalty
          </Button>
        </div>
      </div>

      {/* Radio Button Filters */}
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="penaltyStatus"
            value="all"
            checked={statusFilter === 'all'}
            onChange={() => setStatusFilter('all')}
            className="text-[#0065F2] focus:ring-[#0065F2]"
          />
          <span className="text-sidebar-foreground">All invoices</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="penaltyStatus"
            value="unpaid"
            checked={statusFilter === 'unpaid'}
            onChange={() => setStatusFilter('unpaid')}
            className="text-[#0065F2] focus:ring-[#0065F2]"
          />
          <span className="text-sidebar-foreground">Unpaid</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="penaltyStatus"
            value="paid"
            checked={statusFilter === 'paid'}
            onChange={() => setStatusFilter('paid')}
            className="text-[#0065F2] focus:ring-[#0065F2]"
          />
          <span className="text-sidebar-foreground">Paid</span>
        </label>
      </div>

      {/* Penalties Table */}
      <div className="rounded-xl border border-border bg-card shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sidebar text-sidebar-foreground">
              <TableHead className="font-semibold text-sidebar-foreground">Date</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Amount</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Status</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Linked Invoice</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground">Notes</TableHead>
              <TableHead className="font-semibold text-sidebar-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPenalties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-foreground mb-2">No penalties found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'No penalties available for this customer.'
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPenalties.map((penalty) => (
                <TableRow key={penalty.id} className="hover:bg-sidebar-accent/40 group">
                  <TableCell className="text-sidebar-foreground font-medium">
                    {penalty.date}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {formatCurrency(penalty.amount)}
                  </TableCell>
                  <TableCell className="text-sidebar-foreground">
                    <Badge className={getStatusBadgeColor(penalty.status)}>
                      {penalty.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sidebar-foreground">
                    <button className="text-[#0065F2] hover:text-[#0052CC] hover:underline">
                      {penalty.linked_invoice}
                    </button>
                  </TableCell>
                  <TableCell className="text-sidebar-foreground font-medium">
                    {penalty.notes}
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