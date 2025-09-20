"use client";

import { Button } from '@kit/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NationalityTab from './_components/NationalityTab';
import ProfessionTab from './_components/ProfessionTab';
import ClassificationTab from './_components/ClassificationTab';
import LicenseTypeTab from './_components/LicenseTypeTab';
import CustomerStatusTab from './_components/CustomerStatusTab';
import CustomTabs from '../../reusableComponents/CustomTabs';
import { useHttpService } from '../../lib/http-service';

const tabs = [
  { key: 'nationality', label: 'Nationality' },
  { key: 'profession', label: 'Profession' },
  { key: 'classification', label: 'Classifications' },
  { key: 'license-type', label: 'License types' },
  { key: 'status', label: 'Status' },
];

export default function CustomerConfigurationsPage() {
  const [activeTab, setActiveTab] = useState('nationality');
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ type: 'nationality' | 'profession' | 'classification' | 'license-type' | 'status', id: string, name: string } | null>(null);

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
      let endpoint = '';
      switch (deleteItem.type) {
        case 'nationality':
          endpoint = '/api/customer-configurations/nationalities';
          break;
        case 'profession':
          endpoint = '/api/customer-configurations/professions';
          break;
        case 'classification':
          endpoint = '/api/customer-configurations/classifications';
          break;
        case 'license-type':
          endpoint = '/api/customer-configurations/license-types';
          break;
        case 'status':
          endpoint = '/api/customer-configuration/statuses';
          break;
      }

      const response = await deleteRequest(`${endpoint}/${deleteItem.id}`);

      if (response.success) {
        // Close the delete confirmation dialog
        setDeleteItem(null);
        // Force a page refresh to update the data
        window.location.reload();
      } else {
        throw new Error(response.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setDeleteItem(null);
    }
  };

  const handleDelete = (type: 'nationality' | 'profession' | 'classification' | 'license-type' | 'status', id: string, name: string) => {
    setDeleteItem({ type, id, name });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'nationality':
        return <NationalityTab />;
      case 'profession':
        return <ProfessionTab />;
      case 'classification':
        return <ClassificationTab />;
      case 'license-type':
        return <LicenseTypeTab />;
      case 'status':
        return <CustomerStatusTab loading={loading} onDelete={handleDelete} />;
      default:
        return <NationalityTab />;
    }
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
              <div className="text-3xl font-bold text-white">Customer Configurations</div>
              <div className="text-lg text-blue-100 font-medium">
                Manage customer types, validation rules, and settings
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
          {renderActiveComponent()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteItem?.type === 'nationality' ? 'nationality' : deleteItem?.type === 'profession' ? 'profession' : deleteItem?.type === 'classification' ? 'classification' : deleteItem?.type === 'license-type' ? 'license type' : 'status'} "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
