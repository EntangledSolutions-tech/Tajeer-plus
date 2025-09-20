'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import SearchableSelect from '../../reusableComponents/SearchableSelect';

// Interfaces
interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  is_active: boolean;
}

interface VehicleFinanceFormValues {
  amount: string;
  date: string;
  transactionType: string;
  vehicle: string;
  description: string;
  invoiceNumber: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: VehicleFinanceFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema
const VehicleFinanceSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  transactionType: Yup.string()
    .required('Transaction type is required'),
  vehicle: Yup.string()
    .required('Vehicle is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required')
});

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: AddTransactionModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add new vehicle transaction"
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={{
          amount: 'SAR 1,200.00',
          date: '03/10/2022',
          transactionType: '',
          vehicle: '',
          description: 'Vehicle maintenance and repair services',
          invoiceNumber: 'INV-V001'
        }}
        validationSchema={VehicleFinanceSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <CustomInput
                  name="amount"
                  label="Amount"
                  type="text"
                  value={values.amount}
                  onChange={(value: string) => setFieldValue('amount', value)}
                  error={errors.amount && touched.amount ? errors.amount : undefined}
                  className="w-full"
                />

                {/* Date */}
                <CustomInput
                  name="date"
                  label="Date"
                  type="date"
                  value={values.date}
                  onChange={(value: string) => setFieldValue('date', value)}
                  error={errors.date && touched.date ? errors.date : undefined}
                  className="w-full"
                />

                {/* Transaction Type */}
                <CustomSelect
                  name="transactionType"
                  label="Transaction type"
                  value={values.transactionType}
                  onChange={(value: string) => setFieldValue('transactionType', value)}
                  options={[
                    { value: '', label: 'Select type' },
                    { value: 'Sale', label: 'Sale' },
                    { value: 'Return', label: 'Return' },
                    { value: 'Deprecation', label: 'Deprecation' },
                    { value: 'Penalty', label: 'Penalty' },
                    { value: 'Maintenance', label: 'Maintenance' },
                    { value: 'Service', label: 'Service' },
                    { value: 'Insurance', label: 'Insurance' },
                    { value: 'Accident', label: 'Accident' }
                  ]}
                  error={errors.transactionType && touched.transactionType ? errors.transactionType : undefined}
                  className="w-full"
                />

                {/* Vehicle */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                  <SearchableSelect
                    name="vehicle"
                    label="Vehicle"
                    required
                    options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                      key: vehicle.id,
                      id: vehicle.id,
                      value: vehicle.plate_number,
                      subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                    }))}
                    placeholder="Select vehicle"
                    className="w-full"
                  />
                </div>

                {/* Invoice Number */}
                <CustomInput
                  name="invoiceNumber"
                  label="Invoice Number"
                  type="text"
                  value={values.invoiceNumber}
                  onChange={(value: string) => setFieldValue('invoiceNumber', value)}
                  placeholder="INV-V001"
                  error={errors.invoiceNumber && touched.invoiceNumber ? errors.invoiceNumber : undefined}
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="mt-6">
                <CustomTextarea
                  name="description"
                  label="Description"
                  value={values.description}
                  onChange={(value: string) => setFieldValue('description', value)}
                  placeholder="Vehicle maintenance and repair services"
                  rows={4}
                  error={errors.description && touched.description ? errors.description : undefined}
                  className="w-full"
                />
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
                  submittingText="Adding Transaction..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Transaction
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
