"use client";

import React from 'react';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { useField, useFormikContext } from 'formik';

// Simple Input without Formik
export const SimpleInput = ({
  label,
  required = false,
  error,
  className = '',
  icon,
  iconPosition = 'left',
  isCurrency = false,
  ...props
}: {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isCurrency?: boolean;
  [key: string]: any;
}) => {
  // Use SAR as default currency icon if isCurrency is true and no custom icon provided
  const displayIcon = isCurrency && !icon ? 'SAR' : icon;
  const hasIcon = !!displayIcon;
  const isLeftIcon = iconPosition === 'left';
  const isRightIcon = iconPosition === 'right';

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={props.id || props.name} className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {hasIcon && isLeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 text-sm font-medium">
            {displayIcon}
          </div>
        )}
        <Input
          {...props}
          className={`w-full h-12 border border-primary/30 rounded-lg py-2 text-primary bg-white placeholder:text-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''} ${props.className || ''} ${props.type === 'date' ? 'date-input-primary custom-date-input' : ''} ${hasIcon && isLeftIcon ? 'pl-12' : ''} ${hasIcon && isRightIcon ? 'pr-12' : ''} ${!hasIcon ? 'px-4' : ''}`}
        />
        {hasIcon && isRightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/60 text-sm font-medium">
            {displayIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik Input that uses SimpleInput
const CustomInput = ({
  name,
  label,
  required = false,
  className = '',
  icon,
  iconPosition = 'left',
  isCurrency = false,
  onChange,
  ...otherProps
}: {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isCurrency?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setFieldValue(name, value);

    // Call the custom onChange prop if provided
    if (onChange) {
      onChange(evt);
    }
  };

  const [field, meta] = useField(name);

  const configInputField = {
    ...field,
    ...otherProps,
    onChange: handleChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleInput
      {...configInputField}
      label={label}
      required={required}
      className={className}
      icon={icon}
      iconPosition={iconPosition}
      isCurrency={isCurrency}
    />
  );
};

export default CustomInput;