import React from 'react';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
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
  const { values, setFieldValue } = useFormikContext<any>();

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

  const paymentType = values.paymentType || 'cash';

  const handlePaymentTypeChange = (type: 'cash' | 'LeaseToOwn') => {
    setFieldValue('paymentType', type);
  };

  // Clear fields when switching payment types
  React.useEffect(() => {
    if (paymentType === 'cash') {
      // Clear lease-to-own fields
      setFieldValue('installmentValue', '');
      setFieldValue('interestRate', '');
      setFieldValue('totalPrice', '');
      setFieldValue('numberOfInstallments', '');
    } else if (paymentType === 'LeaseToOwn') {
      // Clear cash payment fields
      setFieldValue('carPricing', '');
      setFieldValue('acquisitionDate', '');
      setFieldValue('operationDate', '');
      setFieldValue('depreciationRate', '');
      setFieldValue('depreciationYears', '');
    }
  }, [paymentType, setFieldValue]);


  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Vehicle Pricing & Depreciation</h2>

      {/* Age Range and Expected Sale Price */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <CustomSelect
          label="Age Range"
          name="ageRange"
          required={true}
          options={[
            { value: '0-1', label: '0-1 years' },
            { value: '2-3', label: '2-3 years' },
            { value: '4-5', label: '4-5 years' },
            { value: '6-7', label: '6-7 years' },
            { value: '8+', label: '8+ years' }
          ]}
        />
        <CustomInput
          label="Expected Sale Price"
          name="expectedSalePrice"
          required={true}
          type="number"
          placeholder="Enter expected sale price"
          min={0}
          isCurrency={true}
          iconPosition="left"
        />
      </div>

      {/* Payment Type Toggle */}
      <div className="mb-8">
        <div className="font-semibold text-primary mb-4">Payment Type</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="cash"
              checked={paymentType === 'cash'}
              onChange={() => handlePaymentTypeChange('cash')}
              className="w-4 h-4 text-primary border-primary focus:ring-primary accent-primary"
            />
            <span className="text-gray-700">Cash Payment</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="LeaseToOwn"
              checked={paymentType === 'LeaseToOwn'}
              onChange={() => handlePaymentTypeChange('LeaseToOwn')}
              className="w-4 h-4 text-primary border-primary focus:ring-primary accent-primary"
            />
            <span className="text-gray-700">Lease-to-own</span>
          </label>
        </div>
      </div>

      {/* Cash Payment Fields */}
      {paymentType === 'cash' && (
        <div className="flex flex-col gap-6">
          {vehiclePricingFields.map(field =>
            field.type === 'select' ? (
              <CustomSelect
                key={field.name}
                label={field.label}
                name={field.name}
                required={field.isRequired}
                options={field.options || []}
                placeholder="Select depreciation years"
              />
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
      )}

      {/* Lease-to-own Payment Fields */}
      {paymentType === 'LeaseToOwn' && (
        <div className="mb-8">
          <div className="font-semibold text-primary mb-4">Lease-to-own Configuration</div>
          <div className="grid grid-cols-2 gap-6">
            <CustomInput
              label="Installment Value"
              name="installmentValue"
              type="number"
              required={true}
              isCurrency={true}
              iconPosition="left"
              min={0}
            />
            <CustomInput
              label="Interest Rate (%)"
              name="interestRate"
              type="number"
              required={true}
              iconPosition="left"
              min={0}
              max={100}
              step={0.01}
            />
            <CustomInput
              label="Total Price"
              name="totalPrice"
              type="number"
              required={true}
              isCurrency={true}
              iconPosition="left"
              min={0}
            />
            <CustomInput
              label="Number of Installments"
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