"use client";

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomModal from '../../../reusableComponents/CustomModal';

interface Classification {
  id: string;
  code: number;
  classification: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { classification: string; description?: string }) => Promise<void>;
  editingClassification?: Classification | null;
}

const classificationSchema = Yup.object({
  classification: Yup.string()
    .required('Classification is required')
    .min(2, 'Classification must be at least 2 characters')
    .max(100, 'Classification must not exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
});

const initialValues = {
  classification: '',
  description: '',
};

export default function ClassificationModal({
  isOpen,
  onClose,
  onSubmit,
  editingClassification = null,
}: ClassificationModalProps) {

  const getInitialValues = () => {
    if (editingClassification) {
      return {
        classification: editingClassification.classification || '',
        description: editingClassification.description || '',
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
      title={editingClassification ? 'Edit Classification' : 'Add Classification'}
      maxWidth="sm:max-w-md"
    >
      <div className="p-4">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={classificationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <CustomInput
                name="classification"
                label="Classification"
                placeholder="Enter classification (e.g., Individual)"
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
                  {editingClassification ? 'Update' : 'Add'} Classification
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </CustomModal>
  );
}
