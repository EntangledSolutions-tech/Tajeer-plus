import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import SearchableSelect from '../../../reusableComponents/SearchableSelect';
import { useHttpService } from '../../../../lib/http-service';


interface FormValues {
  ownerName: string;
  ownerId: string;
  actualUser: string;
  userId: string;
  insuranceCompany: string;
  insuranceType: string;
  policyNumber: string;
  insuranceValue: string;
  deductiblePremium: string;
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
    insuranceCompanies: false,
    insuranceTypes: false,
  });

  const [options, setOptions] = useState<{
    insuranceCompanies: DropdownOption[];
    insuranceTypes: DropdownOption[];
  }>({
    insuranceCompanies: [],
    insuranceTypes: [],
  });

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
    fetchInsuranceCompanies();
  }, []);

  // Restore insurance types when companies are loaded and company is selected
  useEffect(() => {
    if (values.insuranceCompany && options.insuranceCompanies.length > 0) {
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