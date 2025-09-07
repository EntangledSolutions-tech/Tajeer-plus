'use client';

import React from 'react';
import { useBranches } from '../hooks/use-branches';
import { useBranch } from '../contexts/branch-context';
import CustomButton from '../app/reusableComponents/CustomButton';

interface BranchSelectorProps {
  variant?: 'transparent' | 'default';
}

export function BranchSelector({ variant = 'default' }: BranchSelectorProps) {
  const { data: branches, isLoading, error } = useBranches();
  const { selectedBranch, setSelectedBranch } = useBranch();

  // Transform branches to dropdown options
  const branchOptions = React.useMemo(() => {
    if (!branches) return [];

    return branches.map(branch => ({
      label: branch.name,
      value: branch.id,
    }));
  }, [branches]);

  const handleBranchSelect = (option: { label: string; value: string }) => {
    const branch = branches?.find(b => b.id === option.value);
    setSelectedBranch(branch || null);
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
    <CustomButton
      isDropdown
      dropdownOptions={branchOptions}
      onDropdownSelect={handleBranchSelect}
      disabled={isLoading}
      {...getButtonProps()}
    >
      {isLoading ? 'Loading...' : getSelectedLabel()}
    </CustomButton>
  );
}
