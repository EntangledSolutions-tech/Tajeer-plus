'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import Link from 'next/link';
import InsuranceList from './_components/InsuranceList';
import InsurancePolicy from './_components/InsurancePolicy';
import CustomTabs from '../../reusableComponents/CustomTabs';

export default function InsuranceConfigurationPage() {
  // State for all tabs
  const [activeTab, setActiveTab] = useState('insurance-list');
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ type: 'insurance', id: string, name: string } | null>(null);

  const tabs = [
    { key: 'insurance-list', label: 'Insurance List' },
    { key: 'insurance-policy', label: 'Insurance Policy' },
  ];

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

  const handleDelete = (type: 'insurance', id: string, name: string) => {
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
              <div className="text-3xl font-bold text-white">Insurance Configurations</div>
              <div className="text-lg text-blue-100 font-medium">
                Manage insurance providers, coverage options, and rates
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mt-10">
        <div className="px-6 py-4">
          <CustomTabs
            className="justify-center"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <div className="py-6 px-0">
          {activeTab === 'insurance-list' && (
            <InsuranceList loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'insurance-policy' && (
            <InsurancePolicy loading={loading} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
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
