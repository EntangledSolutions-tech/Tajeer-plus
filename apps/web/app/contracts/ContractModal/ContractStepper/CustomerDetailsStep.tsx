import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomSearchableDropdown, { SearchableDropdownOption } from '../../../reusableComponents/SearchableDropdown';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { User, Phone, MapPin } from 'lucide-react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useHttpService } from '../../../../lib/http-service';

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
  const [customerType, setCustomerType] = useState('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Classification and license type states
  const [classifications, setClassifications] = useState<SearchableDropdownOption[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<SearchableDropdownOption[]>([]);
  const [customerStatuses, setCustomerStatuses] = useState<CustomerStatus[]>([]);
  const [loading, setLoading] = useState({
    customerSearchLoading: false,
    classificationLoading: false,
    licenseTypeLoading: false,
    statusesLoading: false
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

  // Fetch classifications and license types on component mount
  useEffect(() => {
    fetchClassifications();
    fetchLicenseTypes();
    fetchCustomerStatuses();
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
      setSelectedCustomer(null);
    }
  }, [searchTerm]);

  const handleCustomerSelect = (customer: Customer) => {
    // Check if customer is blacklisted
    const customerStatus = customerStatuses.find(s => s.name === customer.status);
    if (customerStatus?.name === 'Blacklisted') {
      return; // Don't allow selection of blacklisted customers
    }

    setSelectedCustomer(customer);
    // Update Formik values
    formik.setFieldValue('selectedCustomerId', customer.id);
    formik.setFieldValue('customerName', customer.name);
    formik.setFieldValue('customerIdType', customer.id_type);
    formik.setFieldValue('customerIdNumber', customer.id_number);
    formik.setFieldValue('customerClassification', customer.classification);
    formik.setFieldValue('customerAddress', customer.address);
    // Trigger validation to enable continue button
    setTimeout(() => formik.validateForm(), 100);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Customer Details
      </h2>
      <p className="text-primary/70 mb-8">
        Select an existing customer or add a new customer for this contract.
      </p>

      {/* Customer Type Selection */}
      <div className="flex gap-8 mb-8">
        <label className="flex items-center gap-2 text-primary font-medium text-lg">
          <input
            type="radio"
            name="customerType"
            value="existing"
            checked={customerType === 'existing'}
            onChange={(e) => setCustomerType(e.target.value)}
            className="accent-primary w-5 h-5"
          />
          Existing Customer
        </label>
        <label className="flex items-center gap-2 text-primary font-medium text-lg">
          <input
            type="radio"
            name="customerType"
            value="new"
            checked={customerType === 'new'}
            onChange={(e) => setCustomerType(e.target.value)}
            className="accent-primary w-5 h-5"
          />
          New Customer
        </label>
      </div>

      {/* Existing Customer Section */}
      {customerType === 'existing' && (
        <div className="space-y-6">
          {/* Search Field */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Customer</label>
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
                <p>No customers found</p>
                <p className="text-sm">Try adjusting your search terms</p>
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


        </div>
      )}

      {/* New Customer Section */}
      {customerType === 'new' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <CustomInput
                label="Name"
                name="customerName"
                type="text"
                placeholder="Enter name"
                required={true}
              />
            </div>

            {/* ID Type */}
            <div>
              <CustomSelect
                label="ID Type"
                name="customerIdType"
                options={[
                  { value: '', label: 'Select ID Type' },
                  { value: 'national_id', label: 'National ID' },
                  { value: 'passport', label: 'Passport' },
                  { value: 'residence_permit', label: 'Residence Permit' }
                ]}
                required={true}
              />
            </div>

            {/* ID Number */}
            <div>
              <CustomInput
                label="ID Number"
                name="customerIdNumber"
                type="text"
                placeholder="Enter number"
                required={true}
              />
            </div>

            {/* Classification */}
            <div>
              <CustomSearchableDropdown
                name="customerClassification"
                label="Classification"
                options={classifications}
                placeholder="Select classification"
                searchPlaceholder="Search classifications..."
                required={true}
                isLoading={loading.classificationLoading}
                onSearch={fetchClassifications}
              />
            </div>

            {/* Date of birth */}
            <div>
              <CustomInput
                label="Date of birth"
                name="customerDateOfBirth"
                type="date"
                placeholder="Select date"
                required={true}
              />
            </div>

            {/* License type */}
            <div>
              <CustomSearchableDropdown
                name="customerLicenseType"
                label="License type"
                options={licenseTypes}
                placeholder="Select license type"
                searchPlaceholder="Search license types..."
                required={true}
                isLoading={loading.licenseTypeLoading}
                onSearch={fetchLicenseTypes}
              />
            </div>
          </div>

          {/* Address - Full Width */}
          <div>
            <CustomInput
              label="Address"
              name="customerAddress"
              type="text"
              placeholder="Enter address"
              required={true}
            />
          </div>
        </div>
      )}

      {/* Hidden inputs for form validation */}
      <input type="hidden" name="customerType" value={customerType} />
      {customerType === 'existing' && selectedCustomer && (
        <input type="hidden" name="selectedCustomerId" value={selectedCustomer.id} />
      )}
    </>
  );
}
