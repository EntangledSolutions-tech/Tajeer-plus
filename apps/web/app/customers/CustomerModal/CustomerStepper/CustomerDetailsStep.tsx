import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomSearchableDropdown, { SearchableDropdownOption } from '../../../reusableComponents/SearchableDropdown';
import PhoneNumberInput from '../../../reusableComponents/PhoneNumberInput';
import { countries } from '../../../reusableComponents/countryCodes';
import { useHttpService } from '../../../../lib/http-service';

  // Common fields for all ID types
const commonFields = [
  { label: 'ID Type', name: 'idType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select ID Type' },
    { value: 'GCC Countries Citizens', label: 'GCC Countries Citizens' },
    { value: 'National ID', label: 'National ID' },
    { value: 'Resident ID', label: 'Resident ID' },
    { value: 'Visitor', label: 'Visitor' }
  ] },
  // { label: 'ID Number', name: 'idNumber', type: 'text', isRequired: true, placeholder: 'Enter ID number', min: 1, max: 50 },
  { label: 'Name', name: 'name', type: 'text', isRequired: true, placeholder: 'Enter name', min: 2, max: 30 },
  // { label: 'Classification', name: 'classification', type: 'searchable-select', isRequired: true },
  // { label: 'License type', name: 'licenseType', type: 'searchable-select', isRequired: true },
  { label: 'Nationality', name: 'nationality', type: 'searchable-select', isRequired: true },
  // { label: 'Status', name: 'status', type: 'searchable-select', isRequired: true },
  { label: 'Mobile Number', name: 'mobileNumber', type: 'phone', isRequired: true, placeholder: 'Enter mobile number', min: 10, max: 15 },
  // { label: 'Address', name: 'address', type: 'text', isRequired: true, placeholder: 'Enter address', min: 10, max: 500 },
  { label: 'Email', name: 'email', type: 'email', isRequired: true, placeholder: 'Enter email address', min: 5, max: 100 },
  // { label: 'Date of birth', name: 'dateOfBirth', type: 'date', isRequired: true, placeholder: 'Select date', max: new Date().toISOString().split('T')[0] },
];

// Fields specific to National ID
const nationalIdFields = [
  { label: 'National ID Number', name: 'nationalIdNumber', type: 'text', isRequired: true, placeholder: 'Enter National ID number', min: 10, max: 10, unique: true },
  { label: 'National ID Issue Date', name: 'nationalIdIssueDate', type: 'date', isRequired: true, placeholder: 'Select issue date', max: new Date().toISOString().split('T')[0] },
  { label: 'National ID Expiry Date', name: 'nationalIdExpiryDate', type: 'date', isRequired: true, placeholder: 'Select expiry date', min: new Date().toISOString().split('T')[0] },
  { label: 'Place of Birth', name: 'placeOfBirth', type: 'searchable-select', isRequired: true, placeholder: 'Select place of birth' },
  { label: 'Father Name', name: 'fatherName', type: 'text', isRequired: true, placeholder: 'Enter father name', min: 2, max: 30 },
  { label: 'Mother Name', name: 'motherName', type: 'text', isRequired: true, placeholder: 'Enter mother name', min: 2, max: 30 },
];

// Fields specific to GCC Countries Citizens
const gccFields = [
  { label: 'ID Copy Number', name: 'idCopyNumber', type: 'text', isRequired: true, placeholder: 'Enter ID copy number', min: 1, max: 50, unique: true },
  { label: 'License Expiration Date', name: 'licenseExpirationDate', type: 'date', isRequired: true, placeholder: 'Select license expiration date', min: new Date().toISOString().split('T')[0] },
  { label: 'License Type', name: 'licenseType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select License Type' },
    { value: 'International License', label: 'International License' },
    { value: 'Local License', label: 'Local License' },
    { value: 'GCC License', label: 'GCC License' }
  ] },
  { label: 'Place of ID Issue', name: 'placeOfIdIssue', type: 'searchable-select', isRequired: true, placeholder: 'Select place of ID issue' },
];

