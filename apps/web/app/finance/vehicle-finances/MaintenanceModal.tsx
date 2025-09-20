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
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';

// Interfaces
interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  is_active: boolean;
}

interface MaintenanceFormValues {
  vehicle: string;
  maintenanceType: string;
  date: string;
  supplier: string;
  notes: string;
  totalAmount: string;
  vatIncluded: boolean;
  statementType: string;
  totalDiscount: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MaintenanceFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for maintenance
const MaintenanceSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  maintenanceType: Yup.string()
    .required('Maintenance type is required'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  supplier: Yup.string()
    .required('Supplier is required'),
  notes: Yup.string(),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  statementType: Yup.string()
    .required('Statement type is required'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

export default function MaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: MaintenanceModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Maintenance Log"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          maintenanceType: '',
          date: '',
          supplier: '',
          notes: '',
          totalAmount: 'SAR 1.00',
          vatIncluded: true,
          statementType: 'Sale',
          totalDiscount: 'SAR 0.00',
          netInvoice: 'SAR 1.15',
          totalPaid: 'SAR 0.00',
          remaining: 'SAR 0.00'
        }}
        validationSchema={MaintenanceSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-8 py-6">
              <div className="space-y-8">
                {/* Vehicle Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <CustomSelect
                      name="maintenanceType"
                      label="Maintenance type"
                      value={values.maintenanceType}
                      onChange={(value: string) => setFieldValue('maintenanceType', value)}
                      options={[
                        { value: '', label: 'Select type' },
                        { value: 'Oil Change', label: 'Oil Change' },
                        { value: 'Brake Service', label: 'Brake Service' },
                        { value: 'Engine Repair', label: 'Engine Repair' },
                        { value: 'Transmission Service', label: 'Transmission Service' },
                        { value: 'Tire Replacement', label: 'Tire Replacement' },
                        { value: 'General Maintenance', label: 'General Maintenance' }
                      ]}
                      error={errors.maintenanceType && touched.maintenanceType ? errors.maintenanceType : undefined}
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
                    <CustomSelect
                      name="supplier"
                      label="Supplier"
                      value={values.supplier}
                      onChange={(value: string) => setFieldValue('supplier', value)}
                      options={[
                        { value: '', label: 'Select supplier' },
                        { value: 'Auto Parts Co.', label: 'Auto Parts Co.' },
                        { value: 'Service Center', label: 'Service Center' },
                        { value: 'Dealership', label: 'Dealership' },
                        { value: 'Independent Mechanic', label: 'Independent Mechanic' }
                      ]}
                      error={errors.supplier && touched.supplier ? errors.supplier : undefined}
                      className="w-full"
                    />
                    <div className="md:col-span-2">
                      <CustomTextarea
                        name="notes"
                        label="Notes"
                        value={values.notes}
                        onChange={(value: string) => setFieldValue('notes', value)}
                        placeholder="Enter note"
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
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">VAT</label>
                      <RadioButtonGroup
                        name="vatIncluded"
                        value={values.vatIncluded ? 'included' : 'notIncluded'}
                        onChange={(value) => setFieldValue('vatIncluded', value === 'included')}
                        options={[
                          { value: 'included', label: 'VAT included' },
                          { value: 'notIncluded', label: 'VAT not included' }
                        ]}
                        className="mt-2"
                      />
                    </div>
                    <CustomSelect
                      name="statementType"
                      label="Statement type"
                      value={values.statementType}
                      onChange={(value: string) => setFieldValue('statementType', value)}
                      options={[
                        { value: 'Sale', label: 'Sale' },
                        { value: 'Return', label: 'Return' },
                        { value: 'Deprecation', label: 'Deprecation' }
                      ]}
                      error={errors.statementType && touched.statementType ? errors.statementType : undefined}
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
                  submittingText="Adding Maintenance Log..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Maintenance Log
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
