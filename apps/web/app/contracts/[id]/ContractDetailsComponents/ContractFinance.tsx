'use client';
import React, { useState, useEffect } from 'react';
import { SummaryCard } from '../../../reusableComponents/SummaryCard';
import CustomButton from '../../../reusableComponents/CustomButton';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import { Badge } from '@kit/ui/badge';
import { Plus } from 'lucide-react';

interface ContractFinanceProps {
  contractId: string | undefined;
}

// Mock data for payment history (from the image)
const paymentHistoryData = [
  {
    date: '14/03/2022',
    amount: 'SAR 23,456',
    method: 'Cash',
    notes: 'Lorem Ipsum is simply dummy text',
    highlighted: true // This row has the dotted border in the image
  },
  {
    date: '22/11/2021',
    amount: 'SAR 9,876',
    method: 'Cash',
    notes: 'Lorem Ipsum is simply dummy text',
    highlighted: false
  },
  {
    date: '30/07/2020',
    amount: 'SAR 34,567',
    method: 'Card',
    notes: 'Lorem Ipsum is simply dummy text',
    highlighted: false
  },
  {
    date: '15/12/2020',
    amount: 'SAR 32,210',
    method: 'Bank Transfer',
    notes: 'Lorem Ipsum is simply dummy text',
    highlighted: false
  }
];

// Mock data for other charges (from the image)
const otherChargesData = [
  {
    date: '14/03/2022',
    amount: 'SAR 23,456',
    status: 'Unpaid',
    type: 'Penalty',
    linkedInvoice: 'INV-9876',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    date: '22/11/2021',
    amount: 'SAR 9,876',
    status: 'Paid',
    type: 'Repair',
    linkedInvoice: 'INV-5432',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    date: '22/11/2021',
    amount: 'SAR 2,424',
    status: 'Paid',
    type: 'Maintenance',
    linkedInvoice: 'INV-1242',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    date: '22/11/2021',
    amount: 'SAR 1,346',
    status: 'Paid',
    type: 'Other',
    linkedInvoice: 'INV-1242',
    notes: 'Lorem Ipsum is simply dummy text'
  }
];

export default function ContractFinance({ contractId }: ContractFinanceProps) {
  const [loading, setLoading] = useState(true);

  // Summary data (from the image)
  const summaryData = [
    { label: 'Outstanding (SAR)', value: '5,901.89' },
    { label: 'Total Paid (SAR)', value: '7,846.84' },
    { label: 'Total Amount (SAR)', value: '29,348.98' }
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

      {/* Payment History Section */}
      <CollapsibleSection
        title="Payment History"
        defaultOpen={true}
        className="mb-6 mx-0"
        headerClassName="bg-[#F6F9FF]"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left py-3 px-4 text-primary font-medium">Date</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Method</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Notes</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {paymentHistoryData.map((payment, index) => (
                <tr
                  key={index}
                  className={`border-b border-[#E5E7EB] ${
                    payment.highlighted
                      ? 'border-2 border-dashed border-primary bg-blue-50'
                      : ''
                  }`}
                >
                  <td className="py-3 px-4 text-primary">{payment.date}</td>
                  <td className="py-3 px-4 text-primary font-medium">{payment.amount}</td>
                  <td className="py-3 px-4 text-primary">{payment.method}</td>
                  <td className="py-3 px-4 text-primary">{payment.notes}</td>
                  <td className="py-3 px-4 text-right">
                    <CustomButton
                      isText
                    >
                      View Details
                    </CustomButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Other Charges Section */}
      <CollapsibleSection
        title="Other Charges"
        defaultOpen={true}
        className="mb-6 mx-0"
        headerClassName="bg-[#F6F9FF]"
        headerButton={
          <CustomButton isSecondary icon={<Plus className="w-4 h-4" />} iconSide="left">
            Add Charge
          </CustomButton>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left py-3 px-4 text-primary font-medium">Date</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Status</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Type</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Linked Invoice</th>
                <th className="text-left py-3 px-4 text-primary font-medium">Notes</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {otherChargesData.map((charge, index) => (
                <tr key={index} className="border-b border-[#E5E7EB]">
                  <td className="py-3 px-4 text-primary">{charge.date}</td>
                  <td className="py-3 px-4 text-primary font-medium">{charge.amount}</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`${
                        charge.status === 'Paid'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      {charge.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-primary">{charge.type}</td>
                  <td className="py-3 px-4 text-primary hover:underline cursor-pointer">{charge.linkedInvoice}</td>
                  <td className="py-3 px-4 text-primary">{charge.notes}</td>
                  <td className="py-3 px-4 text-right">
                    <CustomButton
                      isText
                    >
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