// Fields specific to Visitor (complete field set based on screenshot layout)
// This array contains ALL fields for Visitor in the exact order for 2-column grid layout
// Left column (odd positions): ID Type, Border Number, Passport Number, License Number, ID Expiry Date, Place of ID Issue, Email
// Right column (even positions): Mobile Number, Country, ID Copy Number, License Expiry Date, License Type, Address
const visitorAllFields = [
  { label: 'ID Type', name: 'idType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select ID Type' },
    { value: 'GCC Countries Citizens', label: 'GCC Countries Citizens' },
    { value: 'National ID', label: 'National ID' },
    { value: 'Resident ID', label: 'Resident ID' },
    { value: 'Visitor', label: 'Visitor' }
  ] },
  { label: 'Mobile Number', name: 'mobileNumber', type: 'phone', isRequired: true, placeholder: 'Enter mobile number', min: 10, max: 15 },
  { label: 'Border Number', name: 'borderNumber', type: 'text', isRequired: true, placeholder: 'Enter border number', min: 1, max: 50 },
  { label: 'Country', name: 'country', type: 'searchable-select', isRequired: true, placeholder: 'Select country' },
  { label: 'Passport Number', name: 'passportNumber', type: 'text', isRequired: true, placeholder: 'Enter passport number', min: 1, max: 50, unique: true },
  { label: 'ID Copy Number', name: 'idCopyNumber', type: 'text', isRequired: true, placeholder: 'Enter ID copy number', min: 1, max: 50, unique: true },
  { label: 'License Number', name: 'licenseNumber', type: 'text', isRequired: true, placeholder: 'Enter license number', min: 1, max: 50, unique: true },
  { label: 'License Expiry Date', name: 'licenseExpiryDate', type: 'date', isRequired: true, placeholder: 'Select license expiry date', min: new Date().toISOString().split('T')[0] },
  { label: 'ID Expiry Date', name: 'idExpiryDate', type: 'date', isRequired: true, placeholder: 'Select ID expiry date', min: new Date().toISOString().split('T')[0] },
  { label: 'License Type', name: 'licenseType', type: 'select', isRequired: false, options: [
    { value: '', label: 'Select License Type' },
    { value: 'International License', label: 'International License' },
    { value: 'Local License', label: 'Local License' },
    { value: 'GCC License', label: 'GCC License' }
  ] },
  { label: 'Place of ID Issue', name: 'placeOfIdIssue', type: 'searchable-select', isRequired: true, placeholder: 'Select place of ID issue' },
  { label: 'Address', name: 'address', type: 'text', isRequired: true, placeholder: 'Enter address', min: 10, max: 500 },
  { label: 'Email', name: 'email', type: 'email', isRequired: true, placeholder: 'Enter email address', min: 5, max: 100 },
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
  const { getRequest } = useHttpService();
  const [classifications, setClassifications] = useState<SearchableDropdownOption[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<SearchableDropdownOption[]>([]);
  const [nationalities, setNationalities] = useState<SearchableDropdownOption[]>([]);
  const [statuses, setStatuses] = useState<SearchableDropdownOption[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<SearchableDropdownOption[]>([]);
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

      const result = await getRequest(`/api/customer-configurations/classifications?${searchParams}`);

      if (result.success && result.data) {
        const options: SearchableDropdownOption[] = result.data.data.map((item: Classification) => ({
          id: item.id,
          value: item.id, // Store the ID instead of the string
          label: item.classification,
          subLabel: item.description
        }));

        setClassifications(options);
      }
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

      const result = await getRequest(`/api/customer-configurations/license-types?${searchParams}`);

      if (result.success && result.data) {
        const options: SearchableDropdownOption[] = result.data.data.map((item: LicenseType) => ({
          id: item.id,
          value: item.id, // Store the ID instead of the string
          label: item.license_type,
          subLabel: item.description
        }));

        setLicenseTypes(options);
      }
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

      const result = await getRequest(`/api/customer-configurations/nationalities?${searchParams}`);

      if (result.success && result.data) {
        const options: SearchableDropdownOption[] = result.data.data.map((item: Nationality) => ({
          id: item.id,
          value: item.id, // Store the ID instead of the string
          label: item.nationality,
          subLabel: item.description
        }));

        setNationalities(options);
      }
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

      const result = await getRequest(`/api/customer-configuration/statuses?${searchParams}`);

      if (result.success && result.data) {
        const options: SearchableDropdownOption[] = result.data.statuses.map((item: CustomerStatus) => ({
          id: item.id,
          value: item.id, // Store the ID instead of the string
          label: item.name,
          subLabel: item.description
        }));

        setStatuses(options);
      }
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    } finally {
      setLoading(prev => ({ ...prev, statusLoading: false }));
    }
  };

  // Prepare countries options
  useEffect(() => {
    const options: SearchableDropdownOption[] = countries.map((country) => ({
      id: country.code,
      value: country.name,
      label: `${country.flag} ${country.name}`,
      subLabel: undefined
    }));
    setCountriesOptions(options);
  }, []);

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

  // Handle ID type changes and set default nationality for Resident ID
  useEffect(() => {
    const handleIdTypeChange = () => {
      if (values.idType === 'Resident ID' && nationalities.length > 0) {
        // Find Saudi Arabia nationality
        const saudiArabiaOption = nationalities.find(nationality =>
          nationality.label.toLowerCase().includes('saudi') ||
          nationality.label.toLowerCase().includes('arabia')
        );

        if (saudiArabiaOption && values.nationality !== saudiArabiaOption.id) {
          setFieldValue('nationality', saudiArabiaOption.id);
        }
      }
    };

    handleIdTypeChange();
  }, [values.idType, nationalities, values.nationality, setFieldValue]);

  // Helper function to render a field
  const renderField = (field: any) => {
    if (field.type === 'select') {
      return (
        <CustomSelect
          label={field.label}
          name={field.name}
          required={field.isRequired}
          options={field.options ?? []}
        />
      );
    } else if (field.type === 'radio') {
      return (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-4">
            {field.options?.map((option: any) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    } else if (field.type === 'searchable-select') {
      if (field.name === 'classification') {
        return (
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
        );
      } else if (field.name === 'licenseType') {
        return (
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
        );
      } else if (field.name === 'nationality') {
        return (
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
        );
      } else if (field.name === 'status') {
        return (
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
        );
      } else if (field.name === 'country' || field.name === 'placeOfIdIssue' || field.name === 'placeOfBirth') {
        return (
          <CustomSearchableDropdown
            name={field.name}
            label={field.label}
            options={countriesOptions}
            placeholder={
              field.name === 'country' ? 'Select country' :
              field.name === 'placeOfBirth' ? 'Select place of birth' :
              'Select place of ID issue'
            }
            searchPlaceholder="Search countries..."
            required={field.isRequired}
            isLoading={false}
            onSearch={() => {}} // No need to fetch, already loaded
          />
        );
      }
    } else if (field.type === 'phone') {
      return (
        <PhoneNumberInput
          name={field.name}
          label={field.label}
          required={field.isRequired}
          countryCodeName="countryCode"
        />
      );
    } else {
      return (
        <CustomInput
          label={field.label}
          name={field.name}
          required={field.isRequired}
          type={field.type}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          pattern={field.pattern}
        />
      );
    }
  };

  // Get fields based on selected ID type
  const getFieldsForIdType = () => {
    const selectedIdType = values.idType;

    if (selectedIdType === 'National ID') {
      return [...commonFields, ...nationalIdFields];
    } else if (selectedIdType === 'GCC Countries Citizens') {
      return [...commonFields, ...gccFields];
    } else if (selectedIdType === 'Visitor') {
      return visitorAllFields; // Use complete field set for Visitor (not commonFields)
    }
    // Default to common fields only (includes Resident ID)
    return commonFields;
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Customer Details</h2>
      <div className="grid grid-cols-2 gap-6">
        {getFieldsForIdType().map((field, idx) => (
          <div key={field.name} className="flex flex-col gap-4">
            {renderField(field)}
          </div>
        ))}
      </div>
    </>
  );
}