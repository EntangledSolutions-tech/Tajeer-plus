"use client";

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import Link from 'next/link';
import ContractStatusTab from './_components/ContractStatusTab';
import CustomTabs from '../../reusableComponents/CustomTabs';

const tabs = [
  { key: 'templates', label: 'Templates', disabled: true, disabledReason: 'Templates module is under maintenance. Please try again later.' },
  { key: 'policies', label: 'Policies', disabled: true, disabledReason: 'Policies module is under maintenance. Please try again later.' },
  { key: 'fees', label: 'Fees', disabled: true, disabledReason: 'Fees module is under maintenance. Please try again later.' },
  { key: 'terms', label: 'Terms', disabled: true, disabledReason: 'Terms module is under maintenance. Please try again later.' },
  { key: 'status', label: 'Status' }
];

export default function ContractConfigurationsPage() {
  // State for all tabs
  const [activeTab, setActiveTab] = useState('status');
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ type: 'status', id: string, name: string } | null>(null);

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
      const response = await fetch('/api/contract-configuration/statuses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItem.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete status');
      }

      // Refresh the data or update the UI as needed
      console.log(`${deleteItem.name} deleted successfully`);
    } catch (error) {
      console.error('Error deleting status:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred while deleting the status');
      }
    } finally {
      setDeleteItem(null);
    }
  };

  const handleDelete = (type: 'status', id: string, name: string) => {
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
              <div className="text-3xl font-bold text-white">Contract Configurations</div>
              <div className="text-lg text-blue-100 font-medium">
                Manage contract templates, terms, and conditions
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
          {activeTab === 'templates' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Contract Templates</h3>
                <p className="text-gray-500 mt-2">Configure contract templates and settings</p>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Cancellation Policies</h3>
                <p className="text-gray-500 mt-2">Configure cancellation policies and penalties</p>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Late Return Fees</h3>
                <p className="text-gray-500 mt-2">Configure late return penalties and grace periods</p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600">Terms and Conditions</h3>
                <p className="text-gray-500 mt-2">Manage legal terms and conditions for contracts</p>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <ContractStatusTab loading={loading} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Status</AlertDialogTitle>
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
