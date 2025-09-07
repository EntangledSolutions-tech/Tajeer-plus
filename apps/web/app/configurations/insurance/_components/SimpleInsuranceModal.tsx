'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import RadioButtonGroup from '../../../reusableComponents/RadioButtonGroup';
import { useState } from 'react';
import { Info } from 'lucide-react';
import CustomModal from '../../../reusableComponents/CustomModal';

interface SimpleInsuranceOption {
  id?: string;
  name: string;
  deductiblePremium: number;
  rentalIncreaseType: 'value' | 'percentage';
  rentalIncreaseValue: number;
}

interface SimpleInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SimpleInsuranceOption) => void;
  editingOption?: any;
  isLoading?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  deductiblePremium: Yup.number()
    .min(0, 'Deductible premium must be positive')
    .max(999999999, 'Deductible premium is too large')
    .required('Deductible premium is required'),
  rentalIncreaseType: Yup.string()
    .oneOf(['value', 'percentage'], 'Invalid increase type')
    .required('Increase type is required'),
  rentalIncreaseValue: Yup.number()
    .min(0, 'Value must be positive')
    .when('rentalIncreaseType', {
      is: 'percentage',
      then: (schema) => schema.max(100, 'Percentage cannot exceed 100%'),
      otherwise: (schema) => schema.max(999999999, 'Value is too large')
    })
    .required('Rental increase value is required')
});

export default function SimpleInsuranceModal({
  isOpen,
  onClose,
  onSubmit,
  editingOption = null,
  isLoading = false
}: SimpleInsuranceModalProps) {
  const [increaseType, setIncreaseType] = useState<'value' | 'percentage'>(
    editingOption?.rental_increase_type || 'percentage'
  );

  const initialValues: SimpleInsuranceOption = editingOption ? {
    name: editingOption.name || '',
    deductiblePremium: editingOption.deductible_premium || 0,
    rentalIncreaseType: editingOption.rental_increase_type || 'percentage',
    rentalIncreaseValue: editingOption.rental_increase_type === 'percentage'
      ? editingOption.rental_increase_percentage || 0
      : editingOption.rental_increase_value || 0,
  } : {
    name: '',
    deductiblePremium: 0,
    rentalIncreaseType: 'percentage',
    rentalIncreaseValue: 0,
  };

  const handleSubmit = (values: SimpleInsuranceOption) => {
    onSubmit(values);
  };

  const handleClose = () => {
    setIncreaseType('percentage');
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingOption ? 'Edit insurance' : 'Add new insurance'}
      maxWidth="sm:max-w-[500px]"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6 mt-4 px-6">
            {/* Name */}
            <div>
              <CustomInput
                name="name"
                label="Name"
                placeholder="Enter name"
                required
              />
            </div>

            {/* Deductible Premium */}
            <div className="space-y-2">
              <CustomInput
                name="deductiblePremium"
                label="Deductible Premium"
                type="number"
                placeholder="Enter amount"
                required
              />
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-sm text-primary">
                  This value is taken if the vehicle's record is not linked to an insurance policy
                </p>
              </div>
            </div>

            {/* Increase in rental amount */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Increase in rental amount
              </h3>
              <p className="text-sm text-gray-600">
                Enter the increase in vehicle rental amount if this policy is selected
              </p>

              {/* Radio buttons */}
              <RadioButtonGroup
                name="rentalIncreaseType"
                value={values.rentalIncreaseType}
                onChange={(value) => {
                  setFieldValue('rentalIncreaseType', value);
                  setIncreaseType(value as 'value' | 'percentage');
                }}
                options={[
                  { value: 'value', label: 'Increase by value' },
                  { value: 'percentage', label: 'Increase by percentage' }
                ]}
                className="flex-col items-start gap-3"
              />

              {/* Input field based on selection */}
              <div>
                <CustomInput
                  name="rentalIncreaseValue"
                  label=""
                  type="number"
                  placeholder={
                    values.rentalIncreaseType === 'percentage'
                      ? "Enter percentage (%)"
                      : "Enter value (SAR)"
                  }
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white px-6 py-4 border-t border-primary/20 flex-shrink-0 mt-6 -mx-6">
              <div className="flex gap-3 justify-end">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading
                    ? (editingOption ? 'Updating...' : 'Adding...')
                    : (editingOption ? 'Update Insurance' : 'Add Insurance')
                  }
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
