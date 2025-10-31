'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
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

type VehicleColor = Database['public']['Tables']['vehicle_colors']['Row'];

interface ColorsProps {
  loading: boolean;
  onDelete: (type: 'color', id: string, name: string) => void;
}

export default function Colors({ loading, onDelete }: ColorsProps) {
  const { getRequest, postRequest, putRequest } = useHttpService();
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<VehicleColor | null>(null);
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
    hex_code: Yup.string()
      .required('Hex code is required')
      .matches(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color code (e.g., #FF0000)'),
    is_active: Yup.boolean()
  });

  // Initial form values
  const initialValues = {
    name: '',
    description: '',
    hex_code: '',
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
    fetchColors();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const fetchColors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await getRequest(`/api/vehicle-configuration/colors?${params}`);

      if (response.error) {
        throw new Error(response.error);
      }

      setColors(response.data.colors || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      let response;

      if (editingColor) {
        response = await putRequest('/api/vehicle-configuration/colors', { ...values, id: editingColor.id });
        if (response.error) {
          throw new Error(response.error);
        }
        setIsEditModalOpen(false);
      } else {
        response = await postRequest('/api/vehicle-configuration/colors', values);
        if (response.error) {
          throw new Error(response.error);
        }
        setIsAddModalOpen(false);
      }

      resetForm();
      setEditingColor(null);
      fetchColors();
    } catch (error) {
      console.error('Error saving color:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred while saving the color');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (color: VehicleColor) => {
    setEditingColor(color);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete('color', id, name);
  };

  const resetForm = () => {
    setEditingColor(null);
  };

  const handleExport = async () => {
    try {
      const response = await getRequest('/api/vehicle-configuration/colors');

      if (response.error) {
        throw new Error(response.error);
      }

      const csvContent = [
        ['Code', 'Name', 'Description', 'Hex Code', 'Status', 'Created At'],
        ...(response.data.colors || []).map((color: any) => [
          color.code || '',
          color.name || '',
          color.description || '',
          color.hex_code || '',
          color.is_active ? 'Active' : 'Inactive',
          color.created_at ? new Date(color.created_at).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vehicle-colors.csv';
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns: TableColumn[] = [
    { key: 'code', label: 'Code', type: 'text', sortable: true },
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'description', label: 'Description', type: 'text' },
    {
      key: 'hex_code',
      label: 'Color',
      type: 'text',
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: row.hex_code || '#6B7280' }}
          />
          <span className="text-sm font-mono">{row.hex_code || '#6B7280'}</span>
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
        title="Vehicle Colors"
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
              Add Color
            </SimpleButton>
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search colors..."
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
          data={colors}
          columns={columns}
          loading={isLoading}
          emptyMessage="No colors found. Add your first color to get started."
          emptyIcon={
            <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          }
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
        title="Add New Vehicle Color"
        subtitle="Enter the details for the new vehicle color."
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
                  placeholder="Enter color name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter color description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomColorInput
                  name="hex_code"
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
                  Save Color
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
        title="Edit Vehicle Color"
        subtitle="Update the details for this vehicle color."
        maxWidth="sm:max-w-[425px]"
      >
        <Formik
          initialValues={{
            name: editingColor?.name || '',
            description: editingColor?.description || '',
            hex_code: editingColor?.hex_code || '',
            is_active: editingColor?.is_active ?? true
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
                  placeholder="Enter color name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  className="col-span-3"
                  placeholder="Enter color description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomColorInput
                  name="hex_code"
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
                  Update Color
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>
    </>
  );
}
