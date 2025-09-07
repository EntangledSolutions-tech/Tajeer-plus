import React from 'react';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';

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

const depreciationYearsOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

const vehiclePricingFields: PricingField[] = [
  { label: 'Car Pricing', name: 'carPricing', type: 'number', isRequired: true, min: 1, placeholder: 'Enter current car pricing (SAR)', isCurrency: true },
  { label: 'Acquisition Date', name: 'acquisitionDate', type: 'date', isRequired: true },
  { label: 'Operation Date', name: 'operationDate', type: 'date', isRequired: true },
  { label: 'Depreciation Rate (%)', name: 'depreciationRate', type: 'number', isRequired: true, min: 0, max: 100, placeholder: 'Enter depreciation rate (0-100)' },
  { label: 'Number of depreciation years', name: 'depreciationYears', type: 'select', isRequired: true, options: depreciationYearsOptions.map(year => ({ value: year, label: year })) },
];

export default function VehiclePricingStep() {
  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Vehicle Pricing & Depreciation</h2>
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
              max={field.max}
              placeholder={field.placeholder}
              isCurrency={field.isCurrency}
              iconPosition="left"
            />
          )
        )}
      </div>
    </>
  );
}