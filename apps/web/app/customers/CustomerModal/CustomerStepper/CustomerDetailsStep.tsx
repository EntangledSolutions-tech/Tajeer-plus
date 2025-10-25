import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomSearchableDropdown, { SearchableDropdownOption } from '../../../reusableComponents/SearchableDropdown';
import PhoneNumberInput from '../../../reusableComponents/PhoneNumberInput';
import { countries } from '../../../reusableComponents/countryCodes';
import { useHttpService } from '../../../../lib/http-service';

// Fields for National ID and Resident ID (both share the same form layout)
const nationalAndResidentIdFields = [
  { label: 'ID Type', name: 'idType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select ID Type' },
    { value: 'National ID', label: 'National ID', description: 'For Saudi citizens' },
    { value: 'Resident ID', label: 'Resident ID', description: 'For residents with iqama' },
    { value: 'GCC Countries Citizens', label: 'GCC Citizen', description: 'For users from Gulf Cooperation Council countries' },
    { value: 'Visitor', label: 'Visitor', description: 'For foreign visitors holding border/passport info' }
  ] },
  { label: 'Mobile Number', name: 'mobileNumber', type: 'phone', isRequired: true, placeholder: 'Enter mobile number', min: 10, max: 15 },
  { label: 'National/Resident ID Number', name: 'nationalOrResidentIdNumber', type: 'text', isRequired: true, placeholder: 'Enter ID number', min: 1, max: 50, unique: true },
  { label: 'Birth Date', name: 'birthDate', type: 'date', isRequired: true, placeholder: 'Select birth date', max: new Date().toISOString().split('T')[0] },
  { label: 'Address', name: 'address', type: 'text', isRequired: true, placeholder: 'Enter address', min: 10, max: 500 },
  { label: 'Email', name: 'email', type: 'email', isRequired: true, placeholder: 'Enter email address', min: 5, max: 100 },
  { label: 'Rental Type', name: 'rentalType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select Rental Type' },
    { value: 'Daily without driver', label: 'Daily without driver', description: 'باليوم بدون سائق' },
    { value: 'Daily with driver', label: 'Daily with driver', description: 'باليوم بسائق' },
    { value: 'Weekly without driver', label: 'Weekly without driver', description: 'بالأسبوع بدون سائق' },
    { value: 'Weekly with driver', label: 'Weekly with driver', description: 'بالأسبوع بسائق' },
    { value: 'Monthly without driver', label: 'Monthly without driver', description: 'بالشهر بدون سائق' },
    { value: 'Monthly with driver', label: 'Monthly with driver', description: 'بالشهر بسائق' }
  ] },
];

// Fields specific to GCC Countries Citizens (complete field set based on screenshot)
// This array contains ALL fields for GCC Countries Citizens in the exact order for 2-column grid layout
const gccAllFields = [
  { label: 'ID Type', name: 'idType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select ID Type' },
    { value: 'National ID', label: 'National ID', description: 'For Saudi citizens' },
    { value: 'Resident ID', label: 'Resident ID', description: 'For residents with iqama' },
    { value: 'GCC Countries Citizens', label: 'GCC Citizen', description: 'For users from Gulf Cooperation Council countries' },
    { value: 'Visitor', label: 'Visitor', description: 'For foreign visitors holding border/passport info' }
  ] },
  { label: 'Mobile Number', name: 'mobileNumber', type: 'phone', isRequired: true, placeholder: 'Enter mobile number', min: 10, max: 15 },
  { label: 'Country', name: 'country', type: 'searchable-select', isRequired: true, placeholder: 'Select country' },
  { label: 'National/GCC ID Number', name: 'nationalOrGccIdNumber', type: 'text', isRequired: true, placeholder: 'Enter ID number', min: 1, max: 50, unique: true },
  { label: 'ID Copy Number', name: 'idCopyNumber', type: 'number', isRequired: true, placeholder: 'Enter ID copy number', min: 1, unique: true },
  { label: 'License Number', name: 'licenseNumber', type: 'text', isRequired: true, placeholder: 'Enter license number', min: 1, max: 50, unique: true },
  { label: 'ID Expiry Date', name: 'idExpiryDate', type: 'date', isRequired: true, placeholder: 'Select ID expiry date', min: new Date().toISOString().split('T')[0] },
  { label: 'License Expiry Date', name: 'licenseExpiryDate', type: 'date', isRequired: true, placeholder: 'Select license expiry date', min: new Date().toISOString().split('T')[0] },
  { label: 'License Type', name: 'licenseType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select License Type' },
    { value: 'International License', label: 'International License', description: 'رخصة دولية' },
    { value: 'Local License', label: 'Local License', description: 'رخصة محلية' },
    { value: 'GCC License', label: 'GCC License', description: 'رخصة خليجية' }
  ] },
  { label: 'Place of ID Issue', name: 'placeOfIdIssue', type: 'searchable-select', isRequired: true, placeholder: 'Select place of ID issue' },
  { label: 'Address', name: 'address', type: 'text', isRequired: true, placeholder: 'Enter address', min: 10, max: 500 },
  { label: 'Email', name: 'email', type: 'email', isRequired: true, placeholder: 'Enter email address', min: 5, max: 100 },
  { label: 'Rental Type', name: 'rentalType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select Rental Type' },
    { value: 'Daily without driver', label: 'Daily without driver', description: 'باليوم بدون سائق' },
    { value: 'Daily with driver', label: 'Daily with driver', description: 'باليوم بسائق' },
    { value: 'Weekly without driver', label: 'Weekly without driver', description: 'بالأسبوع بدون سائق' },
    { value: 'Weekly with driver', label: 'Weekly with driver', description: 'بالأسبوع بسائق' },
    { value: 'Monthly without driver', label: 'Monthly without driver', description: 'بالشهر بدون سائق' },
    { value: 'Monthly with driver', label: 'Monthly with driver', description: 'بالشهر بسائق' }
  ] },
];

