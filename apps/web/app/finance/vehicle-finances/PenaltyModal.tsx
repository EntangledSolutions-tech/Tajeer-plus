'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
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

interface PenaltyFormValues {
  vehicle: string;
  reason: string;
  date: string;
  notes: string;
  totalAmount: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PenaltyFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for penalty
const PenaltySchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  reason: Yup.string()
    .required('Penalty reason is required'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  notes: Yup.string(),
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

export default function PenaltyModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: PenaltyModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add penalty"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          reason: '',
          date: '',
          notes: '',
          totalAmount: 'SAR 1.00',
          totalDiscount: 'SAR 0.00',
          vat: 'SAR 15%',
          netInvoice: 'SAR 1.15',
          totalPaid: 'SAR 0.00',
          remaining: 'SAR 0.00'
        }}
        validationSchema={PenaltySchema}
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

                {/* Penalty Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Penalty details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect
                      name="reason"
                      label="Reason"
                      value={values.reason}
                      onChange={(value: string) => setFieldValue('reason', value)}
                      options={[
                        { value: '', label: 'Select penalty reason' },
                        { value: 'Late Return', label: 'Late Return' },
                        { value: 'Damage', label: 'Damage' },
                        { value: 'Traffic Violation', label: 'Traffic Violation' },
                        { value: 'Overdue Payment', label: 'Overdue Payment' },
                        { value: 'Contract Violation', label: 'Contract Violation' }
                      ]}
                      error={errors.reason && touched.reason ? errors.reason : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="date"
                      label="Date"
                      type="date"
                      value={values.date}
                      onChange={(value: string) => setFieldValue('date', value)}
                      error={errors.date && touched.date ? errors.date : undefined}
                      className="w-full"
                    />
                    <div className="md:col-span-2">
                      <CustomTextarea
                        name="notes"
                        label="Notes (optional)"
                        value={values.notes}
                        onChange={(value: string) => setFieldValue('notes', value)}
                        placeholder="Enter notes"
                        rows={3}
                        error={errors.notes && touched.notes ? errors.notes : undefined}
                        className="w-full"
                      />
                    </div>
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
                  submittingText="Adding Penalty..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Penalty
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
