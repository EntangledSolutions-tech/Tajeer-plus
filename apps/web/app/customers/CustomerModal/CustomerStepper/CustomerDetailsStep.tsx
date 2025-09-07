import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomSearchableDropdown, { SearchableDropdownOption } from '../../../reusableComponents/SearchableDropdown';

const customerDetailsFields = [
  { label: 'Name', name: 'name', type: 'text', isRequired: true, placeholder: 'Enter name', min: 2, max: 100 },
  { label: 'ID Type', name: 'idType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select ID Type' },
    { value: 'National ID', label: 'National ID' },
    { value: 'Passport', label: 'Passport' },
    { value: 'Iqama', label: 'Iqama' },
    { value: 'GCC ID', label: 'GCC ID' }
  ] },
  { label: 'Classification', name: 'classification', type: 'searchable-select', isRequired: true },
  { label: 'License type', name: 'licenseType', type: 'searchable-select', isRequired: true },
  { label: 'Nationality', name: 'nationality', type: 'searchable-select', isRequired: true },
  { label: 'Status', name: 'status', type: 'searchable-select', isRequired: true },
  { label: 'Mobile Number', name: 'mobileNumber', type: 'text', isRequired: true, placeholder: 'Enter mobile number', min: 10, max: 15 },
  { label: 'Address', name: 'address', type: 'text', isRequired: true, placeholder: 'Enter address', min: 10, max: 500 },
  { label: 'ID Number', name: 'idNumber', type: 'text', isRequired: true, placeholder: 'Enter number', min: 1, max: 50 },
  { label: 'Date of birth', name: 'dateOfBirth', type: 'date', isRequired: true, placeholder: 'Select date', max: new Date().toISOString().split('T')[0] },
];

interface Classification {
  id: string;
  code: string;
  classification: string;
  description?: string;
  is_active: boolean;
}

interface LicenseType {
  id: string;
  code: string;
  license_type: string;
  description?: string;
  is_active: boolean;
}

interface Nationality {
  id: string;
  code: string;
  nationality: string;
  description?: string;
  is_active: boolean;
}

