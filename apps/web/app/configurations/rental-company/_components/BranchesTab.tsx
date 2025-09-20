'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Plus, Pencil, Trash2, FileSpreadsheet, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { SimpleButton } from '../../../reusableComponents/CustomButton';
import CustomButton from '../../../reusableComponents/CustomButton';
import { BranchModal } from '../../../reusableComponents/BranchModal';

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  city_region?: string;
  commercial_registration_number?: string;
  website?: string;
  branch_license_number?: string;
  is_rental_office?: boolean;
  has_no_cars?: boolean;
  has_cars_and_employees?: boolean;
  is_maintenance_center?: boolean;
  has_shift_system_support?: boolean;
  is_limousine_office?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchesTabProps {
  loading: boolean;
  onDelete: (type: 'branch', id: string, name: string) => void;
}

export default function BranchesTab({ loading, onDelete }: BranchesTabProps) {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(false);


  // Helper functions for modal operations
  const openAddModal = () => {
    setModalMode('add');
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setModalMode('edit');
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  // Debounce search input for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchBranches();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await fetch(`/api/branches?${params}`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data.branches || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBranch) {
        const response = await fetch(`/api/branches/${editingBranch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update branch');
        }
      } else {
        const response = await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create branch');
        }
      }

      // Close modal and refresh data
      closeModal();
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred while saving the branch');
      }
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  const handleEdit = (branch: Branch) => {
    openEditModal(branch);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete('branch', id, name);
  };

  const resetForm = () => {
    setEditingBranch(null);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/branches');
      if (!response.ok) throw new Error('Failed to export branches');
      const data = await response.json();

      const csvContent = [
        ['Code', 'Name', 'City/Region', 'Address', 'Phone', 'Email', 'Manager', 'Status', 'Created At'],
        ...(data.branches || []).map((branch: any) => [
          branch.code || '',
          branch.name || '',
          branch.city_region || '',
          branch.address || '',
          branch.phone || '',
          branch.email || '',
          branch.manager_name || '',
          branch.is_active ? 'Active' : 'Inactive',
          branch.created_at ? new Date(branch.created_at).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'branches.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns: TableColumn[] = [
    { key: 'code', label: 'Code', type: 'text', sortable: true },
    { key: 'name', label: 'Branch Name', type: 'text', sortable: true },
    { key: 'city_region', label: 'City/Region', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    {
      key: 'is_active',
      label: 'Status',
      type: 'badge',
      width: '100px',
      render: (value: any, row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      key: 'view',
      label: '',
      icon: <Eye className="w-4 h-4 text-gray-600" />,
      onClick: (row: any) => router.push(`/configurations/rental-company/branch/${row.id}`),
      variant: 'ghost',
      className: 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
    },
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: any) => handleEdit(row),
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5'
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: any) => handleDelete(row.id, row.name),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700'
    }
  ];

  return (
    <>
      <CollapsibleSection
        title="Branches"
        defaultOpen={true}
        headerButton={
          <div onClick={(e) => e.stopPropagation()}>
            <SimpleButton
              onClick={() => {
                resetForm();
                openAddModal();
              }}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </SimpleButton>
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search branches..."
              width="w-72"
            />
            <CustomButton
              isSecondary
              size="sm"
              className="p-2"
              onClick={handleExport}
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </CustomButton>
          </div>
        </div>

        <CustomTable
          data={branches}
          columns={columns}
          loading={isLoading}
          emptyMessage="No branches found. Try adding your first branch."
          actions={actions}
          searchable={false}
          pagination={true}
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={handlePageChange}
          currentLimit={pagination.limit}
          onLimitChange={handleLimitChange}
          selectable={false}
        />
      </CollapsibleSection>

      {/* Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={editingBranch || undefined}
      />
    </>
  );
}
