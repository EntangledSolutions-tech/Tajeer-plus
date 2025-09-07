"use client";

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomModal from '../../../reusableComponents/CustomModal';

interface LicenseType {
  id: string;
  code: number;
  license_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LicenseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { license_type: string; description?: string }) => Promise<void>;
  editingLicenseType?: LicenseType | null;
}

const licenseTypeSchema = Yup.object({
  license_type: Yup.string()
    .required('License type is required')
    .min(2, 'License type must be at least 2 characters')
    .max(100, 'License type must not exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
});

const initialValues = {
  license_type: '',
  description: '',
};

export default function LicenseTypeModal({
  isOpen,
  onClose,
  onSubmit,
  editingLicenseType = null,
}: LicenseTypeModalProps) {

  const getInitialValues = () => {
    if (editingLicenseType) {
      return {
        license_type: editingLicenseType.license_type || '',
        description: editingLicenseType.description || '',
      };
    }
    return initialValues;
  };

  const handleSubmit = async (values: typeof initialValues, actions: any) => {
    try {
      await onSubmit(values);
      actions.resetForm();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLicenseType ? 'Edit License Type' : 'Add License Type'}
      maxWidth="sm:max-w-md"
    >
      <div className="p-4">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={licenseTypeSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <CustomInput
                name="license_type"
                label="License Type"
                placeholder="Enter license type (e.g., Class 1)"
                required
              />

              <CustomTextarea
                name="description"
                label="Description"
                placeholder="Enter description (optional)"
                rows={3}
              />

              <div className="flex justify-end gap-3 pt-4">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {editingLicenseType ? 'Update' : 'Add'} License Type
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </CustomModal>
  );
}
