"use client";

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomTextarea from '../../../reusableComponents/CustomTextarea';
import CustomModal from '../../../reusableComponents/CustomModal';

interface Profession {
  id: string;
  code: number;
  profession: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { profession: string; description?: string }) => Promise<void>;
  editingProfession?: Profession | null;
}

const professionSchema = Yup.object({
  profession: Yup.string()
    .required('Profession is required')
    .min(2, 'Profession must be at least 2 characters')
    .max(100, 'Profession must not exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
});

const initialValues = {
  profession: '',
  description: '',
};

export default function ProfessionModal({
  isOpen,
  onClose,
  onSubmit,
  editingProfession = null,
}: ProfessionModalProps) {

  const getInitialValues = () => {
    if (editingProfession) {
      return {
        profession: editingProfession.profession || '',
        description: editingProfession.description || '',
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
      title={editingProfession ? 'Edit Profession' : 'Add Profession'}
      maxWidth="sm:max-w-md"
    >
      <div className="p-4">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={professionSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <CustomInput
                name="profession"
                label="Profession"
                placeholder="Enter profession title (e.g., Engineer)"
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
                  {editingProfession ? 'Update' : 'Add'} Profession
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </CustomModal>
  );
}
