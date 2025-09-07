'use client';

import React from 'react';
import { useBranch } from '../hooks';

export function BranchDisplay() {
  const { selectedBranch, isLoading } = useBranch();

  if (isLoading) {
    return <div>Loading branch...</div>;
  }

  if (!selectedBranch) {
    return <div>No branch selected</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-2">Selected Branch</h3>
      <div className="space-y-1">
        <p><strong>Name:</strong> {selectedBranch.name}</p>
        <p><strong>Code:</strong> {selectedBranch.code}</p>
        <p><strong>Address:</strong> {selectedBranch.address || 'N/A'}</p>
        <p><strong>Phone:</strong> {selectedBranch.phone || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedBranch.email || 'N/A'}</p>
        <p><strong>Manager:</strong> {selectedBranch.manager_name || 'N/A'}</p>
      </div>
    </div>
  );
}
