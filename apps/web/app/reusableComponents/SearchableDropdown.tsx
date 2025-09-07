"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useField, useFormikContext } from 'formik';
import { Label } from '@kit/ui/label';

export interface SearchableDropdownOption {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
}

interface SearchableDropdownProps {
  options: SearchableDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  onSearch?: (searchTerm: string) => void;
  isLoading?: boolean;
}

// Simple SearchableDropdown without Formik
export const SimpleSearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  label,
  required = false,
  disabled = false,
  className = '',
  error,
  onSearch,
  isLoading = false
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SearchableDropdownOption[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.subLabel && option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

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

  // Get selected option label
  const getSelectedLabel = () => {
    const selected = options.find(option => option.value === value);
    return selected ? selected.label : placeholder;
  };

  // Handle option selection
  const handleOptionSelect = (option: SearchableDropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle clear selection
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <Label htmlFor={label} className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-left text-primary bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`block truncate ${!value ? 'text-primary/60' : ''}`}>
          {getSelectedLabel()}
        </span>
        <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-primary/30 rounded-lg shadow-lg max-h-60">
          <div className="p-2 border-b border-primary/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/60" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className="w-full pl-8 pr-2 py-1 border border-primary/30 rounded text-sm text-primary bg-white placeholder:text-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-primary/60">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-primary/60">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent focus:outline-none text-sm text-primary"
                >
                  <div className="font-medium">{option.label}</div>
                  {option.subLabel && (
                    <div className="text-xs text-primary/60">{option.subLabel}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik SearchableDropdown that uses SimpleSearchableDropdown
const CustomSearchableDropdown = ({
  name,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  label,
  required = false,
  disabled = false,
  className = '',
  onSearch,
  isLoading = false
}: {
  name: string;
  options: SearchableDropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onSearch?: (searchTerm: string) => void;
  isLoading?: boolean;
}) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (value: string) => {
    setFieldValue(name, value);
  };

  const [field, meta] = useField(name);

  return (
    <SimpleSearchableDropdown
      options={options}
      value={field.value}
      onChange={handleChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
      error={meta.touched && meta.error ? meta.error : undefined}
      onSearch={onSearch}
      isLoading={isLoading}
    />
  );
};

export default CustomSearchableDropdown;
