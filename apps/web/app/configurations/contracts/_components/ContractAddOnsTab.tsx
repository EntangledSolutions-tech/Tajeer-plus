'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import { toast } from '@kit/ui/sonner';
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
import CustomModal from '../../../reusableComponents/CustomModal';
import { useHttpService } from '../../../../lib/http-service';

type ContractAddOn = Database['public']['Tables']['contract_add_ons']['Row'];

interface ContractAddOnsTabProps {
  loading: boolean;
  onDelete: (type: 'add_on', id: string, name: string) => void;
}

export default function ContractAddOnsTab({ loading, onDelete }: ContractAddOnsTabProps) {
  const [addOns, setAddOns] = useState<ContractAddOn[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<ContractAddOn | null>(null);
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
    amount: Yup.number()
      .required('Amount is required')
      .min(0, 'Amount must be positive')
      .max(999999.99, 'Amount must be less than 1,000,000'),
    is_active: Yup.boolean()
  });

  // Initial form values
  const initialValues = {
    name: '',
    description: '',
    amount: 0,
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
    fetchAddOns();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const fetchAddOns = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await getRequest(`/api/contract-configuration/add-ons?${params}`);

      if (response.success && response.data) {
        setAddOns(response.data.add_ons || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0
        }));
      } else {
        console.error('Error fetching add-ons:', response.error);
        setAddOns([]);
        if (response.error) {
          toast.error(`Error: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      setAddOns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      let response;

      if (editingAddOn) {
        response = await putRequest('/api/contract-configuration/add-ons', { ...values, id: editingAddOn.id });
      } else {
        response = await postRequest('/api/contract-configuration/add-ons', values);
      }

      if (response.success) {
        if (editingAddOn) {
          setIsEditModalOpen(false);
        } else {
          setIsAddModalOpen(false);
        }
        resetForm();
        setEditingAddOn(null);
        fetchAddOns();
      } else {
        throw new Error(response.error || 'Failed to save add-on');
      }
    } catch (error) {
      console.error('Error saving add-on:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred while saving the add-on');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (addOn: ContractAddOn) => {
    setEditingAddOn(addOn);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete('add_on', id, name);
  };

  const resetForm = () => {
    setEditingAddOn(null);
  };

  const handleExport = async () => {
    try {
      const response = await getRequest('/api/contract-configuration/add-ons');

      if (response.success && response.data) {
        const csvContent = [
          ['Code', 'Name', 'Description', 'Amount', 'Status', 'Created At'],
          ...(response.data.add_ons || []).map((addOn: any) => [
            addOn.code || '',
            addOn.name || '',
            addOn.description || '',
            addOn.amount || '0.00',
            addOn.is_active ? 'Active' : 'Inactive',
            addOn.created_at ? new Date(addOn.created_at).toLocaleDateString() : ''
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contract-add-ons.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Export error:', response.error);
        if (response.error) {
          toast.error(`Export failed: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed due to an unexpected error');
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const columns: TableColumn[] = [
    { key: 'code', label: 'Code', type: 'text', sortable: true },
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'description', label: 'Description', type: 'text' },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text',
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-medium text-green-700">
          {formatAmount(row.amount || 0)}
        </span>
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
        title="Contract Add-Ons"
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
              Add Contract Add-On
            </SimpleButton>
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search add-ons..."
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
          data={addOns}
          columns={columns}
          loading={isLoading}
          emptyMessage="No add-ons found. Try adding your first contract add-on."
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
        title="Add New Contract Add-On"
        subtitle="Enter the details for the new contract add-on."
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
                  placeholder="Enter add-on name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter add-on description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="amount"
                  label="Amount (SAR)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="col-span-3"
                  placeholder="0.00"
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
                  Save Add-On
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
        title="Edit Contract Add-On"
        subtitle="Update the details for this contract add-on."
        maxWidth="sm:max-w-[425px]"
      >
        <Formik
          initialValues={{
            name: editingAddOn?.name || '',
            description: editingAddOn?.description || '',
            amount: editingAddOn?.amount || 0,
            is_active: editingAddOn?.is_active ?? true
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
                  placeholder="Enter add-on name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter add-on description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="amount"
                  label="Amount (SAR)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="col-span-3"
                  placeholder="0.00"
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
                  Update Add-On
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>
    </>
  );
}