interface CustomerStatus {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function CustomerDetailsStep() {
  const { values, setFieldValue } = useFormikContext<any>();
  const [classifications, setClassifications] = useState<SearchableDropdownOption[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<SearchableDropdownOption[]>([]);
  const [nationalities, setNationalities] = useState<SearchableDropdownOption[]>([]);
  const [statuses, setStatuses] = useState<SearchableDropdownOption[]>([]);
  const [loading, setLoading] = useState({
    classificationLoading: false,
    licenseTypeLoading: false,
    nationalityLoading: false,
    statusLoading: false
  });

  // Fetch classifications
  const fetchClassifications = async (search: string = '') => {
    setLoading(prev => ({ ...prev, classificationLoading: true }));

    try {
      const searchParams = new URLSearchParams({
        page: '1',
        limit: '100',
        active: 'true'
      });

      if (search) {
        searchParams.append('search', search);
      }

      const response = await fetch(`/api/customer-configurations/classifications?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch classifications');
      }

      const result: ApiResponse<Classification> = await response.json();

      const options: SearchableDropdownOption[] = result.data.map(item => ({
        id: item.id,
        value: item.id, // Store the ID instead of the string
        label: item.classification,
        subLabel: item.description
      }));

      setClassifications(options);
    } catch (err) {
      console.error('Error fetching classifications:', err);
      setClassifications([]);
    } finally {
      setLoading(prev => ({ ...prev, classificationLoading: false }));
    }
  };

  // Fetch license types
  const fetchLicenseTypes = async (search: string = '') => {
    setLoading(prev => ({ ...prev, licenseTypeLoading: true }));

    try {
      const searchParams = new URLSearchParams({
        page: '1',
        limit: '100',
        active: 'true'
      });

      if (search) {
        searchParams.append('search', search);
      }

      const response = await fetch(`/api/customer-configurations/license-types?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch license types');
      }

      const result: ApiResponse<LicenseType> = await response.json();

      const options: SearchableDropdownOption[] = result.data.map(item => ({
        id: item.id,
        value: item.id, // Store the ID instead of the string
        label: item.license_type,
        subLabel: item.description
      }));

      setLicenseTypes(options);
    } catch (err) {
      console.error('Error fetching license types:', err);
      setLicenseTypes([]);
    } finally {
      setLoading(prev => ({ ...prev, licenseTypeLoading: false }));
    }
  };

  // Fetch nationalities
  const fetchNationalities = async (search: string = '') => {
    setLoading(prev => ({ ...prev, nationalityLoading: true }));

    try {
      const searchParams = new URLSearchParams({
        page: '1',
        limit: '100',
        active: 'true'
      });

      if (search) {
        searchParams.append('search', search);
      }

      const response = await fetch(`/api/customer-configurations/nationalities?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch nationalities');
      }

      const result: ApiResponse<Nationality> = await response.json();

      const options: SearchableDropdownOption[] = result.data.map(item => ({
        id: item.id,
        value: item.id, // Store the ID instead of the string
        label: item.nationality,
        subLabel: item.description
      }));

      setNationalities(options);
    } catch (err) {
      console.error('Error fetching nationalities:', err);
      setNationalities([]);
    } finally {
      setLoading(prev => ({ ...prev, nationalityLoading: false }));
    }
  };

  // Fetch statuses
  const fetchStatuses = async (search: string = '') => {
    setLoading(prev => ({ ...prev, statusLoading: true }));

    try {
      const searchParams = new URLSearchParams({
        page: '1',
        limit: '100'
      });

      if (search) {
        searchParams.append('search', search);
      }

      const response = await fetch(`/api/customer-configuration/statuses?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }

      const result = await response.json();

      const options: SearchableDropdownOption[] = result.statuses.map((item: CustomerStatus) => ({
        id: item.id,
        value: item.id, // Store the ID instead of the string
        label: item.name,
        subLabel: item.description
      }));

      setStatuses(options);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    } finally {
      setLoading(prev => ({ ...prev, statusLoading: false }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchClassifications();
    fetchLicenseTypes();
    fetchNationalities();
    fetchStatuses();
  }, []);

  // Handle initial values for edit mode
  useEffect(() => {
    const handleInitialValues = async () => {
      // If we have initial values and the options are loaded, we need to find the correct IDs
      if (values.classification && classifications.length > 0) {
        // Find the classification ID by name
        const classificationOption = classifications.find(classification =>
          classification.label === values.classification
        );
        if (classificationOption && classificationOption.id !== values.classification) {
          setFieldValue('classification', classificationOption.id);
        }
      }

      if (values.licenseType && licenseTypes.length > 0) {
        // Find the license type ID by name
        const licenseTypeOption = licenseTypes.find(licenseType =>
          licenseType.label === values.licenseType
        );
        if (licenseTypeOption && licenseTypeOption.id !== values.licenseType) {
          setFieldValue('licenseType', licenseTypeOption.id);
        }
      }

      if (values.nationality && nationalities.length > 0) {
        // Find the nationality ID by name
        const nationalityOption = nationalities.find(nationality =>
          nationality.label === values.nationality
        );
        if (nationalityOption && nationalityOption.id !== values.nationality) {
          setFieldValue('nationality', nationalityOption.id);
        }
      }

      if (values.status && statuses.length > 0) {
        // Find the status ID by name
        const statusOption = statuses.find(status =>
          status.label === values.status
        );
        if (statusOption && statusOption.id !== values.status) {
          setFieldValue('status', statusOption.id);
        }
      }
    };

    handleInitialValues();
  }, [values.classification, values.licenseType, values.nationality, values.status,
      classifications, licenseTypes, nationalities, statuses, setFieldValue]);

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Customer Details</h2>
      <div className="grid grid-cols-2 gap-6">
        {customerDetailsFields.map((field, idx) => (
          <div key={field.name} className="flex flex-col gap-4">
            {field.type === 'select' ? (
              <CustomSelect
                label={field.label}
                name={field.name}
                required={field.isRequired}
                options={field.options ?? []}
              />
            ) : field.type === 'searchable-select' ? (
              <>
                {field.name === 'classification' && (
                  <CustomSearchableDropdown
                    name={field.name}
                    label={field.label}
                    options={classifications}
                    placeholder="Select classification"
                    searchPlaceholder="Search classifications..."
                    required={field.isRequired}
                    isLoading={loading.classificationLoading}
                    onSearch={fetchClassifications}
                  />
                )}
                {field.name === 'licenseType' && (
                  <CustomSearchableDropdown
                    name={field.name}
                    label={field.label}
                    options={licenseTypes}
                    placeholder="Select license type"
                    searchPlaceholder="Search license types..."
                    required={field.isRequired}
                    isLoading={loading.licenseTypeLoading}
                    onSearch={fetchLicenseTypes}
                  />
                )}
                {field.name === 'nationality' && (
                  <CustomSearchableDropdown
                    name={field.name}
                    label={field.label}
                    options={nationalities}
                    placeholder="Select nationality"
                    searchPlaceholder="Search nationalities..."
                    required={field.isRequired}
                    isLoading={loading.nationalityLoading}
                    onSearch={fetchNationalities}
                  />
                )}
                {field.name === 'status' && (
                  <CustomSearchableDropdown
                    name={field.name}
                    label={field.label}
                    options={statuses}
                    placeholder="Select status"
                    searchPlaceholder="Search statuses..."
                    required={field.isRequired}
                    isLoading={loading.statusLoading}
                    onSearch={fetchStatuses}
                  />
                )}
              </>
            ) : (
              <CustomInput
                label={field.label}
                name={field.name}
                required={field.isRequired}
                type={field.type}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}