"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import CustomButton from '../../../reusableComponents/CustomButton';
import NationalityModal from './NationalityModal';

interface Nationality {
  id: string;
  code: number;
  nationality: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function NationalityTab() {
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNationality, setEditingNationality] = useState<Nationality | null>(null);
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
      key: 'nationality',
      label: 'Nationality',
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
      onClick: (row: Nationality) => {
        setEditingNationality(row);
        setIsModalOpen(true);
      },
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5',
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Nationality) => handleDelete(row.id),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    },
  ];

  const fetchNationalities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        search: searchValue,
      });

      const response = await fetch(`/api/customer-configurations/nationalities?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch nationalities');
      }

      const result = await response.json();
      setNationalities(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      toast.error('Failed to fetch nationalities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this nationality?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customer-configurations/nationalities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete nationality');
      }

      toast.success('Nationality deleted successfully');
      fetchNationalities();
    } catch (error: any) {
      console.error('Error deleting nationality:', error);
      toast.error(error.message || 'Failed to delete nationality');
    }
  };

  const handleSubmit = async (values: { nationality: string; description?: string }) => {
    try {
      const url = editingNationality
        ? `/api/customer-configurations/nationalities/${editingNationality.id}`
        : '/api/customer-configurations/nationalities';

      const method = editingNationality ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingNationality ? 'update' : 'create'} nationality`);
      }

      toast.success(`Nationality ${editingNationality ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingNationality(null);
      fetchNationalities();
    } catch (error: any) {
      console.error('Error submitting nationality:', error);
      toast.error(error.message || `Failed to ${editingNationality ? 'update' : 'create'} nationality`);
    }
  };

  const handleAddNew = () => {
    setEditingNationality(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNationality(null);
  };

  useEffect(() => {
    fetchNationalities();
  }, [currentPage, currentLimit, searchValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nationality</h2>
        <CustomButton
          onClick={handleAddNew}
          icon={<Plus className="w-4 h-4" />}
          className="bg-primary hover:bg-primary/90"
        >
          Add Nationality
        </CustomButton>
      </div>

      {/* Table */}
      <CustomTable
        data={nationalities}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search nationalities..."
        pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentLimit={currentLimit}
        onLimitChange={(limit) => {
          setCurrentLimit(limit);
          setCurrentPage(1);
        }}
        emptyMessage="No nationalities found"
      />

      {/* Modal */}
      <NationalityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingNationality={editingNationality}
      />
    </div>
  );
}
