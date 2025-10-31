'use client';

import { useState, useEffect } from 'react';
import { toast } from '@kit/ui/sonner';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Plus, Pencil } from 'lucide-react';
import CustomTable, { TableColumn, TableAction } from '../../../reusableComponents/CustomTable';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomModal from '../../../reusableComponents/CustomModal';
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomSwitch from '../../../reusableComponents/CustomSwitch';
import { SimpleButton } from '../../../reusableComponents/CustomButton';
import { useHttpService } from '../../../../lib/http-service';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface PermissionsValidationsTabProps {
  loading: boolean;
}

export default function PermissionsValidationsTab({ loading }: PermissionsValidationsTabProps) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const { getRequest, putRequest, postRequest } = useHttpService();

  // Validation schema for adding new settings
  const addSettingValidationSchema = Yup.object({
    key: Yup.string()
      .required('Setting key is required')
      .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Key must start with a letter or underscore and contain only alphanumeric characters and underscores')
      .max(100, 'Key must be less than 100 characters'),
    value: Yup.string()
      .required('Value is required')
      .max(500, 'Value must be less than 500 characters'),
    description: Yup.string()
      .required('Description is required')
      .max(500, 'Description must be less than 500 characters'),
    category: Yup.string()
      .required('Category is required')
      .max(50, 'Category must be less than 50 characters')
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest('/api/system-settings?category=contracts');

      if (response.success && response.data) {
        const settingsData = (response.data as any).data?.settings || (response.data as any).settings || [];
        setSettings(settingsData);
      } else {
        console.error('Error fetching settings:', response.error);
        if (response.error) {
          toast.error(`Error: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSetting = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const response = await postRequest('/api/system-settings', values);

      if (response.success) {
        toast.success('Setting added successfully');
        setIsAddModalOpen(false);
        resetForm();
        fetchSettings();
      } else {
        throw new Error(response.error || 'Failed to add setting');
      }
    } catch (error) {
      console.error('Error adding setting:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred while adding the setting');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any, { setSubmitting }: any) => {
    if (!editingSetting) return;

    try {
      const updates = [{
        key: editingSetting.key,
        value: values.value
      }];

      const response = await putRequest('/api/system-settings', { updates });

      if (response.success) {
        toast.success('Setting updated successfully');
        fetchSettings();
        setIsEditModalOpen(false);
        setEditingSetting(null);
      } else {
        throw new Error(response.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred while updating the setting');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn[] = [
    { key: 'key', label: 'Setting', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'value', label: 'Current Value', type: 'text' }
  ];

  const actions: TableAction[] = [
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: any) => handleEditSetting(row),
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5'
    }
  ];

  return (
    <>
      <CollapsibleSection
        title="Permissions & Validations"
        defaultOpen={true}
        headerButton={
          <div onClick={(e) => e.stopPropagation()}>
            <SimpleButton
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Setting
            </SimpleButton>
          </div>
        }
      >
        {settings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Current Settings</h3>
            <CustomTable
              data={settings}
              columns={columns}
              loading={isLoading}
              emptyMessage="No settings found."
              searchable={false}
              pagination={false}
              selectable={false}
              actions={actions}
            />
          </div>
        )}

        {!loading && settings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No settings found</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Setting" to create your first setting</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Edit Setting Modal */}
      <CustomModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSetting(null);
        }}
        title="Edit Setting"
        subtitle={`Updating value for "${editingSetting?.key}"`}
        maxWidth="sm:max-w-[500px]"
      >
        <Formik
          initialValues={{
            value: editingSetting?.value || ''
          }}
          validationSchema={Yup.object({
            value: Yup.string()
              .required('Value is required')
              .max(500, 'Value must be less than 500 characters')
          })}
          onSubmit={handleEditSubmit}
          enableReinitialize
        >
          <Form>
            <div className="grid gap-4 py-4 px-6">
              {editingSetting && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-1 text-sm font-medium text-primary">Key</div>
                    <div className="col-span-3 text-sm text-gray-600">{editingSetting.key}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-1 text-sm font-medium text-primary">Description</div>
                    <div className="col-span-3 text-sm text-gray-600">{editingSetting.description}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <CustomInput
                      name="value"
                      label="Value"
                      required
                      className="col-span-3"
                      placeholder="Enter new value"
                      type={editingSetting.key === 'cancelWindowHours' ? 'number' : 'text'}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="bg-white px-6 py-4 border-t border-primary/20 flex-shrink-0">
              <div className="flex justify-end">
                <CustomButton
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Update Setting
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>

      {/* Add Setting Modal */}
      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Setting"
        subtitle="Create a new permissions or validation setting"
        maxWidth="sm:max-w-[500px]"
      >
        <Formik
          initialValues={{
            key: '',
            value: '',
            description: '',
            category: 'contracts',
            is_active: true
          }}
          validationSchema={addSettingValidationSchema}
          onSubmit={handleAddSetting}
        >
          <Form>
            <div className="grid gap-4 py-4 px-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="key"
                  label="Key"
                  required
                  className="col-span-3"
                  placeholder="e.g., maxRentalDays"
                  helperText="Must start with a letter or underscore, alphanumeric only"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="value"
                  label="Value"
                  required
                  className="col-span-3"
                  placeholder="Enter setting value"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomTextarea
                  name="description"
                  label="Description"
                  required
                  className="col-span-3"
                  placeholder="Enter setting description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <CustomInput
                  name="category"
                  label="Category"
                  required
                  className="col-span-3"
                  placeholder="e.g., contracts"
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
                  Add Setting
                </CustomButton>
              </div>
            </div>
          </Form>
        </Formik>
      </CustomModal>
    </>
  );
}

