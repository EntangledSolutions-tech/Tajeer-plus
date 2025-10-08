'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@kit/ui/dialog';
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
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomSwitch from '../../../reusableComponents/CustomSwitch';
import CustomColorInput from '../../../reusableComponents/CustomColorInput';
import CustomModal from '../../../reusableComponents/CustomModal';
import { useHttpService } from '../../../../lib/http-service';

type ContractStatus = Database['public']['Tables']['contract_statuses']['Row'];

interface ContractStatusTabProps {
  loading: boolean;
  onDelete: (type: 'status', id: string, name: string) => void;
}

export default function ContractStatusTab({ loading, onDelete }: ContractStatusTabProps) {
  const [statuses, setStatuses] = useState<ContractStatus[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ContractStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { getRequest, postRequest, putRequest } = useHttpService();

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    description: Yup.string()
      .max(500, 'Description must be less than 500 characters'),
    color: Yup.string()
      .required('Color is required')
      .matches(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color code (e.g., #FF0000)'),
    is_active: Yup.boolean()
  });

  // Initial form values
  const initialValues = {
    name: '',
    description: '',
    color: '',
    is_active: true
  };

  // Debounce search input for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchStatuses();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await getRequest(`/api/contract-configuration/statuses?${params}`);

      if (response.success && response.data) {
        setStatuses(response.data.statuses || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0
        }));
      } else {
        console.error('Error fetching statuses:', response.error);
        setStatuses([]);
        if (response.error) {
          alert(`Error: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setStatuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      let response;

      if (editingStatus) {
        response = await putRequest('/api/contract-configuration/statuses', { ...values, id: editingStatus.id });
      } else {
        response = await postRequest('/api/contract-configuration/statuses', values);
      }

      if (response.success) {
        if (editingStatus) {
          setIsEditModalOpen(false);
        } else {
          setIsAddModalOpen(false);
        }
        resetForm();
        setEditingStatus(null);
        fetchStatuses();
      } else {
        throw new Error(response.error || 'Failed to save status');
      }
    } catch (error) {
      console.error('Error saving status:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred while saving the status');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (status: ContractStatus) => {
    setEditingStatus(status);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete('status', id, name);
  };

  const resetForm = () => {
    setEditingStatus(null);
  };

  const handleExport = async () => {
    try {
      const response = await getRequest('/api/contract-configuration/statuses');

      if (response.success && response.data) {
        const csvContent = [
          ['Code', 'Name', 'Description', 'Color', 'Status', 'Created At'],
          ...(response.data.statuses || []).map((status: any) => [
            status.code || '',
            status.name || '',
            status.description || '',
            status.color || '',
            status.is_active ? 'Active' : 'Inactive',
            status.created_at ? new Date(status.created_at).toLocaleDateString() : ''
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contract-statuses.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Export error:', response.error);
        if (response.error) {
          alert(`Export failed: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed due to an unexpected error');
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
    { key: 'description', label: 'Description', type: 'text' },
    {
      key: 'color',
      label: 'Color',
      type: 'text',
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: row.color || '#6B7280' }}
          />
          <span className="text-sm font-mono">{row.color || '#6B7280'}</span>
        </div>
      )
    },
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
        title="Contract Statuses"
        defaultOpen={true}
        headerButton={
          <div onClick={(e) => e.stopPropagation()}>
            <SimpleButton
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Status
            </SimpleButton>
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search statuses..."
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
          data={statuses}
          columns={columns}
          loading={isLoading}
          emptyMessage="No statuses found. Try adding your first status."
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

      {/* Add Modal */}
      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Contract Status"
        subtitle="Enter the details for the new contract status."
        maxWidth="sm:max-w-[425px]"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            <div className="grid gap-4 py-4 px-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="name"
                  label="Name"
                  required
                  className="col-span-3"
                  placeholder="Enter status name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter status description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomColorInput
                  name="color"
                  label="Color"
                  required
                  className="col-span-3"
                  placeholder="#6B7280"
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
                  Save Status
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contract Status"
        subtitle="Update the details for this contract status."
        maxWidth="sm:max-w-[425px]"
      >
        <Formik
          initialValues={{
            name: editingStatus?.name || '',
            description: editingStatus?.description || '',
            color: editingStatus?.color || '',
            is_active: editingStatus?.is_active ?? true
          }}
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
                  placeholder="Enter status name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter status description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomColorInput
                  name="color"
                  label="Color"
                  required
                  className="col-span-3"
                  placeholder="#6B7280"
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
                  Update Status
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>
    </>
  );
}
