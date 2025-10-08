'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Database } from '../../../../lib/database.types';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { SimpleButton } from '../../../reusableComponents/CustomButton';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSwitch from '../../../reusableComponents/CustomSwitch';
import CustomModal from '../../../reusableComponents/CustomModal';
import { useHttpService } from '../../../../lib/http-service';

type VehicleActualUser = Database['public']['Tables']['vehicle_actual_users']['Row'];

interface ActualUsersProps {
  loading: boolean;
  onDelete: (type: 'actualUser', id: string, name: string) => void;
}

export default function ActualUsers({ loading, onDelete }: ActualUsersProps) {
  const { getRequest, postRequest, putRequest } = useHttpService();
  const [actualUsers, setActualUsers] = useState<VehicleActualUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingActualUser, setEditingActualUser] = useState<VehicleActualUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    is_active: Yup.boolean()
  });

  // Initial form values
  const getInitialValues = () => {
    if (modalMode === 'edit' && editingActualUser) {
      return {
        name: editingActualUser.name || '',
        is_active: editingActualUser.is_active ?? true
      };
    }

    return {
      name: '',
      is_active: true
    };
  };

  // Helper functions for modal operations
  const openAddModal = () => {
    setModalMode('add');
    setEditingActualUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (actualUser: VehicleActualUser) => {
    setModalMode('edit');
    setEditingActualUser(actualUser);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingActualUser(null);
  };

  // Debounce search input for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchActualUsers();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const fetchActualUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await getRequest(`/api/vehicle-configuration/actual-users?${params}`);

      if (response.error) {
        throw new Error(response.error);
      }

      setActualUsers(response.data.actualUsers || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching actual users:', error);
      setActualUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      let response;

      if (editingActualUser) {
        response = await putRequest('/api/vehicle-configuration/actual-users', { ...values, id: editingActualUser.id });
        if (response.error) {
          throw new Error(response.error);
        }
      } else {
        response = await postRequest('/api/vehicle-configuration/actual-users', values);
        if (response.error) {
          throw new Error(response.error);
        }
      }

      // Close modal and refresh data
      closeModal();
      fetchActualUsers();
    } catch (error) {
      console.error('Error saving actual user:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred while saving the actual user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (actualUser: VehicleActualUser) => {
    openEditModal(actualUser);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete('actualUser', id, name);
  };

  const resetForm = () => {
    setEditingActualUser(null);
  };

  const handleExport = async () => {
    try {
      const response = await getRequest('/api/vehicle-configuration/actual-users');

      if (response.error) {
        throw new Error(response.error);
      }

      const csvContent = [
        ['Code', 'Name', 'Status', 'Created At'],
        ...(response.data.actualUsers || []).map((user: any) => [
          user.code || '',
          user.name || '',
          user.is_active ? 'Active' : 'Inactive',
          user.created_at ? new Date(user.created_at).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vehicle-actual-users.csv';
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
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    {
      key: 'is_active',
      label: 'Is Active',
      type: 'badge',
      width: '100px',
      render: (value: any, row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  const actions: TableAction[] = [
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
        title="Vehicle Actual Users"
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
              Add Actual User
            </SimpleButton>
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search actual users..."
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
          data={actualUsers}
          columns={columns}
          loading={isLoading}
          emptyMessage="No actual users found. Try adding your first actual user."
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

      {/* Single Modal for Add/Edit */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === 'add' ? 'Add New Actual User' : 'Edit Actual User'}
        subtitle={modalMode === 'add' ? 'Enter the details for the new actual user.' : 'Update the details for this actual user.'}
        maxWidth="sm:max-w-[425px]"
      >
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <Form>
            <div className="grid gap-4 py-4 px-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="name"
                  label="Name"
                  required
                  className="col-span-3"
                  placeholder="Enter actual user name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomSwitch
                  name="is_active"
                  label="Active"
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="bg-white px-6 py-4 border-t border-primary/20 flex-shrink-0">
              <div className="flex justify-end">
                <CustomButton type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  {modalMode === 'add' ? 'Save Actual User' : 'Update Actual User'}
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>
    </>
  );
}
