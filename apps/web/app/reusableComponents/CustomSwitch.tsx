"use client";

import React from 'react';
import { Switch } from '@kit/ui/switch';
import { Label } from '@kit/ui/label';
import { useField, useFormikContext } from 'formik';

// Simple Switch without Formik
export const SimpleSwitch = ({
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
        <Switch {...props} />
        {label && (
          <Label htmlFor={props.id || props.name} className="text-primary font-medium">
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

// Formik Switch that uses SimpleSwitch
const CustomSwitch = ({
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

  const configSwitchField = {
    ...field,
    ...otherProps,
    checked: field.value,
    onCheckedChange: handleCheckedChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleSwitch
      {...configSwitchField}
      label={label}
      required={required}
      className={className}
    />
  );
};

export default CustomSwitch;
