import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomDateTime from '../../../reusableComponents/CustomDateTime';
import { useHttpService } from '../../../../lib/http-service';

export default function ContractDetailsStep() {
  const formik = useFormikContext<any>();
  const [durationType, setDurationType] = useState('duration');
  const [totalFeesError, setTotalFeesError] = useState<string>('');

  // Get start date value to determine if end date should be enabled
  const startDate = formik.values.startDate;

  // Calculate minimum end date (day after start date)
  const getMinEndDate = () => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  };


  // Handle duration type change
  const handleDurationTypeChange = (value: string) => {
    setDurationType(value);
    formik.setFieldValue('durationType', value);

    // Clear the dynamic fields when switching types
    if (value === 'duration') {
      formik.setFieldValue('totalFees', 0); // Set to 0 instead of empty string
      setTotalFeesError(''); // Clear total fees error
    } else {
      formik.setFieldValue('durationInDays', 0); // Set to 0 instead of empty string
    }

    // Trigger validation update after field changes
    setTimeout(() => {
      formik.validateForm();
    }, 100);

    // Recalculate end date if start date exists - will be handled by useEffect
  };

  // Handle duration in days change (real-time as user types)
  const handleDurationInDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value) || 0;
    formik.setFieldValue('durationInDays', days);

    // Calculate end date immediately as user types - will be handled by useEffect

    // Trigger validation
    setTimeout(() => {
      formik.validateForm();
    }, 100);
  };

  // Handle total fees change (real-time as user types)
  const handleTotalFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fees = parseFloat(e.target.value) || 0;
    formik.setFieldValue('totalFees', fees);

    // Validate total fees against vehicle daily rate
    const vehicleDailyRate = parseFloat(formik.values.vehicleDailyRentRate) || 0;
    if (fees > 0 && vehicleDailyRate > 0 && fees < vehicleDailyRate) {
      setTotalFeesError('Total fees must be equal or greater than vehicle daily rate');
    } else {
      setTotalFeesError('');
    }

    // Calculate end date immediately as user types - will be handled by useEffect

    // Trigger validation
    setTimeout(() => {
      formik.validateForm();
    }, 100);
  };

  // Sync durationType state with formik values when component mounts
  useEffect(() => {
    if (formik.values.durationType && formik.values.durationType !== durationType) {
      setDurationType(formik.values.durationType);
    }
  }, [formik.values.durationType, durationType]);

  // Validate total fees when vehicle daily rate changes
  useEffect(() => {
    if (durationType === 'fees' && formik.values.totalFees && formik.values.vehicleDailyRentRate) {
      const fees = parseFloat(formik.values.totalFees) || 0;
      const vehicleDailyRate = parseFloat(formik.values.vehicleDailyRentRate) || 0;
      if (fees > 0 && vehicleDailyRate > 0 && fees < vehicleDailyRate) {
        setTotalFeesError('Total fees must be equal or greater than vehicle daily rate');
      } else {
        setTotalFeesError('');
      }
    }
  }, [durationType, formik.values.totalFees, formik.values.vehicleDailyRentRate]);

  // Set default duration when component mounts
  useEffect(() => {
    if (formik.values.startDate && durationType === 'duration' && (!formik.values.durationInDays || formik.values.durationInDays === 0)) {
      formik.setFieldValue('durationInDays', 1);
    }
  }, []); // Run only on mount

  // Main effect: Recalculate end date when start date, duration type, or duration values change
  useEffect(() => {
    const startDate = formik.values.startDate;

    if (!startDate || !durationType) {
      formik.setFieldValue('endDate', '');
      return;
    }

    let daysToAdd = 0;

    if (durationType === 'duration') {
      daysToAdd = parseInt(formik.values.durationInDays) || 0;
    } else if (durationType === 'fees') {
      const dailyRate = parseFloat(formik.values.vehicleDailyRentRate) || 0;
      const totalFees = parseFloat(formik.values.totalFees) || 0;
      daysToAdd = dailyRate > 0 ? Math.ceil(totalFees / dailyRate) : 0;
    }

    if (daysToAdd > 0) {
      // Parse startDate - CustomDateTime returns 'yyyy-MM-dd HH:mm:ss' format
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        // If parsing fails, return empty
        formik.setFieldValue('endDate', '');
        return;
      }
      const end = new Date(start);
      end.setDate(start.getDate() + daysToAdd);

      // Format as 'yyyy-MM-dd HH:mm:ss' for CustomDateTime datetime type
      const year = end.getFullYear();
      const month = String(end.getMonth() + 1).padStart(2, '0');
      const day = String(end.getDate()).padStart(2, '0');
      const hours = String(start.getHours()).padStart(2, '0');
      const minutes = String(start.getMinutes()).padStart(2, '0');
      const seconds = String(start.getSeconds()).padStart(2, '0');
      const endDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      formik.setFieldValue('endDate', endDateString);
    } else {
      formik.setFieldValue('endDate', '');
    }
  }, [
    formik.values.startDate,
    formik.values.durationInDays,
    formik.values.totalFees,
    formik.values.vehicleDailyRentRate,
    durationType
  ]);


  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Contract Details
      </h2>
      <p className="text-primary/70 mb-8">
        Please provide the basic contract information and details.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <CustomDateTime
            label="Start Date"
            name="startDate"
            type="datetime"
            placeholder="Select date and time"
            required={true}
            min={new Date().toISOString()} // Prevent past dates and times
          />
        </div>

            {/* End Date */}
            <div>
              <CustomDateTime
                label="End Date"
                name="endDate"
                type="datetime"
                placeholder="Calculated automatically"
                required={false}
                disabled={true} // Always disabled as it's calculated
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                End date is calculated automatically based on your selection below
              </p>
            </div>

      </div>

      {/* Duration Type and Duration Fields */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Duration Type */}
        <div>
          <CustomSelect
            label="Duration Type"
            name="durationType"
            options={[
              { value: '', label: 'Select duration type' },
              { value: 'duration', label: 'Duration' },
              { value: 'fees', label: 'Fees' }
            ]}
            required={true}
                onChange={(value: string) => handleDurationTypeChange(value)}
          />
        </div>

        {/* Dynamic Duration Field */}
        {durationType === 'duration' && (
          <div>
            <CustomInput
              label="Duration in Days"
              name="durationInDays"
              type="number"
              placeholder="Enter number of days"
              required={true}
              min="1"
              onChange={handleDurationInDaysChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              End date will be calculated as: Start Date + Duration
            </p>
          </div>
        )}

        {durationType === 'fees' && (
          <div>
            <CustomInput
              label="Total Fees"
              name="totalFees"
              type="number"
              placeholder="Enter total fees"
              required={true}
              min="0"
              step="0.01"
              isCurrency={true}
              onChange={handleTotalFeesChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Vehicle daily rate: {formik.values.vehicleDailyRentRate || 0} SAR
            </p>
            {totalFeesError && (
              <p className="mt-1 text-sm text-red-600">{totalFeesError}</p>
            )}
          </div>
        )}
      </div>

    </>
  );
}

