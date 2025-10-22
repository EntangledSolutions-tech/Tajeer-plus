import React from 'react';
import CustomInput from '../../../reusableComponents/CustomInput';

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
  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Pricing/Fee</h2>
      
      {/* Daily rent section */}
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

      {/* Monthly rent section */}
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

      {/* Hourly rent section */}
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
  );
}