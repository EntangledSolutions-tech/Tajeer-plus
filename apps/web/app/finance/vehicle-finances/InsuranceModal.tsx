'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
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

interface InsuranceFormValues {
  vehicle: string;
  company: string;
  policyNumber: string;
  totalAmount: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: InsuranceFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for insurance
const InsuranceSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  company: Yup.string()
    .required('Insurance company is required'),
  policyNumber: Yup.string()
    .required('Policy number is required'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

export default function InsuranceModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: InsuranceModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add insurance payment"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          company: '',
          policyNumber: '',
          totalAmount: 'SAR 1.00',
          totalDiscount: 'SAR 0.00',
          vat: 'SAR 15%',
          netInvoice: 'SAR 1.15',
          totalPaid: 'SAR 0.00',
          remaining: 'SAR 0.00'
        }}
        validationSchema={InsuranceSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-8 py-6">
              <div className="space-y-8">
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

                {/* Amount Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <CustomInput
                      name="totalAmount"
                      label="Total Amount"
                      type="text"
                      value={values.totalAmount}
                      onChange={(value: string) => setFieldValue('totalAmount', value)}
                      error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="totalDiscount"
                      label="Total Discount"
                      type="text"
                      value={values.totalDiscount}
                      onChange={(value: string) => setFieldValue('totalDiscount', value)}
                      error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="vat"
                      label="VAT"
                      type="text"
                      value={values.vat}
                      onChange={(value: string) => setFieldValue('vat', value)}
                      error={errors.vat && touched.vat ? errors.vat : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="netInvoice"
                      label="Net Invoice"
                      type="text"
                      value={values.netInvoice}
                      onChange={(value: string) => setFieldValue('netInvoice', value)}
                      error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="totalPaid"
                      label="Total Paid"
                      type="text"
                      value={values.totalPaid}
                      onChange={(value: string) => setFieldValue('totalPaid', value)}
                      error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="remaining"
                      label="Remaining"
                      type="text"
                      value={values.remaining}
                      onChange={(value: string) => setFieldValue('remaining', value)}
                      error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Insurance Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect
                      name="company"
                      label="Company"
                      value={values.company}
                      onChange={(value: string) => setFieldValue('company', value)}
                      options={[
                        { value: '', label: 'Select company' },
                        { value: 'Tawuniya', label: 'Tawuniya' },
                        { value: 'SABB Takaful', label: 'SABB Takaful' },
                        { value: 'Malath Insurance', label: 'Malath Insurance' },
                        { value: 'AXA Cooperative', label: 'AXA Cooperative' },
                        { value: 'Allianz', label: 'Allianz' }
                      ]}
                      error={errors.company && touched.company ? errors.company : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="policyNumber"
                      label="Policy Number"
                      type="text"
                      value={values.policyNumber}
                      onChange={(value: string) => setFieldValue('policyNumber', value)}
                      placeholder="Enter number"
                      error={errors.policyNumber && touched.policyNumber ? errors.policyNumber : undefined}
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
                  submittingText="Adding Insurance Payment..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Insurance Payment
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
