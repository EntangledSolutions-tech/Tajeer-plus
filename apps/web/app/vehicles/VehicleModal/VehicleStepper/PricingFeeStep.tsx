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
  { label: 'Monthly rental rate', name: 'monthlyRentalRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
  { label: 'Minimum rate', name: 'monthlyMinimumRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
  { label: 'Hourly delay rate', name: 'monthlyHourlyDelayRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
  { label: 'Permitted daily km', name: 'monthlyPermittedKm', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: false },
  { label: 'Excess km rate', name: 'monthlyExcessKmRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
  { label: 'Open km rate', name: 'monthlyOpenKmRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
];
const hourlyFields = [
  { label: 'Hourly rental rate', name: 'hourlyRentalRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
  { label: 'Permitted km per hour', name: 'hourlyPermittedKm', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: false },
  { label: 'Excess km rate', name: 'hourlyExcessKmRate', type: 'number', isRequired: true, min: undefined, max: undefined, disabled: true, readOnly: true, isCurrency: true },
];

export default function PricingFeeStep() {
  const { values, setFieldValue } = useFormikContext<any>();

  // Calculate monthly and hourly rates based on daily rates
  React.useEffect(() => {
    // Calculate monthly rates (daily * 30)
    setFieldValue('monthlyRentalRate', values.dailyRentalRate ? (values.dailyRentalRate * 30).toFixed(2) : '');
    setFieldValue('monthlyMinimumRate', values.dailyMinimumRate ? (values.dailyMinimumRate * 30).toFixed(2) : '');
    setFieldValue('monthlyHourlyDelayRate', values.dailyHourlyDelayRate ? (values.dailyHourlyDelayRate * 30).toFixed(2) : '');
    setFieldValue('monthlyPermittedKm', values.dailyPermittedKm ? (values.dailyPermittedKm * 30) : '');
    setFieldValue('monthlyExcessKmRate', values.dailyExcessKmRate ? (values.dailyExcessKmRate * 30).toFixed(2) : '');
    setFieldValue('monthlyOpenKmRate', values.dailyOpenKmRate ? (values.dailyOpenKmRate * 30).toFixed(2) : '');

    // Calculate hourly rates (daily / 24)
    setFieldValue('hourlyRentalRate', values.dailyRentalRate ? (values.dailyRentalRate / 24).toFixed(2) : '');
    setFieldValue('hourlyPermittedKm', values.dailyPermittedKm ? (values.dailyPermittedKm / 24).toFixed(2) : '');
    setFieldValue('hourlyExcessKmRate', values.dailyExcessKmRate ? (values.dailyExcessKmRate / 24).toFixed(2) : '');
  }, [
    values.dailyRentalRate,
    values.dailyMinimumRate,
    values.dailyHourlyDelayRate,
    values.dailyPermittedKm,
    values.dailyExcessKmRate,
    values.dailyOpenKmRate,
    setFieldValue
  ]);

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