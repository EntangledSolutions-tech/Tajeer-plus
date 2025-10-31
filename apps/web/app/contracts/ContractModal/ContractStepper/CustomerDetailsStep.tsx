import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomSearchableDropdown, { SearchableDropdownOption } from '../../../reusableComponents/SearchableDropdown';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { SimpleCheckbox } from '../../../reusableComponents/CustomCheckbox';
import { User, Phone, MapPin, Plus } from 'lucide-react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useHttpService } from '../../../../lib/http-service';
import { useBranch } from '../../../../contexts/branch-context';

interface Customer {
  id: string;
  name: string;
  id_number: string;
  id_type: string;
  mobile?: string;
  address?: string;
  status: string;
  status_id?: string;
  classification?: string;
  nationality?: string;
  date_of_birth?: string;
  license_type?: string;
}

interface CustomerStatus {
  id: string;
  name: string;
  color: string;
  description?: string;
}

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

interface Company {
  id: string;
  company_name: string;
  tax_number: string;
  commercial_registration_number?: string;
  email?: string;
  mobile_number?: string;
  address?: string;
  city?: string;
  country?: string;
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
  const formik = useFormikContext<any>();
  const supabase = useSupabase();
  const { getRequest } = useHttpService();
  const router = useRouter();
  const { selectedBranch } = useBranch();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Classification and license type states
  const [classifications, setClassifications] = useState<SearchableDropdownOption[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<SearchableDropdownOption[]>([]);
  const [customerStatuses, setCustomerStatuses] = useState<CustomerStatus[]>([]);
  const [companies, setCompanies] = useState<SearchableDropdownOption[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [loading, setLoading] = useState({
    customerSearchLoading: false,
    classificationLoading: false,
    licenseTypeLoading: false,
    statusesLoading: false,
    companiesLoading: false
  });

  // Get selected customer from Formik values
  const selectedCustomer = customers.find(c => c.id === formik.values.selectedCustomerId) ||
    (formik.values.selectedCustomerId ? {
      id: formik.values.selectedCustomerId,
      name: formik.values.customerName || '',
      id_number: formik.values.customerIdNumber || '',
      id_type: formik.values.customerIdType || '',
      mobile: formik.values.customerMobile || '',
      address: formik.values.customerAddress || '',
      status: formik.values.customerStatus || 'Active',
      status_id: formik.values.customerStatusId || '',
      classification: formik.values.customerClassification || '',
      nationality: formik.values.customerNationality || '',
      date_of_birth: formik.values.customerDateOfBirth || '',
      license_type: formik.values.customerLicenseType || ''
    } as Customer : null);

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

      const response = await getRequest(`/api/customer-configurations/classifications?${searchParams}`);
      if (response.success && response.data) {
        const options: SearchableDropdownOption[] = response.data.data.map((item: Classification) => ({
          id: item.id,
          value: item.classification,
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

      const response = await getRequest(`/api/customer-configurations/license-types?${searchParams}`);
      if (response.success && response.data) {
        const options: SearchableDropdownOption[] = response.data.data.map((item: LicenseType) => ({
          id: item.id,
          value: item.license_type,
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

  // Fetch customers from database
  const fetchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      setSearchInitiated(false);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, customerSearchLoading: true }));
      setSearchInitiated(true);

      // Use the customers API endpoint
      const params = new URLSearchParams({
        search: query,
        limit: '20' // Limit results for performance
      });

      // Add branch_id filter if a branch is selected
      if (selectedBranch) {
        params.append('branch_id', selectedBranch.id);
      }

      const response = await getRequest(`/api/customers?${params}`);
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(prev => ({ ...prev, customerSearchLoading: false }));
    }
  };

  // Fetch customer statuses
  const fetchCustomerStatuses = async () => {
    setLoading(prev => ({ ...prev, statusesLoading: true }));
    try {
      const response = await getRequest('/api/customer-configuration/statuses?limit=100');
      if (response.success && response.data && Array.isArray(response.data.statuses)) {
        setCustomerStatuses(response.data.statuses);
      }
    } catch (err) {
      console.error('Error fetching customer statuses:', err);
      setCustomerStatuses([]);
    } finally {
      setLoading(prev => ({ ...prev, statusesLoading: false }));
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(prev => ({ ...prev, companiesLoading: true }));
    try {
      const response = await getRequest('/api/companies?active=true&limit=100');
      if (response.success && response.data && response.data.companies) {
        const companiesData = response.data.companies;
        setCompaniesList(companiesData);
        const options: SearchableDropdownOption[] = companiesData.map((company: Company) => ({
          id: company.id,
          value: company.id,
          label: company.company_name,
          subLabel: `Tax: ${company.tax_number}`
        }));
        setCompanies(options);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanies([]);
    } finally {
      setLoading(prev => ({ ...prev, companiesLoading: false }));
    }
  };

  // Validate company selection when relatedToCompany is checked
  useEffect(() => {
    if (formik.values.relatedToCompany && !formik.values.companyId) {
      formik.setFieldError('companyId', 'Company selection is required');
    } else if (!formik.values.relatedToCompany && formik.errors.companyId) {
      // Clear error when checkbox is unchecked
      formik.setFieldError('companyId', undefined);
    } else if (formik.values.relatedToCompany && formik.values.companyId && formik.errors.companyId) {
      // Clear error if company is selected
      formik.setFieldError('companyId', undefined);
    }
  }, [formik.values.relatedToCompany, formik.values.companyId]);

  // Fetch classifications and license types on component mount
  useEffect(() => {
    fetchClassifications();
    fetchLicenseTypes();
    fetchCustomerStatuses();
    fetchCompanies();
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        fetchCustomers(searchTerm);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setCustomers([]);
      setSearchInitiated(false);
    }
  }, [searchTerm, selectedBranch]);

  // Save company details to Formik when company is selected
  useEffect(() => {
    if (formik.values.companyId && companiesList.length > 0) {
      const company = companiesList.find((c: Company) => c.id === formik.values.companyId);
      if (company) {
        formik.setFieldValue('companyName', company.company_name || '');
        formik.setFieldValue('companyTaxNumber', company.tax_number || '');
        formik.setFieldValue('companyCommercialRegistration', company.commercial_registration_number || '');
        formik.setFieldValue('companyEmail', company.email || '');
        formik.setFieldValue('companyMobile', company.mobile_number || '');
        formik.setFieldValue('companyAddress', company.address || '');
        formik.setFieldValue('companyCity', company.city || '');
        formik.setFieldValue('companyCountry', company.country || '');
        // Mark the field as touched to trigger validation
        formik.setFieldTouched('companyId', true);
      }
    }
  }, [formik.values.companyId, companiesList]);

  const handleCustomerSelect = (customer: Customer) => {
    // Check if customer is blacklisted
    const customerStatus = customerStatuses.find(s => s.name === customer.status);
    if (customerStatus?.name === 'Blacklisted') {
      return; // Don't allow selection of blacklisted customers
    }

    // Update Formik values with all customer data
    formik.setFieldValue('selectedCustomerId', customer.id);
    formik.setFieldValue('customerName', customer.name || '');
    formik.setFieldValue('customerIdType', customer.id_type || '');
    formik.setFieldValue('customerIdNumber', customer.id_number || '');
    formik.setFieldValue('customerClassification', customer.classification || '');
    formik.setFieldValue('customerAddress', customer.address || '');
    formik.setFieldValue('customerMobile', customer.mobile || '');
    formik.setFieldValue('customerStatus', customer.status || '');
    formik.setFieldValue('customerStatusId', customer.status_id || '');
    formik.setFieldValue('customerNationality', customer.nationality || '');
    formik.setFieldValue('customerDateOfBirth', customer.date_of_birth || '');
    formik.setFieldValue('customerLicenseType', customer.license_type || '');

    // Trigger validation to enable the next button
    setTimeout(() => {
      formik.validateForm();
    }, 100);
  };

  const handleCreateCustomer = () => {
    // Navigate to customers page - you can implement this based on your routing setup
    router.push('/customers');
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Customer Details
      </h2>
      <p className="text-primary/70 mb-8">
        Search for an existing customer or create a new one for this contract.
      </p>

      {/* Customer Search Section */}
      <div className="space-y-6">
        {/* Search Field */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">Search Customer</label>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search Customer"
            width="w-full"
            variant="white-bg"
          />
        </div>

        {/* Loading State */}
        {loading.customerSearchLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-primary/70">Searching customers...</p>
          </div>
        )}

        {/* Customer Results */}
        {searchInitiated && !loading.customerSearchLoading && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No customers found</p>
                <p className="text-sm mb-4">Try adjusting your search terms</p>
                <CustomButton
                  onClick={handleCreateCustomer}
                  variant="ghost"
                  className="text-primary underline hover:text-primary/80 font-medium flex items-center gap-2 mx-auto p-0 h-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Customer
                </CustomButton>
              </div>
            ) : (
              customers.map((customer) => {
                const customerStatus = customerStatuses.find(s => s.name === customer.status);
                const isBlacklisted = customerStatus?.name === 'Blacklisted';

                return (
                  <div
                    key={customer.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedCustomer?.id === customer.id
                        ? 'border-primary bg-primary/5'
                        : isBlacklisted
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-primary/30 bg-white hover:border-primary/50 cursor-pointer hover:shadow-md'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isBlacklisted ? 'text-gray-500' : 'text-primary'}`}>
                          {customer.name}
                          {isBlacklisted && <span className="ml-2 text-xs text-red-500">(Not Available)</span>}
                        </h4>
                        <p className={`text-sm mt-1 ${isBlacklisted ? 'text-gray-400' : 'text-primary/70'}`}>
                          {customer.id_type}: {customer.id_number}
                        </p>
                        {customer.mobile && (
                          <div className={`flex items-center gap-1 mt-2 text-sm ${isBlacklisted ? 'text-gray-400' : 'text-primary/70'}`}>
                            <Phone className="w-3 h-3" />
                            {customer.mobile}
                          </div>
                        )}
                        {customer.address && (
                          <div className={`flex items-center gap-1 mt-1 text-sm ${isBlacklisted ? 'text-gray-400' : 'text-primary/70'}`}>
                            <MapPin className="w-3 h-3" />
                            {customer.address}
                          </div>
                        )}
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-full font-medium"
                        style={{
                          backgroundColor: `${customerStatus?.color || '#6B7280'}20`,
                          color: customerStatus?.color || '#6B7280',
                          border: `1px solid ${customerStatus?.color || '#6B7280'}40`
                        }}
                      >
                        {customer.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Show create customer option when no search is initiated */}
        {!searchInitiated && !searchTerm && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Search for a customer</p>
            <p className="text-sm mb-4">Enter a name or ID number to find existing customers</p>
            <CustomButton
              onClick={handleCreateCustomer}
              variant="ghost"
              className="text-primary underline hover:text-primary/80 font-medium flex items-center gap-2 mx-auto p-0 h-auto"
            >
              <Plus className="w-4 h-4" />
              Create New Customer
            </CustomButton>
          </div>
        )}

        {/* Selected Customer Display */}
        {selectedCustomer && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-medium">Selected Customer</span>
            </div>
            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-primary text-lg mb-2">{selectedCustomer.name}</h4>
                  <p className="text-sm text-primary/70 mb-2">
                    {selectedCustomer.id_type}: {selectedCustomer.id_number}
                  </p>
                  {selectedCustomer.mobile && (
                    <div className="flex items-center gap-1 mb-1 text-sm text-primary/70">
                      <Phone className="w-3 h-3" />
                      {selectedCustomer.mobile}
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-1 text-sm text-primary/70">
                      <MapPin className="w-3 h-3" />
                      {selectedCustomer.address}
                    </div>
                  )}
                </div>
                <span
                  className="px-2 py-1 text-xs rounded-full font-medium"
                  style={{
                    backgroundColor: `${selectedCustomer.status === 'Active' ? '#10B981' : '#6B7280'}20`,
                    color: selectedCustomer.status === 'Active' ? '#10B981' : '#6B7280',
                    border: `1px solid ${selectedCustomer.status === 'Active' ? '#10B981' : '#6B7280'}40`
                  }}
                >
                  {selectedCustomer.status}
                </span>
              </div>
            </div>

            {/* Company Linking Section */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-4">
                <SimpleCheckbox
                  name="relatedToCompany"
                  label="Related to Company"
                  checked={formik.values.relatedToCompany}
                  onCheckedChange={(checked: boolean) => {
                    formik.setFieldValue('relatedToCompany', checked);
                    if (checked) {
                      // Mark companyId as touched when checkbox is checked to trigger validation
                      formik.setFieldTouched('companyId', true);
                    }
                    if (!checked) {
                      formik.setFieldValue('companyId', '');
                      formik.setFieldValue('companyName', '');
                      formik.setFieldValue('companyTaxNumber', '');
                      formik.setFieldValue('companyCommercialRegistration', '');
                      formik.setFieldValue('companyEmail', '');
                      formik.setFieldValue('companyMobile', '');
                      formik.setFieldValue('companyAddress', '');
                      formik.setFieldValue('companyCity', '');
                      formik.setFieldValue('companyCountry', '');
                      // Clear validation error and touched state when unchecked
                      formik.setFieldError('companyId', undefined);
                      formik.setFieldTouched('companyId', false);
                      // Trigger validation to enable next button
                      setTimeout(() => {
                        formik.validateForm();
                      }, 100);
                    }
                  }}
                />
              </div>
              {formik.values.relatedToCompany && (
                <CustomSearchableDropdown
                  name="companyId"
                  label="Select Company"
                  options={companies}
                  placeholder="Select a company"
                  searchPlaceholder="Search companies..."
                  isLoading={loading.companiesLoading}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation error display */}
      {formik.touched.selectedCustomerId && formik.errors.selectedCustomerId && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{String(formik.errors.selectedCustomerId)}</p>
        </div>
      )}
    </>
  );
}
