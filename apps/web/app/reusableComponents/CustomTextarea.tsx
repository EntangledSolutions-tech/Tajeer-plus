"use client";

import React from 'react';
import { Textarea } from '@kit/ui/textarea';
import { Label } from '@kit/ui/label';
import { useField, useFormikContext } from 'formik';

// Simple Textarea without Formik
export const SimpleTextarea = ({
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
      <Textarea
        {...props}
        className={`w-full min-h-[48px] border border-primary/30 rounded-lg px-4 py-2 text-primary bg-white placeholder:text-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''} ${props.className || ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik Textarea that uses SimpleTextarea
const CustomTextarea = ({
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

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setFieldValue(name, value);
  };

  const [field, meta] = useField(name);

  const configTextareaField = {
    ...field,
    ...otherProps,
    onChange: handleChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleTextarea
      {...configTextareaField}
      label={label}
      required={required}
      className={className}
    />
  );
};

export default CustomTextarea;
