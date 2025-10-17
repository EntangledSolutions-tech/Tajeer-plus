import React from 'react';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import { useFormikContext } from 'formik';

const dailyFields = [
  { label: 'Daily rental rate', name: 'dailyRentalRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Minimum rate', name: 'dailyMinimumRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Hourly delay rate', name: 'dailyHourlyDelayRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Permitted daily km', name: 'dailyPermittedKm', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: false },
  { label: 'Excess km rate', name: 'dailyExcessKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Open km rate', name: 'dailyOpenKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
];
const monthlyFields = [
  { label: 'Monthly rental rate', name: 'monthlyRentalRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Minimum rate', name: 'monthlyMinimumRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Hourly delay rate', name: 'monthlyHourlyDelayRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Permitted daily km', name: 'monthlyPermittedKm', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: false },
  { label: 'Excess km rate', name: 'monthlyExcessKmRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Open km rate', name: 'monthlyOpenKmRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
];
const hourlyFields = [
  { label: 'Hourly rental rate', name: 'hourlyRentalRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Permitted km per hour', name: 'hourlyPermittedKm', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: false },
  { label: 'Excess km rate', name: 'hourlyExcessKmRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: false, readOnly: false, isCurrency: true },
];

export default function PricingFeeStep() {
  const { values, setFieldValue } = useFormikContext<any>();
  
  const paymentType = values.paymentType || 'cash';

  const handlePaymentTypeChange = (type: 'cash' | 'LeaseToOwn') => {
    setFieldValue('paymentType', type);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Pricing/Fee</h2>
      
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

      {/* Cash Payment Fields */}
      {paymentType === 'cash' && (
        <>
          <div className="mb-8">
            <div className="font-semibold text-primary mb-2">Daily rent</div>
            <div className="grid grid-cols-3 gap-6">
              {dailyFields.map(field => (
                <CustomInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  required={field.isRequired}
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  disabled={field.disabled}
                  readOnly={field.readOnly}
                  isCurrency={field.isCurrency}
                  iconPosition="left"
                />
              ))}
            </div>
          </div>
          <div className="mb-8">
            <div className="font-semibold text-primary mb-2">Monthly rent</div>
            <div className="grid grid-cols-3 gap-6">
              {monthlyFields.map(field => (
                <CustomInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  required={field.isRequired}
                  type={field.type}
                  isCurrency={field.isCurrency}
                  iconPosition="left"
                />
              ))}
            </div>
          </div>
          <div className="mb-8">
            <div className="font-semibold text-primary mb-2">Hourly rent</div>
            <div className="grid grid-cols-3 gap-6">
              {hourlyFields.map(field => (
                <CustomInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  required={field.isRequired}
                  type={field.type}
                  isCurrency={field.isCurrency}
                  iconPosition="left"
                />
              ))}
            </div>
          </div>
        </>
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