// Fields specific to Visitor (complete field set based on screenshot layout)
// This array contains ALL fields for Visitor in the exact order for 2-column grid layout
// Left column (odd positions): ID Type, Border Number, Passport Number, License Number, ID Expiry Date, Place of ID Issue, Email
// Right column (even positions): Mobile Number, Country, ID Copy Number, License Expiry Date, License Type, Address
const visitorAllFields = [
  { label: 'ID Type', name: 'idType', type: 'select', isRequired: true, options: [
    { value: '', label: 'Select ID Type' },
    { value: 'National ID', label: 'National ID', description: 'For Saudi citizens' },
    { value: 'Resident ID', label: 'Resident ID', description: 'For residents with iqama' },
    { value: 'GCC Countries Citizens', label: 'GCC Citizen', description: 'For users from Gulf Cooperation Council countries' },
    { value: 'Visitor', label: 'Visitor', description: 'For foreign visitors holding border/passport info' }
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

  // Prepare countries options (Saudi Arabia is already first in the countries array)
  useEffect(() => {
    const options: SearchableDropdownOption[] = countries.map((country) => ({
      id: country.code,
      value: country.name,
      label: `${country.flag} ${country.name}`,
      subLabel: undefined
    }));
    setCountriesOptions(options);

    // Set Saudi Arabia as default for country field if not set
    if (!values.country && (values.idType === 'GCC Countries Citizens' || values.idType === 'Visitor')) {
      setFieldValue('country', 'Saudi Arabia');
    }
  }, [values.idType]);

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

  // Set default country code to Saudi Arabia on mount
  useEffect(() => {
    if (!values.countryCode) {
      setFieldValue('countryCode', '+966'); // Saudi Arabia default
    }
  }, []);

  // Clear all fields when ID type changes
  const [previousIdType, setPreviousIdType] = useState(values.idType);

  useEffect(() => {
    // Only clear fields if ID type actually changed (not on initial load)
    if (previousIdType && previousIdType !== values.idType) {
      // List of all possible field names that should be cleared
      const fieldsToClear = [
        'mobileNumber', 'email', 'address', 'rentalType',
        'nationalOrResidentIdNumber', 'birthDate',
        'nationalOrGccIdNumber', 'country', 'idCopyNumber', 'licenseNumber',
        'idExpiryDate', 'licenseExpiryDate', 'licenseType', 'placeOfIdIssue',
        'borderNumber', 'passportNumber', 'hasAdditionalDriver'
      ];

      // Clear all fields
      fieldsToClear.forEach(field => {
        setFieldValue(field, '');
      });

      // Reset country code to Saudi Arabia after clearing
      setFieldValue('countryCode', '+966');

      // Set Saudi Arabia as default for country field for GCC and Visitor types
      if (values.idType === 'GCC Countries Citizens' || values.idType === 'Visitor') {
        setFieldValue('country', 'Saudi Arabia');
      }
    }

    // Update previous ID type
    setPreviousIdType(values.idType);
  }, [values.idType, setFieldValue, previousIdType]);


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

    if (selectedIdType === 'National ID' || selectedIdType === 'Resident ID') {
      return nationalAndResidentIdFields; // Both National ID and Resident ID use the same fields
    } else if (selectedIdType === 'GCC Countries Citizens') {
      return gccAllFields; // Use complete field set for GCC
    } else if (selectedIdType === 'Visitor') {
      return visitorAllFields; // Use complete field set for Visitor
    }
    // Default to National/Resident fields if no type selected
    return nationalAndResidentIdFields;
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