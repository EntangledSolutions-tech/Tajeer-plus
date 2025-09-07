"use client";

import React from 'react';
import { Checkbox } from '@kit/ui/checkbox';
import { Label } from '@kit/ui/label';
import { useField, useFormikContext } from 'formik';

// Simple Checkbox without Formik
export const SimpleCheckbox = ({
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
      <div className="flex items-center space-x-2">
        <Checkbox {...props} />
        {label && (
          <Label htmlFor={props.id || props.name} className="text-primary font-medium cursor-pointer">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik Checkbox that uses SimpleCheckbox
const CustomCheckbox = ({
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

  const handleCheckedChange = (checked: boolean) => {
    setFieldValue(name, checked);
  };

  const [field, meta] = useField(name);

  const configCheckboxField = {
    ...field,
    ...otherProps,
    checked: field.value,
    onCheckedChange: handleCheckedChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleCheckbox
      {...configCheckboxField}
      label={label}
      required={required}
      className={className}
    />
  );
};

export default CustomCheckbox;
