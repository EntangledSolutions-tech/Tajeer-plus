'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
import SearchableSelect from '../../reusableComponents/SearchableSelect';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { Vehicle, Customer } from './types';
import { useHttpService } from '../../../lib/http-service';

// Vehicle details state interface
interface VehicleDetailsState {
  paginatedVehicles: Vehicle[];
  vehiclesPage: number;
  vehiclesHasMore: boolean;
  vehiclesLoading: boolean;
}

// Customer details state interface
interface CustomerDetailsState {
  paginatedCustomers: Customer[];
  customersPage: number;
  customersHasMore: boolean;
  customersLoading: boolean;
}

interface SellVehicleFormValues {
  vehicle: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentType: string;
  vatIncluded: boolean;
  customerName: string;
  totalAmount: string;
  statementType: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface SellVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SellVehicleFormValues) => Promise<void>;
  vehicles: Vehicle[];
  customers: Customer[];
  loading: boolean;
}

// Validation schema for sell vehicle
const SellVehicleSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Please select a vehicle'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required')
    .min(3, 'Invoice number must be at least 3 characters')
    .max(50, 'Invoice number must not exceed 50 characters'),
  invoiceDate: Yup.date()
    .required('Invoice date is required')
    .max(new Date(), 'Invoice date cannot be in the future')
    .typeError('Please enter a valid date'),
  paymentType: Yup.string()
    .required('Please select a payment type'),
  customerName: Yup.string()
    .required('Please select a customer'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid amount (e.g., 1000.00 or SAR 1000.00)')
    .test('positive-amount', 'Amount must be greater than 0', function(value) {
      if (!value) return true; // Let required validation handle empty values
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue > 0;
    }),
  statementType: Yup.string()
    .required('Please select a statement type'),
  totalDiscount: Yup.string()
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid discount amount')
    .test('non-negative-discount', 'Discount cannot be negative', function(value) {
      if (!value) return true; // Optional field
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

export default function SellVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  customers,
  loading
}: SellVehicleModalProps) {
  const { getRequest } = useHttpService();
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsState>({
    paginatedVehicles: [],
    vehiclesPage: 1,
    vehiclesHasMore: true,
    vehiclesLoading: false,
  });

  const [customerDetails, setCustomerDetails] = useState<CustomerDetailsState>({
    paginatedCustomers: [],
    customersPage: 1,
    customersHasMore: true,
    customersLoading: false,
  });

  // Fetch vehicles with pagination
  const fetchVehicles = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setVehicleDetails(prev => ({ ...prev, vehiclesLoading: true }));
      console.log('Fetching vehicles - page:', page, 'search:', search);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '3',
        search
      });

      const response = await getRequest(`/api/vehicles?${params}`);
      console.log('Vehicles API response:', response);

      if (response.success && response.data?.vehicles) {
        console.log('Received vehicles:', response.data.vehicles.length);
        if (page === 1) {
          setVehicleDetails(prev => ({
            ...prev,
            paginatedVehicles: response.data.vehicles || [],
            vehiclesPage: page,
            vehiclesHasMore: response.data.pagination?.hasNextPage || false,
            vehiclesLoading: false
          }));
          console.log('Set initial vehicles:', response.data.vehicles.length);
        } else {
          setVehicleDetails(prev => ({
            ...prev,
            paginatedVehicles: [...prev.paginatedVehicles, ...(response.data.vehicles || [])],
            vehiclesPage: page,
            vehiclesHasMore: response.data.pagination?.hasNextPage || false,
            vehiclesLoading: false
          }));
          console.log('Appended vehicles. Total now:', response.data.vehicles?.length || 0);
        }
        console.log('Has more vehicles:', response.data.pagination?.hasNextPage);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicleDetails(prev => ({ ...prev, vehiclesLoading: false }));
    }
  }, [getRequest]);

  // Fetch customers with pagination
  const fetchCustomers = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setCustomerDetails(prev => ({ ...prev, customersLoading: true }));
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '3',
        search,
        status: 'active'
      });

      const response = await getRequest(`/api/customers?${params}`);

      if (response.success && response.data?.customers) {
        if (page === 1) {
          setCustomerDetails(prev => ({
            ...prev,
            paginatedCustomers: response.data.customers || [],
            customersPage: page,
            customersHasMore: response.data.pagination?.hasNextPage || false,
            customersLoading: false
          }));
        } else {
          setCustomerDetails(prev => ({
            ...prev,
            paginatedCustomers: [...prev.paginatedCustomers, ...(response.data.customers || [])],
            customersPage: page,
            customersHasMore: response.data.pagination?.hasNextPage || false,
            customersLoading: false
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomerDetails(prev => ({ ...prev, customersLoading: false }));
    }
  }, [getRequest]);

  // Load more vehicles
  const handleLoadMoreVehicles = useCallback(async () => {
    console.log('Loading more vehicles, current page:', vehicleDetails.vehiclesPage);
    await fetchVehicles(vehicleDetails.vehiclesPage + 1);
  }, [fetchVehicles, vehicleDetails.vehiclesPage]);

  // Load more customers
  const handleLoadMoreCustomers = useCallback(async () => {
    await fetchCustomers(customerDetails.customersPage + 1);
  }, [fetchCustomers, customerDetails.customersPage]);

  // Search vehicles
  const handleSearchVehicles = useCallback(async (searchTerm: string) => {
    await fetchVehicles(1, searchTerm);
  }, [fetchVehicles]);

  // Search customers
  const handleSearchCustomers = useCallback(async (searchTerm: string) => {
    await fetchCustomers(1, searchTerm);
  }, [fetchCustomers]);

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
      fetchCustomers(1);
    }
  }, [isOpen, fetchVehicles, fetchCustomers]);
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add details to sell vehicle"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          invoiceNumber: 'INV-9876',
          invoiceDate: '06/04/2022',
          paymentType: 'Cash',
          vatIncluded: true,
          customerName: '',
          totalAmount: '0',
          statementType: 'Sale',
          totalDiscount: '0',
          vat: '0',
          netInvoice: '0',
          totalPaid: '0',
          remaining: '0'
        }}
        validationSchema={SellVehicleSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => {
          // Calculate net invoice whenever relevant fields change
          const netInvoice = calculateNetInvoice(values.totalAmount, values.totalDiscount, values.vat);
          // Calculate remaining amount
          const remaining = calculateRemaining(netInvoice, values.totalPaid);

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
                      options={(() => {
                        const options = vehicleDetails.paginatedVehicles.map(vehicle => ({
                          key: vehicle.id,
                          id: vehicle.id,
                          value: vehicle.plate_number,
                          subValue: `${typeof vehicle.make === 'object' ? vehicle.make?.name : vehicle.make || 'N/A'} ${typeof vehicle.model === 'object' ? vehicle.model?.name : vehicle.model || 'N/A'} ${vehicle.make_year || vehicle.year || 'N/A'}`,
                          badge: {
                            text: vehicle.status?.name || 'Unknown',
                            color: vehicle.status?.color || '#6B7280'
                          }
                        }));
                        console.log('SearchableSelect options:', options.length, 'hasMore:', vehicleDetails.vehiclesHasMore);
                        return options;
                      })()}
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

                {/* Invoice Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="invoiceNumber"
                      label="Invoice Number"
                      type="text"
                      className="w-full"
                    />
                    <CustomInput
                      name="invoiceDate"
                      label="Invoice Date"
                      type="date"
                      className="w-full"
                    />
                    <CustomSelect
                      name="paymentType"
                      label="Payment type"
                      options={[
                        { value: 'Cash', label: 'Cash' },
                        { value: 'Credit Card', label: 'Credit Card' },
                        { value: 'Bank Transfer', label: 'Bank Transfer' },
                        { value: 'Check', label: 'Check' }
                      ]}
                      className="w-full"
                    />
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">VAT (%)</label>
                      <RadioButtonGroup
                        name="vatIncluded"
                        value={values.vatIncluded ? 'included' : 'notIncluded'}
                        onChange={(value) => setFieldValue('vatIncluded', value === 'included')}
                        options={[
                          { value: 'included', label: 'VAT included' },
                          { value: 'notIncluded', label: 'VAT not included' }
                        ]}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <SearchableSelect
                        name="customerName"
                        label="Customer Name"
                        required
                        options={customerDetails.paginatedCustomers.map(customer => ({
                          key: customer.id,
                          id: customer.id,
                          value: customer.name,
                          subValue: `${customer.mobile} - ${customer.id_number}`
                        }))}
                        placeholder="Select Customer"
                        className="w-full"
                        enablePagination={true}
                        pageSize={3}
                        loadMoreText="Load More Customers"
                        onLoadMore={handleLoadMoreCustomers}
                        hasMore={customerDetails.customersHasMore}
                        loading={customerDetails.customersLoading}
                        enableBackendSearch={true}
                        onSearch={handleSearchCustomers}
                        searchDebounceMs={300}
                      />
                    </div>
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
                    <CustomSelect
                      name="statementType"
                      label="Statement type"
                      options={[
                        { value: 'Sale', label: 'Sale' },
                        { value: 'Return', label: 'Return' },
                        { value: 'Deprecation', label: 'Deprecation' }
                      ]}
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
                  submittingText="Adding Sales Invoice..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Sales Invoice
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
