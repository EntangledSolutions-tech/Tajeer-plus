import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomSearchableDropdown, { SearchableDropdownOption } from '../../../reusableComponents/SearchableDropdown';
import PhoneNumberInput from '../../../reusableComponents/PhoneNumberInput';
import { countries } from '../../../reusableComponents/countryCodes';
import { useHttpService } from '../../../../lib/http-service';

// Company Information Fields
const companyFields = [
  { label: 'Company Name', name: 'companyName', type: 'text', isRequired: true, placeholder: 'Enter company name', min: 2, max: 50 },
  { label: 'Tax Number', name: 'taxNumber', type: 'text', isRequired: true, placeholder: 'Enter 15-digit tax number', min: 15, max: 15, pattern: '[0-9]{15}' },
  { label: 'Commercial Registration Number', name: 'commercialRegistrationNumber', type: 'text', isRequired: true, placeholder: 'Enter 10-digit CR number', min: 10, max: 10, pattern: '[0-9]{10}' },
  { label: 'Mobile Number', name: 'mobileNumber', type: 'phone', isRequired: true, placeholder: 'Enter mobile number', min: 7, max: 15 },
  { label: 'Email', name: 'email', type: 'email', isRequired: true, placeholder: 'Enter email address', min: 5, max: 100 },
  { label: 'Country', name: 'country', type: 'searchable-select', isRequired: true, placeholder: 'Select country' },
  { label: 'City', name: 'city', type: 'text', isRequired: true, placeholder: 'Enter city', min: 2, max: 50 },
  { label: 'Address', name: 'address', type: 'text', isRequired: true, placeholder: 'Enter address', min: 10, max: 500 },
  { label: 'License Number', name: 'licenseNumber', type: 'text', isRequired: true, placeholder: 'Enter license number', min: 1, max: 50 },
  { label: 'License Type', name: 'licenseType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select License Type' },
    { value: 'Local License', label: 'Local License', description: 'رخصة محلية' },
    { value: 'International License', label: 'International License', description: 'رخصة دولية' }
  ]},
  { label: 'License Expiry Date', name: 'licenseExpiryDate', type: 'date', isRequired: true, placeholder: 'Select license expiry date', min: new Date().toISOString().split('T')[0] },
  { label: 'Establishment Date', name: 'establishmentDate', type: 'date', isRequired: true, placeholder: 'Select establishment date', max: new Date().toISOString().split('T')[0] },
];

// Legal Representative Fields
const legalRepresentativeFields = [
  { label: 'Legal Representative Name', name: 'authorizedPersonName', type: 'text', isRequired: true, placeholder: 'Enter legal representative name', min: 2, max: 100 },
  { label: 'Legal Representative ID Number', name: 'authorizedPersonId', type: 'text', isRequired: true, placeholder: 'Enter ID number', min: 1, max: 50 },
  { label: 'Legal Representative Email', name: 'authorizedPersonEmail', type: 'email', isRequired: true, placeholder: 'Enter email address', min: 5, max: 100 },
  { label: 'Legal Representative Mobile Number', name: 'authorizedPersonMobile', type: 'phone', isRequired: true, placeholder: 'Enter mobile number', min: 7, max: 15 },
  { label: 'Rental Type', name: 'rentalType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select Rental Type' },
    { value: 'Daily', label: 'Daily', description: 'باليوم' },
    { value: 'Weekly', label: 'Weekly', description: 'بالأسبوع' },
    { value: 'Monthly', label: 'Monthly', description: 'بالشهر' }
  ]},
];

interface LicenseType {
  id: string;
  code: string;
  license_type: string;
  description?: string;
  is_active: boolean;
}

export default function CompanyDetailsStep() {
  const { values, setFieldValue } = useFormikContext<any>();
  const { getRequest } = useHttpService();
  const [licenseTypes, setLicenseTypes] = useState<SearchableDropdownOption[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<SearchableDropdownOption[]>([]);
  const [loading, setLoading] = useState({
    licenseTypeLoading: false
  });

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
          value: item.id,
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

  // Prepare countries options
  useEffect(() => {
    const options: SearchableDropdownOption[] = countries.map((country) => ({
      id: country.code,
      value: country.name,
      label: `${country.flag} ${country.name}`,
      subLabel: undefined
    }));
    setCountriesOptions(options);

    // Set Saudi Arabia as default for country field if not set
    if (!values.country) {
      setFieldValue('country', 'Saudi Arabia');
    }
  }, [setFieldValue]);

  // Fetch data on component mount
  useEffect(() => {
    fetchLicenseTypes();
  }, []);

  // Set default country code to Saudi Arabia on mount
  useEffect(() => {
    if (!values.countryCode) {
      setFieldValue('countryCode', '+966'); // Saudi Arabia default
    }
  }, [setFieldValue]);

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
    } else if (field.type === 'searchable-select') {
      if (field.name === 'licenseType') {
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
      } else if (field.name === 'country') {
        return (
          <CustomSearchableDropdown
            name={field.name}
            label={field.label}
            options={countriesOptions}
            placeholder="Select country"
            searchPlaceholder="Search countries..."
            required={field.isRequired}
            isLoading={false}
            onSearch={() => {}}
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

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Company Details</h2>

      {/* Company Information Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Company Information</h3>
        <div className="grid grid-cols-2 gap-6">
          {companyFields.map((field, idx) => (
            <div key={field.name} className="flex flex-col gap-4">
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Legal Representative Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Legal Representative Information</h3>
        <div className="grid grid-cols-2 gap-6">
          {legalRepresentativeFields.map((field, idx) => (
            <div key={field.name} className="flex flex-col gap-4">
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
