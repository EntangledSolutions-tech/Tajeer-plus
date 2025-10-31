"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { countries, Country } from './countryCodes';
import FlagIcon from './FlagIcon';

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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = (countries.find(c => c.dialCode === value) || countries[0])!;

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm)
  );

  const handleSelect = (dialCode: string) => {
    setFieldValue(name, dialCode);
    if (onChange) {
      onChange(dialCode);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Value Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-3 pr-8 border border-primary/30 rounded-lg text-primary bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors text-left flex items-center gap-2"
      >
        <FlagIcon countryCode={selectedCountry.code} size={20} />
        <span>{selectedCountry.dialCode} - {selectedCountry.name}</span>
      </button>

      {/* Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-4 h-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-primary/30 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-primary/10">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-primary/30 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.dialCode)}
                  className={`w-full px-3 py-2 text-left hover:bg-primary/5 flex items-center gap-2 transition-colors ${
                    selectedCountry.code === country.code ? 'bg-primary/10' : ''
                  }`}
                >
                  <FlagIcon countryCode={country.code} size={20} />
                  <span className="text-sm text-primary">
                    {country.dialCode} - {country.name}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-primary/60">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

