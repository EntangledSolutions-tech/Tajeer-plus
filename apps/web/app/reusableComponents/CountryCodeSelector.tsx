"use client";

import React from 'react';
import { useFormikContext } from 'formik';
import { countries, Country } from './countryCodes';

interface CountryCodeSelectorProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function CountryCodeSelector({
  name,
  value,
  onChange,
  className = ''
}: CountryCodeSelectorProps) {
  const { setFieldValue } = useFormikContext<any>();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setFieldValue(name, selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
  };

  const selectedCountry = countries.find(c => c.dialCode === value) || countries[0];

  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value || countries[0].dialCode}
        onChange={handleChange}
        className="w-full h-12 px-3 pr-8 border border-primary/30 rounded-lg text-primary bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors appearance-none cursor-pointer"
      >
        {countries.map((country) => (
          <option key={country.code} value={country.dialCode}>
            {country.flag} {country.dialCode} {country.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

