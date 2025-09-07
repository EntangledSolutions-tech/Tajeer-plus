'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import Link from 'next/link';
import Makes from './_components/Makes';
import Models from './_components/Models';
import Colors from './_components/Colors';
import Statuses from './_components/Statuses';
import Owners from './_components/Owners';
import ActualUsers from './_components/ActualUsers';
import CustomTabs from '../../reusableComponents/CustomTabs';

export default function VehicleConfigurationPage() {
  // State for all tabs
  const [activeTab, setActiveTab] = useState('makes');
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ type: 'make' | 'model' | 'color' | 'status' | 'owner' | 'actualUser', id: string, name: string } | null>(null);

  const tabs = [
    { key: 'makes', label: 'Makes' },
    { key: 'models', label: 'Models' },
    { key: 'colors', label: 'Colors' },
    { key: 'statuses', label: 'Statuses' },
    { key: 'owner', label: 'Owner' },
    { key: 'actualUsers', label: 'Actual Users' },
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
      let endpoint = '';
      switch (deleteItem.type) {
        case 'make':
          endpoint = '/api/vehicle-configuration/makes';
          break;
        case 'model':
          endpoint = '/api/vehicle-configuration/models';
          break;
        case 'color':
          endpoint = '/api/vehicle-configuration/colors';
          break;
        case 'status':
          endpoint = '/api/vehicle-configuration/statuses';
          break;
        case 'owner':
          endpoint = '/api/vehicle-configuration/owners';
          break;
        case 'actualUser':
          endpoint = '/api/vehicle-configuration/actual-users';
          break;
      }

      const response = await fetch(`${endpoint}?id=${deleteItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      // Close the delete confirmation dialog
      setDeleteItem(null);

      // Force a page refresh to update the data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting item:', error);
      setDeleteItem(null);
    }
  };

  const handleDelete = (type: 'make' | 'model' | 'color' | 'status' | 'owner' | 'actualUser', id: string, name: string) => {
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
              <div className="text-3xl font-bold text-white">Vehicle Configuration</div>
              <div className="text-lg text-blue-100 font-medium">
                Manage vehicle makes, models, colors, and statuses
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
          {activeTab === 'makes' && (
            <Makes loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'models' && (
            <Models loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'colors' && (
            <Colors loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'statuses' && (
            <Statuses loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'owner' && (
            <Owners loading={loading} onDelete={handleDelete} />
          )}

          {activeTab === 'actualUsers' && (
            <ActualUsers loading={loading} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteItem?.type === 'make' ? 'make' : deleteItem?.type === 'model' ? 'model' : deleteItem?.type === 'color' ? 'color' : deleteItem?.type === 'status' ? 'status' : deleteItem?.type === 'owner' ? 'owner' : 'actual user'} "{deleteItem?.name}"? This action cannot be undone.
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
