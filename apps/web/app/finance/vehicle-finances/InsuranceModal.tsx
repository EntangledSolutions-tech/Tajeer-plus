'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
import SearchableSelect from '../../reusableComponents/SearchableSelect';
import { Vehicle } from './types';
import { useHttpService } from '../../../lib/http-service';

interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

interface InsuranceFormValues {
  vehicle: string;
  company: string;
  policyNumber: string;
  totalAmount: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: InsuranceFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for insurance
const InsuranceSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Please select a vehicle'),
  company: Yup.string()
    .required('Please select an insurance company'),
  policyNumber: Yup.string()
    .required('Policy number is required')
    .min(3, 'Policy number must be at least 3 characters')
    .max(50, 'Policy number must not exceed 50 characters'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid amount (e.g., 1000.00 or SAR 1000.00)')
    .test('positive-amount', 'Amount must be greater than 0', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue > 0;
    }),
  totalDiscount: Yup.string()
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid discount amount')
    .test('non-negative-discount', 'Discount cannot be negative', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue >= 0;
    }),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid VAT percentage')
    .test('vat-range', 'VAT must be between 0% and 100%', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value);
      return numericValue >= 0 && numericValue <= 100;
    }),
  netInvoice: Yup.string(),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid total paid amount')
    .test('non-negative-paid', 'Total paid cannot be negative', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value);
      return numericValue >= 0;
    })
    .test('not-exceed-net', 'Total paid cannot exceed net invoice', function(value) {
      if (!value) return true;
      const paid = parseFloat(value);
      const total = parseFloat(this.parent.totalAmount) || 0;
      const discount = parseFloat(this.parent.totalDiscount) || 0;
      const vat = parseFloat(this.parent.vat) || 0;
      const vatAmount = (total * vat) / 100;
      const netInvoice = total - discount + vatAmount;
      return paid <= netInvoice;
    }),
  remaining: Yup.string()
});

// Vehicle details state interface
interface VehicleDetailsState {
  paginatedVehicles: Vehicle[];
  vehiclesPage: number;
  vehiclesHasMore: boolean;
  vehiclesLoading: boolean;
}

