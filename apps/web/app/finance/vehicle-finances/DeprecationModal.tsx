'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import { SimpleSearchableSelect } from '../../reusableComponents/SearchableSelect';

// Interfaces
interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  is_active: boolean;
}

interface DeprecationFormValues {
  vehicle: string;
  expectedSalePrice: string;
  leaseAmountIncrease: string;
}

interface DeprecationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: DeprecationFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for deprecation
const DeprecationSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  expectedSalePrice: Yup.string()
    .required('Expected sale price is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  leaseAmountIncrease: Yup.string()
    .required('Lease amount increase is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

export default function DeprecationModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: DeprecationModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Vehicle Pricing & Depreciation"
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          expectedSalePrice: '',
          leaseAmountIncrease: ''
        }}
        validationSchema={DeprecationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-8 py-6">
              <div className="space-y-6">
                {/* Vehicle Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                    <SimpleSearchableSelect
                      options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                        key: vehicle.id,
                        id: vehicle.id,
                        value: vehicle.plate_number,
                        subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                      }))}
                      value={values.vehicle}
                      onChange={(value) => setFieldValue('vehicle', value)}
                      placeholder="Select vehicle"
                      className="w-full"
                      error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                    />
                  </div>
                </div>

                {/* Pricing Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="expectedSalePrice"
                      label="Expected Sale Price"
                      type="text"
                      value={values.expectedSalePrice}
                      onChange={(value: string) => setFieldValue('expectedSalePrice', value)}
                      placeholder="Amount"
                      error={errors.expectedSalePrice && touched.expectedSalePrice ? errors.expectedSalePrice : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="leaseAmountIncrease"
                      label="Lease Amount increase in case of insurance"
                      type="text"
                      value={values.leaseAmountIncrease}
                      onChange={(value: string) => setFieldValue('leaseAmountIncrease', value)}
                      placeholder="Amount"
                      error={errors.leaseAmountIncrease && touched.leaseAmountIncrease ? errors.leaseAmountIncrease : undefined}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
              <div className="flex justify-end gap-4">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  loading={loading}
                  submittingText="Updating Pricing..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Update Pricing
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
