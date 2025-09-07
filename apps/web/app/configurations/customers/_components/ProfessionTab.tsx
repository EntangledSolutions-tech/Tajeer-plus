"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import CustomButton from '../../../reusableComponents/CustomButton';
import ProfessionModal from './ProfessionModal';

interface Profession {
  id: string;
  code: number;
  profession: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfessionTab() {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfession, setEditingProfession] = useState<Profession | null>(null);
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
      key: 'profession',
      label: 'Profession',
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
      onClick: (row: Profession) => {
        setEditingProfession(row);
        setIsModalOpen(true);
      },
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5',
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Profession) => handleDelete(row.id),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    },
  ];

  const fetchProfessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        search: searchValue,
      });

      const response = await fetch(`/api/customer-configurations/professions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch professions');
      }

      const result = await response.json();
      setProfessions(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching professions:', error);
      toast.error('Failed to fetch professions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profession?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customer-configurations/professions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete profession');
      }

      toast.success('Profession deleted successfully');
      fetchProfessions();
    } catch (error: any) {
      console.error('Error deleting profession:', error);
      toast.error(error.message || 'Failed to delete profession');
    }
  };

  const handleSubmit = async (values: { profession: string; description?: string }) => {
    try {
      const url = editingProfession
        ? `/api/customer-configurations/professions/${editingProfession.id}`
        : '/api/customer-configurations/professions';

      const method = editingProfession ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingProfession ? 'update' : 'create'} profession`);
      }

      toast.success(`Profession ${editingProfession ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingProfession(null);
      fetchProfessions();
    } catch (error: any) {
      console.error('Error submitting profession:', error);
      toast.error(error.message || `Failed to ${editingProfession ? 'update' : 'create'} profession`);
    }
  };

  const handleAddNew = () => {
    setEditingProfession(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfession(null);
  };

  useEffect(() => {
    fetchProfessions();
  }, [currentPage, currentLimit, searchValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Profession</h2>
        <CustomButton
          onClick={handleAddNew}
          icon={<Plus className="w-4 h-4" />}
          className="bg-primary hover:bg-primary/90"
        >
          Add profession
        </CustomButton>
      </div>

      {/* Table */}
      <CustomTable
        data={professions}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search professions..."
        pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        currentLimit={currentLimit}
        onLimitChange={(limit) => {
          setCurrentLimit(limit);
          setCurrentPage(1);
        }}
        emptyMessage="No professions found"
      />

      {/* Modal */}
      <ProfessionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingProfession={editingProfession}
      />
    </div>
  );
}
