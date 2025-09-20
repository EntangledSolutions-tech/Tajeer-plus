import React, { useState, useEffect } from 'react';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import { SearchBar } from '../../../reusableComponents/SearchBar';
import { Search, User, Phone, MapPin } from 'lucide-react';
import { useHttpService } from '../../../../lib/http-service';

interface Customer {
  id: string;
  name: string;
  id_number: string;
  mobile: string; // API returns 'mobile' instead of 'phone'
  classification: string;
  nationality: string;
  status: string;
  created_at: string;
}

export default function CustomerSelectionStep() {
  const { getRequest } = useHttpService();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Fetch customers from database
  const fetchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        search: query,
        limit: '20', // Limit results for performance
        status: 'Active' // Only show active customers
      });

      const response = await getRequest(`/api/customers?${params}`);
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        fetchCustomers(searchTerm);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setCustomers([]);
      setSelectedCustomer(null);
    }
  }, [searchTerm]);

  // No need to filter since we're fetching from API with search
  const filteredCustomers = customers;

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-[#0065F2] mb-8">
        Customer Selection
      </h2>
      <p className="text-[#0065F2]/70 mb-8">
        Search and select the customer for this contract.
      </p>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, ID number, or mobile"
          width="w-full"
          variant="white-bg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0065F2] mb-4">Available Customers</h3>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-[#A0B6D9]">
                <User className="w-12 h-12 mx-auto mb-4 text-[#A0B6D9]" />
                <p>No customers found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedCustomer?.id === customer.id
                      ? 'border-[#0065F2] bg-[#F6F9FF]'
                      : 'border-[#CDE2FF] bg-white hover:border-[#0065F2]/50'
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#0065F2]">{customer.name}</h4>
                      <p className="text-sm text-[#0065F2]/70 mt-1">
                        {customer.id_type}: {customer.id_number}
                      </p>
                      {customer.mobile && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-[#0065F2]/70">
                          <Phone className="w-3 h-3" />
                          {customer.mobile}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-sm text-[#0065F2]/70">
                        <MapPin className="w-3 h-3" />
                        {customer.classification} • {customer.nationality}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Customer Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0065F2] mb-4">Selected Customer</h3>
          {selectedCustomer ? (
            <div className="border-2 border-[#0065F2] bg-[#F6F9FF] rounded-lg p-6">
              <h4 className="text-xl font-bold text-[#0065F2] mb-4">{selectedCustomer.name}</h4>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#0065F2]">ID Number</label>
                  <p className="text-[#0065F2]/80">{selectedCustomer.id_number}</p>
                </div>

                {selectedCustomer.mobile && (
                  <div>
                    <label className="text-sm font-medium text-[#0065F2]">Phone Number</label>
                    <p className="text-[#0065F2]/80">{selectedCustomer.mobile}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-[#0065F2]">Classification</label>
                  <p className="text-[#0065F2]/80">{selectedCustomer.classification}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0065F2]">Nationality</label>
                  <p className="text-[#0065F2]/80">{selectedCustomer.nationality}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0065F2]">Status</label>
                  <p className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedCustomer.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedCustomer.status}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change Customer
                </CustomButton>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#CDE2FF] bg-gray-50 rounded-lg p-6 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-[#A0B6D9]" />
              <h4 className="text-lg font-medium text-[#0065F2] mb-2">No Customer Selected</h4>
              <p className="text-[#0065F2]/70">Select a customer from the list to continue</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden input to store selected customer ID for form validation */}
      <input
        type="hidden"
        name="customerId"
        value={selectedCustomer?.id || ''}
      />

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-[#0065F2] mb-2">Customer Selection</h4>
        <ul className="text-xs text-[#0065F2]/70 space-y-1">
          <li>• Only active customers can be selected for new contracts</li>
          <li>• You can search by customer name, ID number, or mobile number</li>
          <li>• Customer information will be automatically filled in the contract</li>
        </ul>
      </div>
    </>
  );
}
