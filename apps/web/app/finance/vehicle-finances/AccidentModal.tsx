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

interface AccidentFormValues {
  vehicle: string;
  accidentType: string;
  date: string;
  logAccidentTransfer: boolean;
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

interface AccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AccidentFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for accident
const AccidentSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  accidentType: Yup.string()
    .required('Accident type is required'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  logAccidentTransfer: Yup.boolean(),
  supplier: Yup.string()
    .required('Supplier is required'),
  notes: Yup.string(),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vatIncluded: Yup.boolean(),
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

export default function AccidentModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: AccidentModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add accident record"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          accidentType: '',
          date: '',
          logAccidentTransfer: false,
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
        validationSchema={AccidentSchema}
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
                </div>

                {/* Accident Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Accident details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect
                      name="accidentType"
                      label="Accident type"
                      value={values.accidentType}
                      onChange={(value: string) => setFieldValue('accidentType', value)}
                      options={[
                        { value: '', label: 'Select accident type' },
                        { value: 'Minor Collision', label: 'Minor Collision' },
                        { value: 'Major Collision', label: 'Major Collision' },
                        { value: 'Single Vehicle', label: 'Single Vehicle' },
                        { value: 'Multi Vehicle', label: 'Multi Vehicle' },
                        { value: 'Hit and Run', label: 'Hit and Run' },
                        { value: 'Property Damage', label: 'Property Damage' }
                      ]}
                      error={errors.accidentType && touched.accidentType ? errors.accidentType : undefined}
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
                        { value: 'Auto Repair Shop', label: 'Auto Repair Shop' },
                        { value: 'Insurance Company', label: 'Insurance Company' },
                        { value: 'Towing Service', label: 'Towing Service' },
                        { value: 'Body Shop', label: 'Body Shop' },
                        { value: 'Independent Mechanic', label: 'Independent Mechanic' }
                      ]}
                      error={errors.supplier && touched.supplier ? errors.supplier : undefined}
                      className="w-full"
                    />
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Log Accident Transfer</label>
                      <RadioButtonGroup
                        name="logAccidentTransfer"
                        value={values.logAccidentTransfer ? 'yes' : 'no'}
                        onChange={(value) => setFieldValue('logAccidentTransfer', value === 'yes')}
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' }
                        ]}
                        className="mt-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <CustomTextarea
                        name="notes"
                        label="Notes"
                        value={values.notes}
                        onChange={(value: string) => setFieldValue('notes', value)}
                        placeholder="Enter accident details and notes"
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
                  submittingText="Adding Accident Record..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Accident Record
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
