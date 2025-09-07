"use client";

import React from 'react';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { useField, useFormikContext } from 'formik';

// Simple Color Input without Formik
export const SimpleColorInput = ({
  label,
  required = false,
  error,
  className = '',
  ...props
}: {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={props.id || props.name} className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          {...props}
          className="h-10 w-16 p-1 border border-primary/30 rounded cursor-pointer"
        />
        <Input
          {...props}
          className={`w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-primary bg-white placeholder:text-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''} ${props.className || ''}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik Color Input that uses SimpleColorInput
const CustomColorInput = ({
  name,
  label,
  required = false,
  className = '',
  ...otherProps
}: {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setFieldValue(name, value);
  };

  const [field, meta] = useField(name);

  const configInputField = {
    ...field,
    ...otherProps,
    onChange: handleChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleColorInput
      {...configInputField}
      label={label}
      required={required}
      className={className}
    />
  );
};

export default CustomColorInput;
