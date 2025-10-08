"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import CustomButton from '../../../reusableComponents/CustomButton';
import LicenseTypeModal from './LicenseTypeModal';
import { useHttpService } from '../../../../lib/http-service';

interface LicenseType {
  id: string;
  code: number;
  license_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function LicenseTypeTab() {
  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicenseType, setEditingLicenseType] = useState<LicenseType | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const columns: TableColumn[] = [
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      width: '100px',
    },
    {
      key: 'license_type',
      label: 'License Type',
      type: 'text',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'badge',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: LicenseType) => {
        setEditingLicenseType(row);
        setIsModalOpen(true);
      },
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5',
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: LicenseType) => handleDelete(row.id),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    },
  ];

  const fetchLicenseTypes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        search: searchValue,
      });

      const response = await getRequest(`/api/customer-configurations/license-types?${params}`);

      if (response.error) {
        throw new Error(response.error);
      }

      setLicenseTypes(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching license types:', error);
      toast.error('Failed to fetch license types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this license type?')) {
      return;
    }

    try {
      const response = await deleteRequest(`/api/customer-configurations/license-types/${id}`);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('License type deleted successfully');
      fetchLicenseTypes();
    } catch (error: any) {
      console.error('Error deleting license type:', error);
      toast.error(error.message || 'Failed to delete license type');
    }
  };

  const handleSubmit = async (values: { license_type: string; description?: string }) => {
    try {
      let response;

      if (editingLicenseType) {
        response = await putRequest(`/api/customer-configurations/license-types/${editingLicenseType.id}`, values);
      } else {
        response = await postRequest('/api/customer-configurations/license-types', values);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(`License type ${editingLicenseType ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingLicenseType(null);
      fetchLicenseTypes();
    } catch (error: any) {
      console.error('Error submitting license type:', error);
      toast.error(error.message || `Failed to ${editingLicenseType ? 'update' : 'create'} license type`);
    }
  };

  const handleAddNew = () => {
    setEditingLicenseType(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLicenseType(null);
  };

  useEffect(() => {
    fetchLicenseTypes();
  }, [currentPage, currentLimit, searchValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">License Types</h2>
        <CustomButton
          onClick={handleAddNew}
          icon={<Plus className="w-4 h-4" />}
          className="bg-primary hover:bg-primary/90"
        >
          Add license type
        </CustomButton>
      </div>

      {/* Table */}
      <CustomTable
        data={licenseTypes}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search license types..."
        pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentLimit={currentLimit}
        onLimitChange={(limit) => {
          setCurrentLimit(limit);
          setCurrentPage(1);
        }}
        emptyMessage="No license types found"
      />

      {/* Modal */}
      <LicenseTypeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingLicenseType={editingLicenseType}
      />
    </div>
  );
}
