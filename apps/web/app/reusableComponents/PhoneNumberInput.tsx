"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useField, useFormikContext } from 'formik';
import { Label } from '@kit/ui/label';
import { ChevronDown, Search } from 'lucide-react';
import { countries, Country } from './countryCodes';
import FlagIcon from './FlagIcon';

interface PhoneNumberInputProps {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  countryCodeName?: string;
}

export default function PhoneNumberInput({
  name,
  label,
  required = false,
  className = '',
  countryCodeName = 'countryCode'
}: PhoneNumberInputProps) {
  const { setFieldValue } = useFormikContext<any>();
  const [field, meta] = useField(name);
  const [countryCodeField] = useField(countryCodeName);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const error = meta.touched && meta.error ? meta.error : undefined;

  const selectedCountry = (countries.find(c => c.dialCode === countryCodeField.value) || countries[0])!;

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (dialCode: string) => {
    setFieldValue(countryCodeName, dialCode);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFieldValue(name, value);
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={name} className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {/* Single Input Field Container */}
        <div className={`flex items-center w-full h-12 border border-primary/30 rounded-lg bg-white hover:border-primary transition-colors ${error ? 'border-red-500' : ''} ${isDropdownOpen ? 'border-primary ring-2 ring-primary/20' : ''}`}>
          {/* Country Code Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 h-full border-r border-primary/20 hover:bg-gray-50 transition-colors"
            >
              <FlagIcon countryCode={selectedCountry.code} size={24} />
              <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-primary/30 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-primary/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Country List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country.dialCode)}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/5 transition-colors ${
                        country.dialCode === countryCodeField.value ? 'bg-primary/10' : ''
                      }`}
                    >
                      <FlagIcon countryCode={country.code} size={24} />
                      <span className="text-sm font-medium text-primary">{country.dialCode}</span>
                      <span className="text-sm text-primary/70 flex-1 text-left">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Number Input */}
          <input
            {...field}
            id={name}
            type="tel"
            onChange={handleNumberChange}
            placeholder="Enter mobile number"
            className="flex-1 px-4 py-2 bg-transparent border-none outline-none text-primary placeholder:text-primary/60"
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

