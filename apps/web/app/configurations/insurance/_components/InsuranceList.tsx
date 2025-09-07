'use client';

import { useState, useEffect } from 'react';
import { Info, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import CustomButton from '../../../reusableComponents/CustomButton';
import CollapsibleSection from '../../../reusableComponents/CollapsibleSection';
import SimpleInsuranceModal from './SimpleInsuranceModal';
import { toast } from 'sonner';

interface InsuranceOption {
  id: string;
  code: number;
  name: string;
  deductible_premium: number;
  rental_increase_type: 'value' | 'percentage';
  rental_increase_value: number | null;
  rental_increase_percentage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InsuranceListProps {
  loading: boolean;
  onDelete: (type: 'insurance', id: string, name: string) => void;
}

export default function InsuranceList({ loading, onDelete }: InsuranceListProps) {
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deleteOption, setDeleteOption] = useState<InsuranceOption | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<InsuranceOption | null>(null);

  // Fetch insurance options from API
  const fetchInsuranceOptions = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch('/api/insurance-options');
      if (!response.ok) {
        throw new Error('Failed to fetch insurance options');
      }
      const data = await response.json();
      setInsuranceOptions(data.insuranceOptions || []);
    } catch (error) {
      console.error('Error fetching insurance options:', error);
      toast.error('Failed to fetch insurance options');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceOptions();
  }, []);

    // Handle form submission (add/edit)
  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      if (editingOption) {
        // Update existing option
        const response = await fetch(`/api/insurance-options/${editingOption.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update insurance option');
        }

        const data = await response.json();
        setInsuranceOptions(insuranceOptions.map(o => o.id === editingOption.id ? data.insuranceOption : o));
        toast.success('Insurance option updated successfully');
      } else {
        // Create new option
        const response = await fetch('/api/insurance-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create insurance option');
        }

        const data = await response.json();
        setInsuranceOptions([...insuranceOptions, data.insuranceOption]);
        toast.success('Insurance option created successfully');
      }

      setIsAddModalOpen(false);
      setEditingOption(null);
    } catch (error) {
      console.error('Error saving insurance option:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save insurance option');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEditOption = (option: InsuranceOption) => {
    setEditingOption(option);
    setIsAddModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (option: InsuranceOption) => {
    setDeleteOption(option);
    setIsDeleteModalOpen(true);
  };

  // Handle actual delete
  const handleConfirmDelete = async () => {
    if (!deleteOption) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/insurance-options/${deleteOption.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete insurance option');
      }

      setInsuranceOptions(insuranceOptions.filter(o => o.id !== deleteOption.id));
      toast.success('Insurance option deleted successfully');
    } catch (error) {
      console.error('Error deleting insurance option:', error);
      toast.error('Failed to delete insurance option');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteOption(null);
    }
  };



  // Column definitions for CustomTable
  const columns: TableColumn[] = [
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      width: '100px'
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text'
    },
    {
      key: 'deductible_premium',
      label: 'Deductible Premium',
      type: 'currency',
      render: (value: any, row: any) => (
        <div className="flex items-center gap-1">
          SAR {value.toLocaleString()}
          <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-xs text-primary">
            <Info className="w-3 h-3" />
          </div>
        </div>
      )
    },
    {
      key: 'rental_increase',
      label: 'Increase in rental amount',
      type: 'text',
      render: (value: any, row: any) => {
        const displayValue = row.rental_increase_type === 'percentage'
          ? `${row.rental_increase_percentage}%`
          : `SAR ${row.rental_increase_value?.toLocaleString()}`;

        return (
          <div className="flex items-center gap-1">
            {displayValue}
            <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-xs text-primary">
              <Info className="w-3 h-3" />
            </div>
          </div>
        );
      }
    }
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5',
      onClick: (row: any) => handleEditOption(row)
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      onClick: (row: any) => handleDeleteClick(row)
    }
  ];

  const addInsuranceButton = (
    <CustomButton
      className="bg-primary hover:bg-primary/90 text-white border border-primary rounded-md"
      icon={<Plus className="w-4 h-4" />}
      onClick={() => setIsAddModalOpen(true)}
      disabled={isLoading}
    >
      Add Insurance
    </CustomButton>
  );

  return (
    <div className="space-y-4">
      <CollapsibleSection
        title="Insurance"
        defaultOpen={true}
        headerButton={addInsuranceButton}
      >
        <CustomTable
          data={insuranceOptions}
          columns={columns}
          actions={actions}
          loading={fetchLoading || loading}
          emptyMessage="No insurance options found"


        />
      </CollapsibleSection>

      {/* Simple Insurance Modal */}
      <SimpleInsuranceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingOption(null);
        }}
        onSubmit={handleSubmit}
        editingOption={editingOption}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Insurance Option</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteOption?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <CustomButton
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteOption(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
