import React from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';

const dailyFields = [
  { label: 'Daily rental rate', name: 'dailyRentalRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Minimum rate', name: 'dailyMinimumRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Permitted daily km', name: 'dailyPermittedKm', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: false },
  { label: 'Excess km rate', name: 'dailyExcessKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Open km rate', name: 'dailyOpenKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
];
const monthlyFields = [
  { label: 'Monthly rental rate', name: 'monthlyRentalRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Minimum rate', name: 'monthlyMinimumRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Permitted daily km', name: 'monthlyPermittedKm', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: false },
  { label: 'Excess km rate', name: 'monthlyExcessKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Open km rate', name: 'monthlyOpenKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
];
const hourlyFields = [
  { label: 'Hourly rental rate', name: 'hourlyRentalRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Permitted km per hour', name: 'hourlyPermittedKm', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: false },
  { label: 'Excess km rate', name: 'hourlyExcessKmRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
  { label: 'Hourly delay rate', name: 'hourlyDelayRate', type: 'number', isRequired: true, min: 0, max: undefined, disabled: false, readOnly: false, isCurrency: true },
];

export default function PricingFeeStep() {
  const { values, setFieldValue } = useFormikContext<any>();

  // Calculate monthly and hourly rates based on daily rates
  React.useEffect(() => {
    // Calculate monthly rates (daily * 30)
    setFieldValue('monthlyRentalRate', values.dailyRentalRate ? (values.dailyRentalRate * 30).toFixed(2) : '');
    setFieldValue('monthlyMinimumRate', values.dailyMinimumRate ? (values.dailyMinimumRate * 30).toFixed(2) : '');
    setFieldValue('monthlyPermittedKm', values.dailyPermittedKm ? (values.dailyPermittedKm * 30) : '');
    setFieldValue('monthlyExcessKmRate', values.dailyExcessKmRate ? (values.dailyExcessKmRate * 30).toFixed(2) : '');
    setFieldValue('monthlyOpenKmRate', values.dailyOpenKmRate ? (values.dailyOpenKmRate * 30).toFixed(2) : '');

    // Calculate hourly rates (daily / 24) - round up
    setFieldValue('hourlyRentalRate', values.dailyRentalRate ? Math.ceil((values.dailyRentalRate / 24) * 100) / 100 : '');
    setFieldValue('hourlyPermittedKm', values.dailyPermittedKm ? Math.ceil(values.dailyPermittedKm / 24) : '');
    setFieldValue('hourlyExcessKmRate', values.dailyExcessKmRate ? Math.ceil((values.dailyExcessKmRate / 24) * 100) / 100 : '');
  }, [
    values.dailyRentalRate,
    values.dailyMinimumRate,
    values.dailyPermittedKm,
    values.dailyExcessKmRate,
    values.dailyOpenKmRate,
    setFieldValue
  ]);

  // Calculate hourly delay rate as hourly rental rate * 2 - round up
  React.useEffect(() => {
    const hourlyRate = parseFloat(values.hourlyRentalRate);
    if (hourlyRate && !isNaN(hourlyRate)) {
      setFieldValue('hourlyDelayRate', Math.ceil((hourlyRate * 2) * 100) / 100);
    }
  }, [values.hourlyRentalRate, setFieldValue]);

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Pricing/Fee</h2>

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
        <div className="font-semibold text-primary mb-2">Hourly rent</div>
        <div className="grid grid-cols-3 gap-6">
          {hourlyFields.map(field => (
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
    </>
  );
}