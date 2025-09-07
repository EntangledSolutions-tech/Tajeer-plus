"use client";

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomModal from '../../../reusableComponents/CustomModal';

interface Nationality {
  id: string;
  code: number;
  nationality: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NationalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { nationality: string; description?: string }) => Promise<void>;
  editingNationality?: Nationality | null;
}

const nationalitySchema = Yup.object({
  nationality: Yup.string()
    .required('Nationality is required')
    .min(2, 'Nationality must be at least 2 characters')
    .max(100, 'Nationality must not exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
});

const initialValues = {
  nationality: '',
  description: '',
};

export default function NationalityModal({
  isOpen,
  onClose,
  onSubmit,
  editingNationality = null,
}: NationalityModalProps) {

  const getInitialValues = () => {
    if (editingNationality) {
      return {
        nationality: editingNationality.nationality || '',
        description: editingNationality.description || '',
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
      title={editingNationality ? 'Edit Nationality' : 'Add Nationality'}
      maxWidth="sm:max-w-md"
    >
      <div className="p-4">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={nationalitySchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <CustomInput
                name="nationality"
                label="Nationality"
                placeholder="Enter nationality (e.g., Saudi Arabian)"
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
                  {editingNationality ? 'Update' : 'Add'} Nationality
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </CustomModal>
  );
}
