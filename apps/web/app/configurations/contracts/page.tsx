"use client";

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import { toast } from '@kit/ui/sonner';
import Link from 'next/link';
import ContractStatusTab from './_components/ContractStatusTab';
import ContractAddOnsTab from './_components/ContractAddOnsTab';
import PermissionsValidationsTab from './_components/PermissionsValidationsTab';
import CustomTabs from '../../reusableComponents/CustomTabs';
import { useHttpService } from '../../../lib/http-service';

const tabs = [
  { key: 'templates', label: 'Templates', disabled: true, disabledReason: 'Templates module is under maintenance. Please try again later.' },
  { key: 'policies', label: 'Policies', disabled: true, disabledReason: 'Policies module is under maintenance. Please try again later.' },
  { key: 'fees', label: 'Fees', disabled: true, disabledReason: 'Fees module is under maintenance. Please try again later.' },
  { key: 'terms', label: 'Terms', disabled: true, disabledReason: 'Terms module is under maintenance. Please try again later.' },
  { key: 'add_ons', label: 'Contract Add-Ons' },
  { key: 'status', label: 'Status' },
  { key: 'permissions', label: 'Permissions & Validations' }
];

export default function ContractConfigurationsPage() {
  // State for all tabs
  const [activeTab, setActiveTab] = useState('add_ons');
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ type: 'status' | 'add_on', id: string, name: string } | null>(null);

  const { deleteRequest } = useHttpService();

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
      const endpoint = deleteItem.type === 'status'
        ? '/api/contract-configuration/statuses'
        : '/api/contract-configuration/add-ons';

      const response = await deleteRequest(endpoint, {
        body: JSON.stringify({ id: deleteItem.id })
      });

      if (response.success) {
        console.log(`${deleteItem.name} deleted successfully`);
        toast.success(`${deleteItem.name} deleted successfully`);
      } else {
        throw new Error(response.error || `Failed to delete ${deleteItem.type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${deleteItem.type}:`, error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(`An unexpected error occurred while deleting the ${deleteItem.type}`);
      }
    } finally {
      setDeleteItem(null);
    }
  };

  const handleDelete = (type: 'status' | 'add_on', id: string, name: string) => {
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

          {activeTab === 'add_ons' && (
            <ContractAddOnsTab loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'status' && (
            <ContractStatusTab loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'permissions' && (
            <PermissionsValidationsTab loading={loading} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteItem?.type === 'status' ? 'Status' : 'Add-On'}</AlertDialogTitle>
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
