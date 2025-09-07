'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import Link from 'next/link';
import BranchesTab from './_components/BranchesTab';
import CustomTabs from '../../reusableComponents/CustomTabs';

  // Example of how to disable tabs dynamically based on conditions
  // You can also disable tabs based on user permissions, feature flags, etc.
  // const tabs = [
  //   { key: 'branch-info', label: 'Branch Info' },
  //   { key: 'target-settings', label: 'Target settings' },
  //   { key: 'city-regions', label: 'City/Regions' },
  //   { key: 'suppliers', label: 'Suppliers' },
  //   { key: 'bank-names', label: 'Bank Names' },
  //   { key: 'branches', label: 'Branches' },
  //   {
  //     key: 'finances',
  //     label: 'Finances',
  //     disabled: !userHasFinancePermission,
  //     disabledReason: 'You do not have permission to access finance settings.'
  //   },
  // ];

const tabs = [
  { key: 'branch-info', label: 'Branch Info' },
  { key: 'target-settings', label: 'Target settings' },
  { key: 'city-regions', label: 'City/Regions' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'bank-names', label: 'Bank Names' },
  { key: 'branches', label: 'Branches' },
  {
    key: 'finances',
    label: 'Finances',
    disabled: true,
    disabledReason: 'Finance module is under maintenance. Please try again later.'
  },
];

export default function RentalCompanyConfigurationsPage() {
  // State for all tabs
  const [activeTab, setActiveTab] = useState('branches');
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ type: 'branch', id: string, name: string } | null>(null);

  useEffect(() => {
    // Simulate loading for initial data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      // Here you would typically make an API call to delete the item
      console.log(`Deleting ${deleteItem.type}:`, deleteItem.id);

      // Close the dialog
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDelete = (type: 'branch', id: string, name: string) => {
    setDeleteItem({ type, id, name });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-transparent">
        <div className="px-6 pb-2">
          <Link href="/configurations" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">&lt; Back</Link>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white">Rental Company Configurations</div>
              <div className="text-lg text-blue-100 font-medium">
                Configure company settings, branches, and policies
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
        <div className="py-6 px-0">
          {activeTab === 'branch-info' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Branch Info</h3>
                <p className="text-gray-500 mt-2">Configure branch information settings</p>
              </div>
            </div>
          )}

          {activeTab === 'target-settings' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Target Settings</h3>
                <p className="text-gray-500 mt-2">Configure target and goal settings</p>
              </div>
            </div>
          )}

          {activeTab === 'city-regions' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">City/Regions</h3>
                <p className="text-gray-500 mt-2">Manage cities and regions</p>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Suppliers</h3>
                <p className="text-gray-500 mt-2">Manage supplier information</p>
              </div>
            </div>
          )}

          {activeTab === 'bank-names' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Bank Names</h3>
                <p className="text-gray-500 mt-2">Configure bank information</p>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <BranchesTab loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'finances' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Finances</h3>
                <p className="text-gray-500 mt-2">Configure financial settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteItem?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
