import React, { useState } from 'react';
import { Search, Filter, Pencil } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';
import CustomTable, { TableColumn } from '../../reusableComponents/CustomTable';

const summaryCards = [
  { label: 'Net profit (SAR)', value: '39,248.72' },
  { label: 'Net Revenue (SAR)', value: '29,348.98' },
  { label: 'Total Spending (SAR)', value: '7,846.84' },
  { label: 'Total Receivable (SAR)', value: '47,095.89' },
];

const vehiclePricing = {
  purchaseDate: '06/04/2022',
  depreciationYears: 5,
  purchasePrice: 'SAR 24,252',
  leaseAmountIncrease: 'SAR 26,252',
};

const revenueRows = [
  { date: '03/14/2022', type: 'Contract Closure', desc: 'Lorem Ipsum text', transaction: 'Income', method: 'Cash', amount: 'SAR 23,456', invoice: 'INV-9876' },
  { date: '11/22/2021', type: 'Contract Closure', desc: 'Lorem Ipsum text', transaction: 'Income', method: 'Cash', amount: 'SAR 9,876', invoice: 'INV-5432' },
  { date: '07/30/2020', type: 'General spending', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 34,567', invoice: 'INV-8765' },
  { date: '01/05/2023', type: 'Tire Change', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 12,345', invoice: 'INV-2341' },
  { date: '09/12/2022', type: 'Maintenance', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 67,890', invoice: 'INV-6789' },
  { date: '05/19/2021', type: 'Maintenance', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 45,678', invoice: 'INV-3456' },
  { date: '02/28/2023', type: 'General spending', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 28,901', invoice: 'INV-7890' },
  { date: '12/15/2020', type: 'Contract Closure', desc: 'Lorem Ipsum text', transaction: 'Income', method: 'Cash', amount: 'SAR 32,210', invoice: 'INV-1122' },
];

const salesRows = [
  { date: '11/22/2021', type: 'Car Return', customer: 'Jordan Taylor', price: '1.00', invoice: 'View Invoice' },
  { date: '07/30/2020', type: 'Car Sale', customer: 'Ahmed Khan', price: 'SAR 1.00', invoice: 'View Invoice' },
];

export default function VehicleFinance() {
  const [revenueTab, setRevenueTab] = useState('All');
  const [salesTab, setSalesTab] = useState('All');

  // Define table columns for Revenue
  const revenueColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'type', label: 'Transaction type', type: 'text' },
    { key: 'desc', label: 'Description', type: 'text' },
    { key: 'transaction', label: 'Transaction', type: 'text' },
    { key: 'method', label: 'Method', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'text' },
    { key: 'invoice', label: 'Invoice', type: 'link' },
    { key: 'actions', label: '', type: 'action' }
  ];

  // Define table columns for Sales & Return
  const salesColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'customer', label: 'Customer', type: 'text' },
    { key: 'price', label: 'Price', type: 'text' },
    { key: 'invoice', label: '', type: 'link' }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="rounded-xl border border-primary/20 bg-white flex flex-col items-center py-6">
            <span className="text-3xl font-bold text-primary mb-1">{card.value}</span>
            <span className="text-sm text-primary/60 font-medium">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Vehicle Pricing & Depreciation */}
      <CollapsibleSection
        title="Vehicle Pricing & Depreciation"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
        headerButton={
          <CustomButton
            isSecondary
            size="sm"
            className="flex items-center gap-1 px-3 py-1"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </CustomButton>
        }
      >
        <div className="grid grid-cols-4 gap-8">
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Purchase Date</div>
            <div className="text-base text-primary font-bold">{vehiclePricing.purchaseDate}</div>
          </div>
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Number of depreciation years</div>
            <div className="text-base text-primary font-bold">{vehiclePricing.depreciationYears}</div>
          </div>
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Purchase Price</div>
            <div className="text-base text-primary font-bold">{vehiclePricing.purchasePrice}</div>
          </div>
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Lease Amount increase in case of insurance</div>
            <div className="text-base text-primary font-bold">{vehiclePricing.leaseAmountIncrease}</div>
          </div>
        </div>
      </CollapsibleSection>
      {/* Revenue Table */}
      <CollapsibleSection
        title="Revenue"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <RadioButtonGroup
            options={[
              { value: 'All', label: 'All' },
              { value: 'Income', label: 'Income' },
              { value: 'Expenses', label: 'Expenses' }
            ]}
            value={revenueTab}
            onChange={setRevenueTab}
            name="revenueFilter"
          />
          <div className="flex items-center gap-4">
            <SearchBar
              value=""
              onChange={() => {}}
              placeholder="Q Search"
              width="w-40"
              variant="white-bg"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-4 h-4" />
            </CustomButton>
            <CustomButton isSecondary size="sm" className="p-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16M4 4l8 8m0 0l8-8" /></svg>
            </CustomButton>
          </div>
        </div>
        <CustomTable
          data={revenueRows.filter(row => revenueTab === 'All' || row.transaction === revenueTab.slice(0, -1))}
          columns={revenueColumns}
          tableBackground="transparent"
          emptyMessage="No revenue data found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>
      {/* Sales & Return Table */}
      <CollapsibleSection
        title="Sales & Return"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
        headerButton={
          <CustomButton variant="primary" className="ml-2">
            Sell Car
          </CustomButton>
        }
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <RadioButtonGroup
            options={[
              { value: 'All', label: 'All' },
              { value: 'Sale', label: 'Sale' },
              { value: 'Return', label: 'Return' }
            ]}
            value={salesTab}
            onChange={setSalesTab}
            name="salesFilter"
          />
          <div className="flex items-center gap-4">
            <SearchBar
              value=""
              onChange={() => {}}
              placeholder="Q Search"
              width="w-40"
              variant="white-bg"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16M4 4l8 8m0 0l8-8" /></svg>
            </CustomButton>
          </div>
        </div>
        <CustomTable
          data={salesRows.filter(row => salesTab === 'All' || row.type === salesTab)}
          columns={salesColumns}
          tableBackground="transparent"
          emptyMessage="No sales data found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>
    </div>
  );
}