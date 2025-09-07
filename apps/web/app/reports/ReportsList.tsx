'use client';

import Link from 'next/link';
import { useState } from 'react';
import CustomTabs from '../reusableComponents/CustomTabs';
import ContractsInvoicesReports from './_components/ContractsInvoicesReports';
import CustomerInventoryReports from './_components/CustomerInventoryReports';
import ExpenseRevenueReports from './_components/ExpenseRevenueReports';
import VehicleInventoryReports from './_components/VehicleInventoryReports';

const tabs = [
  { key: 'expense-revenue', label: 'Expense/Revenue',disabled: true, disabledReason: 'This feature is not available yet' },
  { key: 'contracts-invoices', label: 'Contracts/Invoices',disabled: true, disabledReason: 'This feature is not available yet' },
  { key: 'vehicle-inventory', label: 'Vehicle Inventory' },
  { key: 'customer-inventory', label: 'Customer Inventory',disabled: true, disabledReason: 'This feature is not available yet' },
];

export default function ReportsList() {
  const [activeTab, setActiveTab] = useState('vehicle-inventory');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'expense-revenue':
        return <ExpenseRevenueReports />;
      case 'contracts-invoices':
        return <ContractsInvoicesReports />;
      case 'vehicle-inventory':
        return <VehicleInventoryReports />;
      case 'customer-inventory':
        return <CustomerInventoryReports />;
      default:
        return <VehicleInventoryReports />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-transparent">
        <div className="px-6 pb-2">
          <Link href="/home" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">&lt; Back</Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white">Reports</div>
              <div className="text-lg text-white/80 font-medium">
                View and analyze your business data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mt-10">
        <div className="px-6 py-4">
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <div className="py-6">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
}
