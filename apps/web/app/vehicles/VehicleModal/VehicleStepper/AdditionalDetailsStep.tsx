import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import SearchableSelect from '../../../reusableComponents/SearchableSelect';
import CustomButton from '../../../reusableComponents/CustomButton';
import { useHttpService } from '../../../../lib/http-service';


interface FormValues {
  carStatus: string;
  ownerName: string;
  ownerId: string;
  actualUser: string;
  userId: string;
  insuranceCompany: string;
  insuranceType: string;
  policyNumber: string;
  insuranceValue: string;
  deductiblePremium: string;
  chassisNumber: string;
}

interface DropdownOption {
  key: string;
  id: string;
  value: string;
  subValue?: string;
  // Additional properties for insurance policies
  policy_type?: string;
  policy_number?: string;
  policy_amount?: number;
  deductible_premium?: number;
  name?: string;
}

export default function AdditionalDetailsStep() {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const { getRequest } = useHttpService();

  // State for dropdown options
  const [loading, setLoading] = useState({
    statuses: false,
    owners: false,
    actualUsers: false,
    insuranceCompanies: false,
    insuranceTypes: false,
  });

  const [options, setOptions] = useState<{
    statuses: DropdownOption[];
    owners: DropdownOption[];
    actualUsers: DropdownOption[];
    insuranceCompanies: DropdownOption[];
    insuranceTypes: DropdownOption[];
  }>({
    statuses: [],
    owners: [],
    actualUsers: [],
    insuranceCompanies: [],
    insuranceTypes: [],
  });

  // Fetch vehicle statuses
  const fetchStatuses = async () => {
    try {
      setLoading(prev => ({ ...prev, statuses: true }));
      const result = await getRequest('/api/vehicle-configuration/statuses?page=1&limit=100');
      console.log('Statuses API response:', result);
      if (result.success && result.data) {
        // Map the data to the format needed for SearchableSelect
        const mappedStatuses = result.data.statuses?.map((status: any) => {
          console.log('Mapping status:', status);
          // Ensure all values are strings and not undefined
          const code = status.code || '';
          const id = status.id || '';
          const name = status.name || '';

          if (!code || !id || !name) {
            console.warn('Invalid status data:', status);
            return null;
          }

          return {
            key: code,
            id: id,
            value: name,
            subValue: `Code: ${code}`
          };
        }).filter(Boolean) || [];
        console.log('Mapped statuses:', mappedStatuses);
        setOptions(prev => ({ ...prev, statuses: mappedStatuses }));
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    } finally {
      setLoading(prev => ({ ...prev, statuses: false }));
    }
  };

  // Fetch vehicle owners
  const fetchOwners = async () => {
    try {
      setLoading(prev => ({ ...prev, owners: true }));
      const result = await getRequest('/api/vehicle-configuration/owners?page=1&limit=100');
      if (result.success && result.data) {
        // Map the data to the format needed for SearchableSelect
        const mappedOwners = result.data.owners?.map((owner: any) => {
          // Ensure all values are strings and not undefined
          const code = owner.code || '';
          const id = owner.id || '';
          const name = owner.name || '';

          if (!code || !id || !name) {
            console.warn('Invalid owner data:', owner);
            return null;
          }

          return {
            key: code,
            id: id,
            value: name,
            subValue: `Code: ${code}`
          };
        }).filter(Boolean) || [];
        setOptions(prev => ({ ...prev, owners: mappedOwners }));
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(prev => ({ ...prev, owners: false }));
    }
  };

  // Fetch actual users
  const fetchActualUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, actualUsers: true }));
      const result = await getRequest('/api/vehicle-configuration/actual-users?page=1&limit=100');
      if (result.success && result.data) {
        // Map the data to the format needed for SearchableSelect
        const mappedUsers = result.data.actualUsers?.map((user: any) => {
          // Ensure all values are strings and not undefined
          const code = user.code || '';
          const id = user.id || '';
          const name = user.name || '';

          if (!code || !id || !name) {
            console.warn('Invalid user data:', user);
            return null;
          }

          return {
            key: code,
            id: id,
            value: name,
            subValue: `Code: ${code}`
          };
        }).filter(Boolean) || [];
        setOptions(prev => ({ ...prev, actualUsers: mappedUsers }));
      }
    } catch (error) {
      console.error('Error fetching actual users:', error);
    } finally {
      setLoading(prev => ({ ...prev, actualUsers: false }));
    }
  };

  // Fetch insurance companies
  const fetchInsuranceCompanies = async () => {
    try {
      setLoading(prev => ({ ...prev, insuranceCompanies: true }));
      const result = await getRequest('/api/insurance-policies');
      if (result.success && result.data) {
        // Extract unique companies and map to SearchableSelect format
        const uniqueCompanies = [...new Set(result.data.policies?.map((p: any) => p.policy_company) || [])] as string[];
        const mappedCompanies: DropdownOption[] = uniqueCompanies
          .filter(company => company && typeof company === 'string')
          .map((company, index) => ({
            key: `IC${String(index + 1).padStart(3, '0')}`,
            id: `IC${String(index + 1).padStart(3, '0')}`,
            value: company,
            subValue: `Insurance Company`
          }));
        setOptions(prev => ({ ...prev, insuranceCompanies: mappedCompanies }));
      }
    } catch (error) {
      console.error('Error fetching insurance companies:', error);
    } finally {
      setLoading(prev => ({ ...prev, insuranceCompanies: false }));
    }
  };

  // Fetch insurance types based on selected company
  const fetchInsuranceTypes = async (company: string) => {
    try {
      setLoading(prev => ({ ...prev, insuranceTypes: true }));
      const result = await getRequest('/api/insurance-policies');
      if (result.success && result.data) {
        // Filter policies by company and map to SearchableSelect format
        const filteredPolicies = result.data.policies?.filter((policy: any) => policy.policy_company === company) || [];
        const mappedTypes = filteredPolicies
          .filter((policy: any) => policy && policy.id && policy.policy_number && policy.policy_type && policy.name)
          .map((policy: any) => ({
            key: policy.policy_number,
            id: policy.id,
            value: policy.name,
            subValue: `Policy: ${policy.policy_number} | Amount: ${policy.policy_amount}`,
            // Store additional data for form population
            policy_type: policy.policy_type,
            policy_number: policy.policy_number,
            policy_amount: policy.policy_amount,
            deductible_premium: policy.deductible_premium,
            name: policy.name
          }));
        setOptions(prev => ({ ...prev, insuranceTypes: mappedTypes }));
      }
    } catch (error) {
      console.error('Error fetching insurance types:', error);
    } finally {
      setLoading(prev => ({ ...prev, insuranceTypes: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('AdditionalDetailsStep mounted, fetching data...');
    fetchStatuses();
    fetchOwners();
    fetchActualUsers();
    fetchInsuranceCompanies();
  }, []);

  // Restore insurance types when companies are loaded and company is selected
  useEffect(() => {
    if (values.insuranceCompany && options.insuranceCompanies.length > 0) {
      const selectedCompany = options.insuranceCompanies.find(company => company.id === values.insuranceCompany);
      if (selectedCompany) {
        fetchInsuranceTypes(selectedCompany.value);
      }
    }
  }, [values.insuranceCompany, options.insuranceCompanies]);

  // Watch for form value changes and update related fields
  useEffect(() => {
    if (values.ownerName && options.owners.length > 0) {
      const selectedOwner = options.owners.find((owner) => owner.id === values.ownerName);
      if (selectedOwner && selectedOwner.key !== values.ownerId) {
        setFieldValue('ownerId', selectedOwner.key || '');
      }
    }
  }, [values.ownerName, options.owners, setFieldValue, values.ownerId]);

  useEffect(() => {
    if (values.actualUser && options.actualUsers.length > 0) {
      const selectedUser = options.actualUsers.find((user) => user.id === values.actualUser);
      if (selectedUser && selectedUser.key !== values.userId) {
        setFieldValue('userId', selectedUser.key || '');
      }
    }
  }, [values.actualUser, options.actualUsers, setFieldValue, values.userId]);

  useEffect(() => {
    if (values.insuranceCompany) {
      // Find the company name from the selected ID
      const selectedCompany = options.insuranceCompanies.find(company => company.id === values.insuranceCompany);
      if (selectedCompany) {
        fetchInsuranceTypes(selectedCompany.value);
      }
    } else {
      setOptions(prev => ({ ...prev, insuranceTypes: [] }));
    }
  }, [values.insuranceCompany, options.insuranceCompanies]);

  // Clear insurance type fields when company changes (but not on initial load)
  const [previousCompany, setPreviousCompany] = useState<string>('');
  useEffect(() => {
    if (previousCompany && previousCompany !== values.insuranceCompany) {
      // Company changed, clear insurance type related fields
      setFieldValue('insuranceType', '');
      setFieldValue('policyNumber', '');
      setFieldValue('deductiblePremium', '');
      setFieldValue('insuranceValue', '');
    }
    setPreviousCompany(values.insuranceCompany);
  }, [values.insuranceCompany, previousCompany, setFieldValue]);

  useEffect(() => {
    if (values.insuranceType && options.insuranceTypes.length > 0) {
      const selectedPolicy = options.insuranceTypes.find((type) => type.id === values.insuranceType);
      if (selectedPolicy) {
        setFieldValue('policyNumber', selectedPolicy.policy_number || '');
        setFieldValue('deductiblePremium', selectedPolicy.deductible_premium?.toString() || '');
        setFieldValue('insuranceValue', selectedPolicy.policy_amount?.toString() || '');
      }
    }
  }, [values.insuranceType, options.insuranceTypes, setFieldValue]);



  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Additional Details</h2>

      {/* Main Details Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Car Status */}
        <SearchableSelect
          label="Car Status"
          name="carStatus"
          required={true}
          options={Array.isArray(options.statuses) ? options.statuses : []}
          placeholder="Select car status..."
          searchPlaceholder="Search statuses..."
          disabled={loading.statuses}
        />

        {/* Owner Name */}
        <SearchableSelect
          label="Owner's Name"
          name="ownerName"
          required={true}
          options={Array.isArray(options.owners) ? options.owners : []}
          placeholder="Select owner..."
          searchPlaceholder="Search owners..."
          disabled={loading.owners}
        />

        {/* Owner ID (code) */}
        <CustomInput
          label="Owner ID"
          name="ownerId"
          required={false}
          type="text"
          disabled={true}
          readOnly={true}
        />

        {/* Actual User */}
        <SearchableSelect
          label="Actual User"
          name="actualUser"
          required={true}
          options={Array.isArray(options.actualUsers) ? options.actualUsers : []}
          placeholder="Select actual user..."
          searchPlaceholder="Search users..."
          disabled={loading.actualUsers}
        />

        {/* User ID (code) */}
        <CustomInput
          label="User ID"
          name="userId"
          required={false}
          type="text"
          disabled={true}
          readOnly={true}
        />

        {/* Chassis Number */}
        <CustomInput
          label="Chassis Number"
          name="chassisNumber"
          required={true}
          type="text"
          disabled={false}
        />
      </div>

      {/* Insurance Section */}
      <h3 className="text-xl font-bold text-primary mb-6">Insurance</h3>
      <div className="grid grid-cols-2 gap-6">
        {/* Insurance Company */}
        <SearchableSelect
          label="Insurance Company"
          name="insuranceCompany"
          required={true}
          options={Array.isArray(options.insuranceCompanies) ? options.insuranceCompanies : []}
          placeholder="Select insurance company..."
          searchPlaceholder="Search companies..."
          disabled={loading.insuranceCompanies}
        />

        {/* Insurance Type */}
        <SearchableSelect
          label="Type"
          name="insuranceType"
          required={true}
          options={Array.isArray(options.insuranceTypes) ? options.insuranceTypes : []}
          placeholder="Select insurance type..."
          searchPlaceholder="Search types..."
          disabled={loading.insuranceTypes || !values.insuranceCompany}
        />

        {/* Policy Number */}
        <CustomInput
          label="Policy Number"
          name="policyNumber"
          required={false}
          type="text"
          disabled={true}
          readOnly={true}
        />

        {/* Insurance Value */}
        <CustomInput
          label="Insurance Value"
          name="insuranceValue"
          required={false}
          type="number"
          disabled={true}
          readOnly={true}
          isCurrency={true}
          iconPosition="left"
        />

        {/* Deductible Premium */}
        <CustomInput
          label="Deductible Premium"
          name="deductiblePremium"
          required={false}
          type="number"
          disabled={true}
          readOnly={true}
          isCurrency={true}
          iconPosition="left"
        />
      </div>
    </>
  );
}