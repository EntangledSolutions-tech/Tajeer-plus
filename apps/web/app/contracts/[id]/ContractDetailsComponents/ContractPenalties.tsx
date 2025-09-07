'use client';
import React, { useState, useEffect } from 'react';
import { RadioButtonGroup } from '../../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import CustomButton from '../../../reusableComponents/CustomButton';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import { Badge } from '@kit/ui/badge';
import { Plus } from 'lucide-react';

interface ContractPenaltiesProps {
  contractId: string | undefined;
}

// Mock data for penalties (from the image)
const mockPenalties = [
  {
    id: 'PEN-001',
    date: '14/03/2022',
    amount: 'SAR 23,456',
    status: 'Unpaid',
    linkedInvoice: 'INV-9876',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    id: 'PEN-002',
    date: '22/11/2021',
    amount: 'SAR 9,876',
    status: 'Paid',
    linkedInvoice: 'INV-5432',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    id: 'PEN-003',
    date: '22/11/2021',
    amount: 'SAR 2,424',
    status: 'Paid',
    linkedInvoice: 'INV-1242',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    id: 'PEN-004',
    date: '22/11/2021',
    amount: 'SAR 1,346',
    status: 'Paid',
    linkedInvoice: 'INV-1242',
    notes: 'Lorem Ipsum is simply dummy text'
  }
];

export default function ContractPenalties({ contractId }: ContractPenaltiesProps) {
  const [penalties, setPenalties] = useState(mockPenalties);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchValue, setSearchValue] = useState('');

  // Filter penalties based on status and search
  const filteredPenalties = penalties.filter(penalty => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'unpaid' && penalty.status === 'Unpaid') ||
      (filterStatus === 'paid' && penalty.status === 'Paid');

    const matchesSearch = searchValue === '' ||
      penalty.amount.toLowerCase().includes(searchValue.toLowerCase()) ||
      penalty.linkedInvoice.toLowerCase().includes(searchValue.toLowerCase()) ||
      penalty.notes.toLowerCase().includes(searchValue.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const radioOptions = [
    { value: 'all', label: 'All invoices' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'paid', label: 'Paid' }
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
      {/* Penalties Section */}
      <CollapsibleSection
        title="Penalties"
        defaultOpen={true}
        className="mb-6 mx-0"
        headerClassName="bg-[#F6F9FF]"
        headerButton={
          <CustomButton isSecondary icon={<Plus className="w-4 h-4" />} iconSide="left">
            Add penalty
          </CustomButton>
        }
      >
        {/* Filter Options and Search */}
        <div className="flex items-center justify-between mb-4">
          <RadioButtonGroup
            options={radioOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            name="penaltiesFilter"
          />

          <div className="flex items-center gap-2">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search"
              width="w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left py-3 px-4 text-primary font-medium">Date</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Status</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Linked Invoice</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Notes</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPenalties.map((penalty, index) => (
                <tr key={penalty.id} className="border-b border-[#E5E7EB]">
                  <td className="py-3 px-4 text-primary">{penalty.date}</td>
                  <td className="py-3 px-4 text-primary font-medium">{penalty.amount}</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`${
                        penalty.status === 'Paid'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }`}
                    >
                      {penalty.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-primary hover:underline cursor-pointer">
                      {penalty.linkedInvoice}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-primary">{penalty.notes}</td>
                  <td className="py-3 px-4 text-right">
                    <CustomButton isText>
                      View Details
                    </CustomButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </div>
  );
}