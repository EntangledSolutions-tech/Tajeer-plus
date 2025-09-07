"use client";

import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Input, InputProps } from '@kit/ui/input';

interface CustomFileInputProps extends Omit<InputProps, 'error' | 'type'> {
  label: string;
  required?: boolean;
  name: string;
}

export const CustomFileInput: React.FC<CustomFileInputProps> = ({ label, required, name, accept, ...props }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext<any>();

  return (
    <div className="w-full">
      <label className="block text-primary font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        type="file"
        name={name}
        accept={accept}
        onChange={e => {
          if (e.currentTarget.files && e.currentTarget.files[0]) {
            setFieldValue(name, e.currentTarget.files[0]);
          } else {
            setFieldValue(name, undefined);
          }
        }}
        className="w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-primary bg-white placeholder:text-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors"
        {...props}
      />
      {meta.touched && meta.error && <span className="mt-1 text-sm text-red-600">{meta.error}</span>}
    </div>
  );
};