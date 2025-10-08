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
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomSwitch from '../../../reusableComponents/CustomSwitch';
import CustomSearchableDropdown from '../../../reusableComponents/SearchableDropdown';
import CustomModal from '../../../reusableComponents/CustomModal';
import { useHttpService } from '../../../../lib/http-service';

type VehicleModel = Database['public']['Tables']['vehicle_models']['Row'];
type VehicleMake = Database['public']['Tables']['vehicle_makes']['Row'];

interface ModelsProps {
  loading: boolean;
  onDelete: (type: 'model', id: string, name: string) => void;
}

export default function Models({ loading, onDelete }: ModelsProps) {
  const { getRequest, postRequest, putRequest } = useHttpService();
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
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
    description: Yup.string()
      .max(500, 'Description must be less than 500 characters'),
    make_id: Yup.string()
      .required('Make is required'),
    is_active: Yup.boolean()
  });

  // Initial form values
  const initialValues = {
    name: '',
    description: '',
    make_id: '',
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
    fetchModels();
    fetchMakes();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await getRequest(`/api/vehicle-configuration/models?${params}`);

      if (response.error) {
        throw new Error(response.error);
      }

      setModels(response.data.models || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMakes = async () => {
    try {
      const response = await getRequest('/api/vehicle-configuration/makes');

      if (response.error) {
        throw new Error(response.error);
      }

      setMakes(response.data.makes || []);
    } catch (error) {
      console.error('Error fetching makes:', error);
      setMakes([]);
    }
  };

  // Get make name by ID
  const getMakeName = (makeId: string) => {
    const make = makes.find(m => m.id === makeId);
    return make ? make.name : 'Unknown Make';
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      let response;

      if (editingModel) {
        response = await putRequest('/api/vehicle-configuration/models', { ...values, id: editingModel.id });
        if (response.error) {
          throw new Error(response.error);
        }
        setIsEditModalOpen(false);
      } else {
        response = await postRequest('/api/vehicle-configuration/models', values);
        if (response.error) {
          throw new Error(response.error);
        }
        setIsAddModalOpen(false);
      }

      resetForm();
      setEditingModel(null);
      fetchModels();
    } catch (error) {
      console.error('Error saving model:', error);
      // Show error message to user
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred while saving the model');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (model: VehicleModel) => {
    setEditingModel(model);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete('model', id, name);
  };

  const resetForm = () => {
    setEditingModel(null);
  };

  const handleExport = async () => {
    try {
      const response = await getRequest('/api/vehicle-configuration/models');

      if (response.error) {
        throw new Error(response.error);
      }

      const csvContent = [
        ['Code', 'Name', 'Description', 'Make ID', 'Status', 'Created At'],
        ...(response.data.models || []).map((model: any) => [
          model.code || '',
          model.name || '',
          model.description || '',
          model.make_id || '',
          model.is_active ? 'Active' : 'Inactive',
          model.created_at ? new Date(model.created_at).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vehicle-models.csv';
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
    { key: 'description', label: 'Description', type: 'text' },
    {
      key: 'make_id',
      label: 'Make',
      type: 'text',
      render: (value: any, row: any) => getMakeName(row.make_id)
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
        title="Vehicle Models"
        defaultOpen={true}
        headerButton={
          <div onClick={(e) => e.stopPropagation()}>
            <SimpleButton
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </SimpleButton>
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search models..."
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
          data={models}
          columns={columns}
          loading={isLoading}
          emptyMessage="No models found. Try adding your first model."
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
        title="Add New Vehicle Model"
        subtitle="Enter the details for the new vehicle model."
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
                  placeholder="Enter model name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter model description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomSearchableDropdown
                  name="make_id"
                  options={makes.map(make => ({
                    id: make.id,
                    value: make.id,
                    label: make.name,
                    subLabel: make.code ? `Code: ${make.code}` : undefined
                  }))}
                  label="Make"
                  required
                  placeholder="Select a make"
                  searchPlaceholder="Search makes..."
                  className="col-span-3"
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
                  Save Model
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
        title="Edit Vehicle Model"
        subtitle="Update the details for this vehicle model."
        maxWidth="sm:max-w-[425px]"
      >
        <Formik
          initialValues={{
            name: editingModel?.name || '',
            description: editingModel?.description || '',
            make_id: editingModel?.make_id || '',
            is_active: editingModel?.is_active ?? true
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
                  placeholder="Enter model name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter model description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomSearchableDropdown
                  name="make_id"
                  options={makes.map(make => ({
                    id: make.id,
                    value: make.id,
                    label: make.name,
                    subLabel: make.code ? `Code: ${make.code}` : undefined
                  }))}
                  label="Make"
                  required
                  placeholder="Select a make"
                  searchPlaceholder="Search makes..."
                  className="col-span-3"
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
                  Update Model
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>
    </>
  );
}
