"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import CustomButton from '../../../reusableComponents/CustomButton';
import ClassificationModal from './ClassificationModal';
import { useHttpService } from '../../../../lib/http-service';

interface Classification {
  id: string;
  code: number;
  classification: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ClassificationTab() {
  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassification, setEditingClassification] = useState<Classification | null>(null);
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
      key: 'classification',
      label: 'Classification',
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
      onClick: (row: Classification) => {
        setEditingClassification(row);
        setIsModalOpen(true);
      },
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5',
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Classification) => handleDelete(row.id),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    },
  ];

  const fetchClassifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        search: searchValue,
      });

      const response = await getRequest(`/api/customer-configurations/classifications?${params}`);

      if (response.error) {
        throw new Error(response.error);
      }

      setClassifications(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching classifications:', error);
      toast.error('Failed to fetch classifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this classification?')) {
      return;
    }

    try {
      const response = await deleteRequest(`/api/customer-configurations/classifications/${id}`);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Classification deleted successfully');
      fetchClassifications();
    } catch (error: any) {
      console.error('Error deleting classification:', error);
      toast.error(error.message || 'Failed to delete classification');
    }
  };

  const handleSubmit = async (values: { classification: string; description?: string }) => {
    try {
      let response;

      if (editingClassification) {
        response = await putRequest(`/api/customer-configurations/classifications/${editingClassification.id}`, values);
      } else {
        response = await postRequest('/api/customer-configurations/classifications', values);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(`Classification ${editingClassification ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingClassification(null);
      fetchClassifications();
    } catch (error: any) {
      console.error('Error submitting classification:', error);
      toast.error(error.message || `Failed to ${editingClassification ? 'update' : 'create'} classification`);
    }
  };

  const handleAddNew = () => {
    setEditingClassification(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClassification(null);
  };

  useEffect(() => {
    fetchClassifications();
  }, [currentPage, currentLimit, searchValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Classifications</h2>
        <CustomButton
          onClick={handleAddNew}
          icon={<Plus className="w-4 h-4" />}
          className="bg-primary hover:bg-primary/90"
        >
          Add classification
        </CustomButton>
      </div>

      {/* Table */}
      <CustomTable
        data={classifications}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search classifications..."
        pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentLimit={currentLimit}
        onLimitChange={(limit) => {
          setCurrentLimit(limit);
          setCurrentPage(1);
        }}
        emptyMessage="No classifications found"
      />

      {/* Modal */}
      <ClassificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingClassification={editingClassification}
      />
    </div>
  );
}
