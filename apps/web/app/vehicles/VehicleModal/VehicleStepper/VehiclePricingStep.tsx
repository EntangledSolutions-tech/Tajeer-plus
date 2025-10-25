import React from 'react';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomInput from '../../../reusableComponents/CustomInput';
import { useFormikContext } from 'formik';

type PricingField = {
  label: string;
  name: string;
  type: string;
  isRequired: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  isCurrency?: boolean;
};

type FormValues = {
  paymentType?: 'cash' | 'LeaseToOwn';
  [key: string]: unknown;
};

const depreciationYearsOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

const vehiclePricingFields: PricingField[] = [
  { label: 'Car Pricing', name: 'carPricing', type: 'number', isRequired: true, min: 1, placeholder: 'Enter current car pricing (SAR)', isCurrency: true },
  { label: 'Acquisition Date', name: 'acquisitionDate', type: 'date', isRequired: true },
  { label: 'Operation Date', name: 'operationDate', type: 'date', isRequired: true },
  { label: 'Depreciation Rate (%)', name: 'depreciationRate', type: 'number', isRequired: true, min: 0, max: 100, placeholder: 'Enter depreciation rate (0-100)' },
  { label: 'Number of depreciation years', name: 'depreciationYears', type: 'select', isRequired: true, options: depreciationYearsOptions.map(year => ({ value: year, label: year })) },
];

export default function VehiclePricingStep() {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  
  const paymentType = values.paymentType || 'cash';

  const handlePaymentTypeChange = (type: 'cash' | 'LeaseToOwn') => {
    setFieldValue('paymentType', type);
  };
  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Vehicle Pricing & Depreciation</h2>
      
      {/* Payment Type Toggle */}
      <div className="mb-8">
        <div className="font-semibold text-primary mb-4">Payment Type</div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handlePaymentTypeChange('cash')}
            className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
              paymentType === 'cash'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            Cash Payment
          </button>
          <button
            type="button"
            onClick={() => handlePaymentTypeChange('LeaseToOwn')}
            className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
              paymentType === 'LeaseToOwn'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            Lease-to-own
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {vehiclePricingFields.map(field =>
          field.type === 'select' ? (
            <CustomSelect key={field.name} label={field.label} name={field.name} required={field.isRequired} options={field.options || []} />
          ) : (
            <CustomInput
              key={field.name}
              label={field.label}
              name={field.name}
              required={field.isRequired}
              type={field.type}
              min={field.min}
              max={field.type === 'date' && (field.name === 'acquisitionDate' || field.name === 'operationDate') ? today : field.max}
              placeholder={field.placeholder}
              isCurrency={field.isCurrency}
              iconPosition="left"
            />
          )
        )}
      </div>

      {/* Lease-to-own specific fields */}
      {paymentType === 'LeaseToOwn' && (
        <div className="mt-8">
          <div className="font-semibold text-primary mb-4">Lease-to-own Configuration</div>
          <div className="grid grid-cols-2 gap-6">
            <CustomInput
              label="Installment amount"
              name="installmentAmount"
              type="number"
              required={true}
              isCurrency={true}
              iconPosition="left"
              min={0}
            />
            <CustomInput
              label="Interest rate"
              name="interestRate"
              type="number"
              required={true}
              iconPosition="left"
              min={0}
              max={100}
              step={0.01}
            />
            <CustomInput
              label="Total price"
              name="totalPrice"
              type="number"
              required={true}
              isCurrency={true}
              iconPosition="left"
              min={0}
            />
            <CustomInput
              label="Number of installments"
              name="numberOfInstallments"
              type="number"
              required={true}
              iconPosition="left"
              min={1}
              max={120}
            />
          </div>
        </div>
      )}
    </>
  );
}