// Generate policy number based on company code
const generatePolicyNumber = (companyCode: string) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${companyCode}-${result}`;
};

export default function InsuranceModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: InsuranceModalProps) {
  const { getRequest } = useHttpService();
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsState>({
    paginatedVehicles: [],
    vehiclesPage: 1,
    vehiclesHasMore: true,
    vehiclesLoading: false,
  });

  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Fetch insurance companies
  const fetchInsuranceCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);
      const response = await getRequest('/api/insurance-companies');

      if (response.success && response.data?.companies) {
        setInsuranceCompanies(response.data.companies);
      } else {
        console.error('Error fetching insurance companies:', response.error);
        // Fallback to hardcoded companies if API fails
        setInsuranceCompanies([
          { id: '1', name: 'Tawuniya', code: 'TAW', is_active: true },
          { id: '2', name: 'SABB Takaful', code: 'SAB', is_active: true },
          { id: '3', name: 'Malath Insurance', code: 'MAL', is_active: true },
          { id: '4', name: 'AXA Cooperative', code: 'AXA', is_active: true },
          { id: '5', name: 'Allianz', code: 'ALL', is_active: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching insurance companies:', error);
      // Fallback to hardcoded companies if API fails
      setInsuranceCompanies([
        { id: '1', name: 'Tawuniya', code: 'TAW', is_active: true },
        { id: '2', name: 'SABB Takaful', code: 'SAB', is_active: true },
        { id: '3', name: 'Malath Insurance', code: 'MAL', is_active: true },
        { id: '4', name: 'AXA Cooperative', code: 'AXA', is_active: true },
        { id: '5', name: 'Allianz', code: 'ALL', is_active: true }
      ]);
    } finally {
      setCompaniesLoading(false);
    }
  }, [getRequest]);

  // Fetch vehicles with pagination
  const fetchVehicles = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setVehicleDetails(prev => ({ ...prev, vehiclesLoading: true }));
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '3',
        search
      });

      const response = await getRequest(`/api/vehicles?${params}`);

      if (response.success && response.data?.vehicles) {
        if (page === 1) {
          setVehicleDetails(prev => ({
            ...prev,
            paginatedVehicles: response.data.vehicles || [],
            vehiclesPage: page,
            vehiclesHasMore: response.data.pagination?.hasNextPage || false,
            vehiclesLoading: false
          }));
        } else {
          setVehicleDetails(prev => ({
            ...prev,
            paginatedVehicles: [...prev.paginatedVehicles, ...(response.data.vehicles || [])],
            vehiclesPage: page,
            vehiclesHasMore: response.data.pagination?.hasNextPage || false,
            vehiclesLoading: false
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicleDetails(prev => ({ ...prev, vehiclesLoading: false }));
    }
  }, [getRequest]);

  // Load more vehicles
  const handleLoadMoreVehicles = useCallback(async () => {
    await fetchVehicles(vehicleDetails.vehiclesPage + 1);
  }, [fetchVehicles, vehicleDetails.vehiclesPage]);

  // Search vehicles
  const handleSearchVehicles = useCallback(async (searchTerm: string) => {
    await fetchVehicles(1, searchTerm);
  }, [fetchVehicles]);

  // Calculate net invoice automatically
  const calculateNetInvoice = (totalAmount: string, totalDiscount: string, vat: string) => {
    const total = parseFloat(totalAmount) || 0;
    const discount = parseFloat(totalDiscount) || 0;
    const vatPercentage = parseFloat(vat) || 0;

    // Calculate VAT amount as percentage of total amount
    const vatAmount = (total * vatPercentage) / 100;

    // Net Invoice = Total Amount - Discount + VAT
    const netInvoice = total - discount + vatAmount;
    return netInvoice.toFixed(2);
  };

  // Calculate remaining amount automatically
  const calculateRemaining = (netInvoice: string, totalPaid: string) => {
    const net = parseFloat(netInvoice) || 0;
    const paid = parseFloat(totalPaid) || 0;

    // Remaining = Net Invoice - Total Paid
    const remaining = net - paid;
    return remaining.toFixed(2);
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVehicles(1);
      fetchInsuranceCompanies();
    }
  }, [isOpen, fetchVehicles, fetchInsuranceCompanies]);
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add insurance payment"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          company: '',
          policyNumber: '',
          totalAmount: '0',
          totalDiscount: '0',
          vat: '0',
          netInvoice: '0',
          totalPaid: '0',
          remaining: '0'
        }}
        validationSchema={InsuranceSchema}
        onSubmit={(values) => {
          // Calculate final values before submission
          const netInvoice = calculateNetInvoice(values.totalAmount, values.totalDiscount, values.vat);
          const remaining = calculateRemaining(netInvoice, values.totalPaid);

          // Submit with calculated values
          onSubmit({
            ...values,
            netInvoice,
            remaining
          });
        }}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => {
          // Calculate net invoice whenever relevant fields change
          const netInvoice = calculateNetInvoice(values.totalAmount, values.totalDiscount, values.vat);
          // Calculate remaining amount
          const remaining = calculateRemaining(netInvoice, values.totalPaid);

          // Handle company selection and auto-generate policy number
          const handleCompanyChange = (companyId: string) => {
            setFieldValue('company', companyId);
            if (companyId) {
              const selectedCompany = insuranceCompanies.find(c => c.id === companyId);
              if (selectedCompany) {
                const policyNumber = generatePolicyNumber(selectedCompany.code);
                setFieldValue('policyNumber', policyNumber);
              }
            } else {
              setFieldValue('policyNumber', '');
            }
          };

          return (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                {/* Vehicle Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                  <div>
                    <SearchableSelect
                      name="vehicle"
                      label="Vehicle"
                      required
                      options={vehicleDetails.paginatedVehicles.map(vehicle => ({
                        key: vehicle.id,
                        id: vehicle.id,
                        value: vehicle.plate_number,
                        subValue: `${typeof vehicle.make === 'object' ? vehicle.make?.name : vehicle.make || 'N/A'} ${typeof vehicle.model === 'object' ? vehicle.model?.name : vehicle.model || 'N/A'} ${vehicle.make_year || vehicle.year || 'N/A'}`,
                        badge: {
                          text: vehicle.status?.name || 'Unknown',
                          color: vehicle.status?.color || '#6B7280'
                        }
                      }))}
                      placeholder="Select vehicle"
                      className="w-full"
                      enablePagination={true}
                      pageSize={3}
                      loadMoreText="Load More Vehicles"
                      onLoadMore={handleLoadMoreVehicles}
                      hasMore={vehicleDetails.vehiclesHasMore}
                      loading={vehicleDetails.vehiclesLoading}
                      enableBackendSearch={true}
                      onSearch={handleSearchVehicles}
                      searchDebounceMs={300}
                    />
                  </div>
                </div>

                {/* Amount Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <CustomInput
                      name="totalAmount"
                      label="Total Amount"
                      type="number"
                      isCurrency
                      className="w-full"
                    />
                    <CustomInput
                      name="totalDiscount"
                      label="Total Discount"
                      type="number"
                      isCurrency
                      className="w-full"
                    />
                    <CustomInput
                      name="vat"
                      label="VAT (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full"
                    />
                    <CustomInput
                      name="netInvoice"
                      label="Net Invoice"
                      type="number"
                      isCurrency
                      className="w-full"
                      disabled
                      value={netInvoice}
                    />
                    <CustomInput
                      name="totalPaid"
                      label="Total Paid"
                      type="number"
                      isCurrency
                      className="w-full"
                    />
                    <CustomInput
                      name="remaining"
                      label="Remaining"
                      type="number"
                      isCurrency
                      className="w-full"
                      disabled
                      value={remaining}
                    />
                  </div>
                </div>

                {/* Insurance Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect
                      name="company"
                      label="Company"
                      options={[
                        { value: '', label: 'Select company' },
                        ...insuranceCompanies
                          .filter(company => company.is_active)
                          .map(company => ({
                            value: company.id,
                            label: company.name
                          }))
                      ]}
                      className="w-full"
                      onChange={(value) => handleCompanyChange(value)}
                      disabled={companiesLoading}
                    />
                    <CustomInput
                      name="policyNumber"
                      label="Policy Number"
                      type="text"
                      placeholder="Select a company first"
                      className="w-full"
                      readOnly
                      disabled
                      value={values.policyNumber}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
              <div className="flex justify-end gap-4">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  loading={loading}
                  submittingText="Adding Insurance Payment..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Insurance Payment
                </CustomButton>
              </div>
            </div>
          </Form>
          );
        }}
      </Formik>
    </CustomModal>
  );
}
