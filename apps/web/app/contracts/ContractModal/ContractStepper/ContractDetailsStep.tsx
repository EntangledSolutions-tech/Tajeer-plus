import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import SearchableSelect from '../../../reusableComponents/SearchableSelect';

interface ContractStatus {
  id: string;
  name: string;
  color: string | null;
  description?: string;
}

export default function ContractDetailsStep() {
  const formik = useFormikContext<any>();
  const [contractNumberType, setContractNumberType] = useState('dynamic');
  const [contractStatuses, setContractStatuses] = useState<any[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  // Get start date value to determine if end date should be enabled
  const startDate = formik.values.startDate;

  // Calculate minimum end date (day after start date)
  const getMinEndDate = () => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Handle start date change to reset end date if it's invalid
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    formik.setFieldValue('startDate', newStartDate);

    // Reset end date if it's before or equal to the new start date
    if (formik.values.endDate && formik.values.endDate <= newStartDate) {
      formik.setFieldValue('endDate', '');
    }
  };

  // Fetch contract statuses
  const fetchContractStatuses = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/api/contract-statuses?limit=100');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch contract statuses');
      }

      // Format statuses for SearchableSelect
      const statusOptions = result.statuses?.map((status: ContractStatus) => ({
        key: status.name,
        id: status.id,
        value: (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: status.color || '#ccc' }}
            />
            <span>{status.name}</span>
          </div>
        ),
        subValue: status.description
      })) || [];

      setContractStatuses(statusOptions);
    } catch (err: any) {
      console.error('Error fetching contract statuses:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle contract number type change
  const handleContractNumberTypeChange = (value: string) => {
    setContractNumberType(value);
    formik.setFieldValue('contractNumberType', value);

    // Clear the opposite field when switching types
    if (value === 'dynamic') {
      formik.setFieldValue('tajeerNumber', '');
    } else {
      formik.setFieldValue('contractNumber', '');
    }
  };

  // Fetch contract statuses on component mount
  useEffect(() => {
    fetchContractStatuses();
  }, []);

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
          <CustomInput
            label="Start Date"
            name="startDate"
            type="date"
            placeholder="Select date"
            required={true}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            onChange={handleStartDateChange}
          />
        </div>

        {/* End Date */}
        <div>
          <CustomInput
            label="End Date"
            name="endDate"
            type="date"
            placeholder="Select date"
            required={true}
            disabled={!startDate} // Disable until start date is selected
            min={getMinEndDate()} // Must be at least one day after start date
          />
          {!startDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Please select a start date first
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <CustomSelect
            label="Type"
            name="type"
            options={[
              { value: '', label: 'Eg. Daily, Monthly' },
              { value: 'daily', label: 'Daily' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'yearly', label: 'Yearly' }
            ]}
            required={true}
          />
        </div>

        {/* Insurance Type */}
        <div>
          <CustomSelect
            label="Insurance Type"
            name="insuranceType"
            options={[
              { value: '', label: 'Select type' },
              { value: 'comprehensive', label: 'Comprehensive' },
              { value: 'third_party', label: 'Third Party' },
              { value: 'none', label: 'None' }
            ]}
            required={true}
          />
        </div>

        {/* Status */}
        <div>
          <SearchableSelect
            label="Status"
            name="statusId"
            options={contractStatuses}
            placeholder="Select status"
            searchPlaceholder="Search statuses..."
            required={true}
            disabled={statusLoading}
          />
        </div>
      </div>

      {/* Contract Number Section */}
      <div className="mt-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary mb-3">
            Contract Number
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 text-primary font-medium">
              <input
                type="radio"
                name="contractNumberType"
                value="dynamic"
                checked={contractNumberType === 'dynamic'}
                onChange={(e) => handleContractNumberTypeChange(e.target.value)}
                className="accent-primary w-4 h-4"
              />
              Dynamic Contract number
            </label>
            <label className="flex items-center gap-2 text-primary font-medium">
              <input
                type="radio"
                name="contractNumberType"
                value="linked"
                checked={contractNumberType === 'linked'}
                onChange={(e) => handleContractNumberTypeChange(e.target.value)}
                className="accent-primary w-4 h-4"
              />
              Number linked to Tajeer
            </label>
          </div>
        </div>

        {contractNumberType === 'dynamic' && (
          <div>
            <CustomInput
              label="Contract Number"
              name="contractNumber"
              type="text"
              placeholder="Enter contract number"
              required={true}
            />
          </div>
        )}

        {contractNumberType === 'linked' && (
          <div>
            <CustomInput
              label="Tajeer Number"
              name="tajeerNumber"
              type="text"
              placeholder="Enter Tajeer linked number"
              required={true}
            />
          </div>
        )}
      </div>
    </>
  );
}
