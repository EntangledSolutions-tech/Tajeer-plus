'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomModal from './CustomModal';
import CustomInput from './CustomInput';
import CustomTextarea from './CustomTextarea';
import CustomSwitch from './CustomSwitch';
import CustomButton from './CustomButton';

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  city_region?: string;
  commercial_registration_number?: string;
  website?: string;
  branch_license_number?: string;
  is_rental_office?: boolean;
  has_no_cars?: boolean;
  has_cars_and_employees?: boolean;
  is_maintenance_center?: boolean;
  has_shift_system_support?: boolean;
  is_limousine_office?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Branch>) => Promise<void>;
  mode?: 'add' | 'edit';
  initialData?: Partial<Branch>;
  loading?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Branch name is required'),
  code: Yup.string().required('Branch code is required'),
  email: Yup.string().email('Invalid email format'),
  website: Yup.string().url('Invalid website URL'),
});

export function BranchModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'add',
  initialData,
  loading = false
}: BranchModalProps) {
  const getInitialValues = (): Partial<Branch> => {
    if (mode === 'edit' && initialData) {
      return {
        name: initialData.name || '',
        code: initialData.code || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        manager_name: initialData.manager_name || '',
        city_region: initialData.city_region || '',
        commercial_registration_number: initialData.commercial_registration_number || '',
        website: initialData.website || '',
        branch_license_number: initialData.branch_license_number || '',
        is_rental_office: initialData.is_rental_office || false,
        has_no_cars: initialData.has_no_cars || false,
        has_cars_and_employees: initialData.has_cars_and_employees || false,
        is_maintenance_center: initialData.is_maintenance_center || false,
        has_shift_system_support: initialData.has_shift_system_support || false,
        is_limousine_office: initialData.is_limousine_office || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      };
    }

    return {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      manager_name: '',
      city_region: '',
      commercial_registration_number: '',
      website: '',
      branch_license_number: '',
      is_rental_office: false,
      has_no_cars: false,
      has_cars_and_employees: false,
      is_maintenance_center: false,
      has_shift_system_support: false,
      is_limousine_office: false,
      is_active: true,
    };
  };

  const handleSubmit = async (values: Partial<Branch>) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error('Error submitting branch:', error);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Branch' : 'Edit Branch'}
      subtitle={mode === 'add' ? 'Enter the details for the new branch.' : 'Update the details for this branch.'}
      maxWidth="sm:max-w-[800px]"
    >
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <div className="grid gap-4 py-4 px-6">
            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                name="name"
                label="Branch Name"
                required
                placeholder="Enter branch name"
              />
              <CustomInput
                name="code"
                label="Branch Code"
                required
                placeholder="Enter branch code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                name="city_region"
                label="City/Region"
                placeholder="Enter city or region"
              />
              <CustomInput
                name="phone"
                label="Phone"
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email address"
              />
              <CustomInput
                name="website"
                label="Website"
                placeholder="eg. welmrental.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                name="commercial_registration_number"
                label="Commercial registration number"
                placeholder="Enter number"
              />
              <CustomInput
                name="branch_license_number"
                label="Branch license number"
                placeholder="Enter number"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <CustomInput
                name="manager_name"
                label="Manager Name"
                placeholder="Enter manager name"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <CustomTextarea
                name="address"
                label="Address"
                placeholder="Enter branch address"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Branch Roles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CustomSwitch name="is_rental_office" />
                    <label className="text-sm">Branch is a rental office</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CustomSwitch name="has_no_cars" />
                    <label className="text-sm">Branch does not have cars</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CustomSwitch name="has_cars_and_employees" />
                    <label className="text-sm">Branch has cars and employees</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CustomSwitch name="is_maintenance_center" />
                    <label className="text-sm">Branch is a maintenance center</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CustomSwitch name="has_shift_system_support" />
                    <label className="text-sm">Branch has a shift system support</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CustomSwitch name="is_limousine_office" />
                    <label className="text-sm">Branch is a limousine office</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <CustomSwitch
                name="is_active"
                label="Active"
              />
            </div>
          </div>
          <div className="bg-white px-6 py-4 border-t border-primary/20 flex-shrink-0">
            <div className="flex justify-end">
              <CustomButton
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={loading}
              >
                {loading
                  ? 'Saving...'
                  : mode === 'add' ? 'Save Branch' : 'Update Branch'
                }
              </CustomButton>
            </div>
          </div>
        </Form>
      </Formik>
    </CustomModal>
  );
}
