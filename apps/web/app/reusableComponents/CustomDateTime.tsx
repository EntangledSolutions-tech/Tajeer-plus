"use client";

import React, { useState } from 'react';
import { Calendar } from '@kit/ui/calendar';
import { Label } from '@kit/ui/label';
import { Input } from '@kit/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Button } from '@kit/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';
import { useField, useFormikContext } from 'formik';
import { format } from 'date-fns';
import { cn } from '@kit/ui/lib/utils';

// Simple DateTime Input without Formik
export const SimpleDateTime = ({
  label,
  required = false,
  error,
  className = '',
  type = 'date', // 'date', 'time', 'datetime'
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}: {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  type?: 'date' | 'time' | 'datetime';
  value?: Date | string;
  onChange?: (value: Date | string) => void;
  placeholder?: string;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onChange && date) {
      if (type === 'date') {
        onChange(format(date, 'yyyy-MM-dd'));
      } else if (type === 'datetime') {
        onChange(format(date, 'yyyy-MM-dd HH:mm:ss'));
      } else {
        onChange(format(date, 'HH:mm:ss'));
      }
    }
    if (type !== 'datetime') {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (timeString: string) => {
    if (selectedDate && onChange) {
      const [hours, minutes] = timeString.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0);
      setSelectedDate(newDate);
      onChange(format(newDate, 'yyyy-MM-dd HH:mm:ss'));
    }
  };

  const getDisplayValue = () => {
    if (!selectedDate) return '';

    if (type === 'date') {
      return format(selectedDate, 'MMM dd, yyyy');
    } else if (type === 'time') {
      return format(selectedDate, 'HH:mm');
    } else {
      return format(selectedDate, 'MMM dd, yyyy HH:mm');
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (type === 'date') return 'Select date';
    if (type === 'time') return 'Select time';
    return 'Select date and time';
  };

  return (
    <div className={className}>
      {label && (
        <Label className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-primary bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors justify-start text-left font-normal",
              error && "border-red-500 focus:ring-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            {getDisplayValue() || getPlaceholder()}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {type === 'time' ? (
            <div className="p-3">
              <Input
                type="time"
                value={selectedDate ? format(selectedDate, 'HH:mm') : ''}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className="border-primary/30"
            />
          )}

          {type === 'datetime' && selectedDate && (
            <div className="p-3 border-t border-primary/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Input
                  type="time"
                  value={format(selectedDate, 'HH:mm')}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik DateTime Input that uses SimpleDateTime
const CustomDateTime = ({
  name,
  label,
  required = false,
  className = '',
  type = 'date',
  ...otherProps
}: {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  type?: 'date' | 'time' | 'datetime';
  [key: string]: any;
}) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (value: Date | string) => {
    setFieldValue(name, value);
  };

  const [field, meta] = useField(name);

  const configDateTimeField = {
    ...field,
    ...otherProps,
    onChange: handleChange,
    value: field.value,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleDateTime
      {...configDateTimeField}
      label={label}
      required={required}
      className={className}
      type={type}
    />
  );
};

export default CustomDateTime;
