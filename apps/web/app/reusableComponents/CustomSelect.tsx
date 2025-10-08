"use client";

import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Label } from '@kit/ui/label';

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  name: string;
  options: { value: string; label: string; color?: string }[];
  disabled?: boolean;
  readOnly?: boolean;
}

// Simple Select without Formik
export const SimpleSelect = ({
  label,
  required = false,
  error,
  className = '',
  options = [],
  disabled = false,
  readOnly = false,
  value,
  onChange,
  ...props
}: {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  options: { value: string; label: string; color?: string }[];
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}) => {
  // Filter out empty string values and create a placeholder option
  const validOptions = options.filter(opt => opt.value !== '');
  const placeholderOption = options.find(opt => opt.value === '');
  const placeholderText = placeholderOption ? placeholderOption.label : 'Select an option';

  // Ensure we have at least one valid option
  if (validOptions.length === 0) {
    console.warn(`SimpleSelect: No valid options provided. All options have empty values.`);
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={props.id || props.name} className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value || ''}
        onValueChange={onChange}
        disabled={disabled || readOnly}
      >
        <SelectTrigger className="w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-primary bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors">
          <SelectValue placeholder={placeholderText}>
            {value && validOptions.find(opt => opt.value === value) && (
              <div className="flex items-center gap-2">
                {validOptions.find(opt => opt.value === value)?.color && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: validOptions.find(opt => opt.value === value)?.color }}
                  />
                )}
                <span>{validOptions.find(opt => opt.value === value)?.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="border border-primary/30 rounded-lg shadow-lg">
          {validOptions.map(opt => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-primary hover:bg-accent hover:text-primary focus:bg-accent focus:text-primary focus:outline-none cursor-pointer data-[highlighted]:bg-accent data-[highlighted]:text-primary"
            >
              <div className="flex items-center gap-2">
                {opt.color && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: opt.color }}
                  />
                )}
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik Select that uses SimpleSelect
const CustomSelect = ({
  name,
  label,
  required = false,
  className = '',
  options = [],
  disabled = false,
  readOnly = false,
  onChange,
  ...otherProps
}: {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  options: { value: string; label: string; color?: string }[];
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  [key: string]: any;
}) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (value: string) => {
    setFieldValue(name, value);

    // Call the custom onChange prop if provided
    if (onChange) {
      onChange(value);
    }
  };

  const [field, meta] = useField(name);

  const configSelectField = {
    ...field,
    ...otherProps,
    onChange: handleChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleSelect
      {...configSelectField}
      label={label}
      required={required}
      className={className}
      options={options}
      disabled={disabled}
      readOnly={readOnly}
      value={field.value}
      onChange={handleChange}
    />
  );
};

export default CustomSelect;