'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import CollapsibleSection from '../../../reusableComponents/CollapsibleSection';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import InsuranceModal from './InsuranceModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import { toast } from 'sonner';
import { useHttpService } from '../../../../lib/http-service';

interface InsurancePolicy {
  id: string;
  name: string;
  policy_number: string;
  policy_amount: number;
  deductible_premium: number;
  policy_type: string;
  policy_company: string;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InsurancePolicyProps {
  loading: boolean;
}

export default function InsurancePolicy({ loading }: InsurancePolicyProps) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deletePolicy, setDeletePolicy] = useState<InsurancePolicy | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setFetchLoading(true);
      const response = await getRequest('/api/insurance-policies');

      if (response.success && response.data) {
        setPolicies(response.data.policies || []);
      } else {
        throw new Error(response.error || 'Failed to fetch policies');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to fetch insurance policies');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Handle form submission (add/edit)
  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      let response;

      if (editingPolicy) {
        // Update existing policy
        response = await putRequest(`/api/insurance-policies/${editingPolicy.id}`, values);

        if (response.success && response.data) {
          setPolicies(policies.map(p => p.id === editingPolicy.id ? response.data.policy : p));
          toast.success('Insurance policy updated successfully');
        } else {
          throw new Error(response.error || 'Failed to update policy');
        }
      } else {
        // Create new policy
        response = await postRequest('/api/insurance-policies', values);

        if (response.success && response.data) {
          setPolicies([response.data.policy, ...policies]);
          toast.success('Insurance policy created successfully');
        } else {
          throw new Error(response.error || 'Failed to create policy');
        }
      }

      setIsModalOpen(false);
      setEditingPolicy(null);
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save policy');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEditPolicy = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setIsModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (policy: InsurancePolicy) => {
    setDeletePolicy(policy);
    setIsDeleteModalOpen(true);
  };

  // Handle actual delete
  const handleConfirmDelete = async () => {
    if (!deletePolicy) return;

    try {
      setIsLoading(true);
      const response = await deleteRequest(`/api/insurance-policies/${deletePolicy.id}`);

      if (response.success) {
        setPolicies(policies.filter(p => p.id !== deletePolicy.id));
        toast.success('Insurance policy deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete policy');
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setDeletePolicy(null);
    }
  };

  // Open add modal
  const handleAddPolicy = () => {
    setEditingPolicy(null);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  // Column definitions for CustomTable
  const columns: TableColumn[] = [
    {
      key: 'policy_number',
      label: 'Policy No.',
      type: 'text',
      width: '140px'
    },
    {
      key: 'name',
      label: 'Policy Name',
      type: 'text'
    },
    {
      key: 'policy_type',
      label: 'Type',
      type: 'text',
      render: (value: any) => (
        <span className="capitalize">
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'policy_company',
      label: 'Company',
      type: 'text'
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date',
      type: 'date'
    },
    {
      key: 'policy_amount',
      label: 'Policy Amount',
      type: 'currency'
    },
    {
      key: 'deductible_premium',
      label: 'Deductible Premium',
      type: 'currency'
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
      onClick: (row: any) => handleEditPolicy(row)
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

  const addPolicyButton = (
    <CustomButton
      className="bg-primary hover:bg-primary/90 text-white border border-primary rounded-md"
      icon={<Plus className="w-4 h-4" />}
      onClick={handleAddPolicy}
      disabled={isLoading}
    >
      Add Policy
    </CustomButton>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CollapsibleSection
        title="Insurance Policy"
        defaultOpen={true}
        headerButton={addPolicyButton}
      >
        <CustomTable
          data={policies}
          columns={columns}
          actions={actions}
          loading={fetchLoading || loading}
          emptyMessage="No insurance policies found"

        />
      </CollapsibleSection>

      {/* Insurance Modal */}
      <InsuranceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingPolicy={editingPolicy}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Insurance Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletePolicy?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <CustomButton
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletePolicy(null);
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
