'use client';

import React, { useState, useEffect } from 'react';
import { useBranches } from '../hooks/use-branches';
import { useBranch } from '../contexts/branch-context';
import CustomButton from '../app/reusableComponents/CustomButton';
import { BranchModal } from '../app/reusableComponents/BranchModal';
import { Plus } from 'lucide-react';
import { useHttpService } from '../lib/http-service';

interface BranchSelectorProps {
  variant?: 'transparent' | 'default';
  onCreateBranch?: () => void;
}

export function BranchSelector({ variant = 'default', onCreateBranch }: BranchSelectorProps) {
  const { postRequest } = useHttpService();
  const { data: branches, isLoading, error, refetch } = useBranches();
  const { selectedBranch, setSelectedBranch, isLoading: isContextLoading } = useBranch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Auto-select the first branch if no branch is selected
  useEffect(() => {
    if (!isLoading && !isContextLoading && branches && branches.length > 0 && !selectedBranch) {
      const firstBranch = branches[0];
      if (firstBranch) {
        console.log('Auto-selecting first branch:', firstBranch.name);
        setSelectedBranch(firstBranch);
      }
    }
  }, [branches, isLoading, isContextLoading, selectedBranch, setSelectedBranch]);

  // Transform branches to dropdown options
  const branchOptions = React.useMemo(() => {
    if (!branches) return [];

    const options = branches.map(branch => ({
      label: branch.name,
      value: branch.id,
    }));

    // Add "Create Branch" option at the end
    options.push({
      label: 'Create Branch',
      value: 'create-branch',
    });

    return options;
  }, [branches]);

  const handleBranchSelect = (option: { label: string; value: string }) => {
    if (option.value === 'create-branch') {
      setIsCreateModalOpen(true);
      return;
    }

    const branch = branches?.find(b => b.id === option.value);
    setSelectedBranch(branch || null);
  };

  const handleCreateBranch = async (values: any) => {
    setIsCreating(true);
    try {
      let createdBranch = null;

      // Call the parent's onCreateBranch if provided, otherwise use the default API implementation
      if (onCreateBranch) {
        await onCreateBranch();
      } else {
        // Default API implementation
        const response = await postRequest('/api/branches', values);

        if (!response.success) {
          throw new Error(response.error || 'Failed to create branch');
        }

        // Store the created branch data if available
        createdBranch = response.data?.branch;
      }

      setIsCreateModalOpen(false);
      // Refresh branches after creation
      await refetch();

      // Auto-select the newly created branch if available
      if (createdBranch) {
        setSelectedBranch(createdBranch);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedLabel = () => {
    if (!selectedBranch) return 'Select Branch';
    return selectedBranch.name;
  };

  if (error) {
    console.error('Error loading branches:', error);
    return (
      <div className={`rounded-lg border font-medium text-sm focus:ring-0 shadow-none px-4 py-2 text-red-600 ${
        variant === 'transparent'
          ? 'hover:bg-transparent border-white'
          : 'border-red-300 bg-white'
      }`}>
        Error loading branches
      </div>
    );
  }

  const getButtonProps = () => {
    if (variant === 'transparent') {
      return {
        isTransparent: true,
        className: "rounded-lg hover:bg-transparent border border-white font-medium text-sm focus:ring-0 shadow-none"
      };
    }

    return {
      className: "w-40 rounded-lg border border-[#CDE2FF] bg-white px-3 py-2 text-[#0065F2] font-medium text-sm focus:border-[#0065F2] focus:ring-0 shadow-none"
    };
  };

  return (
    <>
      <CustomButton
        isDropdown
        dropdownOptions={branchOptions}
        onDropdownSelect={handleBranchSelect}
        disabled={isLoading || isContextLoading}
        {...getButtonProps()}
      >
        {(isLoading || isContextLoading) ? 'Loading...' : getSelectedLabel()}
      </CustomButton>

      <BranchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBranch}
        mode="add"
        loading={isCreating}
      />
    </>
  );
}
