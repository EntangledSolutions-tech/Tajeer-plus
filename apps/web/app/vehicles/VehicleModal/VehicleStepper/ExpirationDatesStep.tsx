import React from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';

function gregorianToHijri(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const parts = hijriFormatter.formatToParts(date);
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;
  if (!day || !month || !year) return '';
  return `${day}/${month}/${year}`;
}

const expirationFields = [
  { label: 'Form/license expiration date', name: 'formLicenseExpiration', type: 'date', isRequired: true, min: new Date().toISOString().split('T')[0], max: '2030-12-31' },
  { label: 'Insurance policy expiration date', name: 'insurancePolicyExpiration', type: 'date', isRequired: true, min: new Date().toISOString().split('T')[0] },
  { label: 'Periodic inspection end date', name: 'periodicInspectionEnd', type: 'date', isRequired: true },
  { label: 'Operating card expiration date', name: 'operatingCardExpiration', type: 'date', isRequired: true, min: new Date().toISOString().split('T')[0] },
];

export default function ExpirationDatesStep() {
  const { values } = useFormikContext<Record<string, string>>();
  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Expiration Dates</h2>
      <div className="flex flex-col gap-6 max-w-2xl">
        {expirationFields.map((field) => (
          <div key={field.name} className="flex items-center gap-4">
            <CustomInput label={field.label} name={field.name} required={field.isRequired} type={field.type} min={field.min} max={field.max} />
            <div className="flex flex-col items-start min-w-[90px]">
              <span className="text-xs text-primary font-medium">Hijri</span>
              <span className="text-primary font-bold text-base">
                {gregorianToHijri(values[field.name] ?? '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}