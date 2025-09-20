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

interface ReturnVehicleFormValues {
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

interface ReturnVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ReturnVehicleFormValues) => Promise<void>;
  vehicles: Vehicle[];
  customers: Customer[];
  loading: boolean;
}

// Validation schema for return vehicle
const ReturnVehicleSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required'),
  invoiceDate: Yup.date()
    .required('Invoice date is required')
    .max(new Date(), 'Date cannot be in the future'),
  paymentType: Yup.string()
    .required('Payment type is required'),
  customerName: Yup.string()
    .required('Customer name is required'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  statementType: Yup.string()
    .required('Statement type is required'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

// Vehicle details state interface
interface VehicleDetailsState {
  paginatedVehicles: Vehicle[];
  vehiclesPage: number;
  vehiclesHasMore: boolean;
  vehiclesLoading: boolean;
}

export default function ReturnVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  customers,
  loading
}: ReturnVehicleModalProps) {
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

  // Load more customers
  const handleLoadMoreCustomers = useCallback(async () => {
    await fetchCustomers(customerDetails.customersPage + 1);
  }, [fetchCustomers, customerDetails.customersPage]);

  // Search customers
  const handleSearchCustomers = useCallback(async (searchTerm: string) => {
    await fetchCustomers(1, searchTerm);
  }, [fetchCustomers]);

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
      title="Add details to return vehicle"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          invoiceNumber: 'INV-4876',
          invoiceDate: '06/04/2022',
          paymentType: 'Cash',
          vatIncluded: true,
          customerName: 'Alex Perrera',
          totalAmount: 'SAR 1.00',
          statementType: 'Sale',
          totalDiscount: 'SAR 0.00',
          vat: 'SAR 15%',
          netInvoice: 'SAR 1.15',
          totalPaid: 'SAR 0.00',
          remaining: 'SAR 0.00'
        }}
        validationSchema={ReturnVehicleSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
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

                {/* Invoice Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="invoiceNumber"
                      label="Invoice Number"
                      type="text"
                      value={values.invoiceNumber}
                      onChange={(value: string) => setFieldValue('invoiceNumber', value)}
                      error={errors.invoiceNumber && touched.invoiceNumber ? errors.invoiceNumber : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="invoiceDate"
                      label="Invoice Date"
                      type="date"
                      value={values.invoiceDate}
                      onChange={(value: string) => setFieldValue('invoiceDate', value)}
                      error={errors.invoiceDate && touched.invoiceDate ? errors.invoiceDate : undefined}
                      className="w-full"
                    />
                    <CustomSelect
                      name="paymentType"
                      label="Payment type"
                      value={values.paymentType}
                      onChange={(value: string) => setFieldValue('paymentType', value)}
                      options={[
                        { value: 'Cash', label: 'Cash' },
                        { value: 'Credit Card', label: 'Credit Card' },
                        { value: 'Bank Transfer', label: 'Bank Transfer' },
                        { value: 'Check', label: 'Check' }
                      ]}
                      error={errors.paymentType && touched.paymentType ? errors.paymentType : undefined}
                      className="w-full"
                    />
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">VAT</label>
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
                      type="text"
                      value={values.totalAmount}
                      onChange={(value: string) => setFieldValue('totalAmount', value)}
                      error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                      className="w-full"
                    />
                    <CustomSelect
                      name="statementType"
                      label="Statement type"
                      value={values.statementType}
                      onChange={(value: string) => setFieldValue('statementType', value)}
                      options={[
                        { value: 'Sale', label: 'Sale' },
                        { value: 'Return', label: 'Return' },
                        { value: 'Deprecation', label: 'Deprecation' }
                      ]}
                      error={errors.statementType && touched.statementType ? errors.statementType : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="totalDiscount"
                      label="Total Discount"
                      type="text"
                      value={values.totalDiscount}
                      onChange={(value: string) => setFieldValue('totalDiscount', value)}
                      error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="vat"
                      label="VAT"
                      type="text"
                      value={values.vat}
                      onChange={(value: string) => setFieldValue('vat', value)}
                      error={errors.vat && touched.vat ? errors.vat : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="netInvoice"
                      label="Net Invoice"
                      type="text"
                      value={values.netInvoice}
                      onChange={(value: string) => setFieldValue('netInvoice', value)}
                      error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="totalPaid"
                      label="Total Paid"
                      type="text"
                      value={values.totalPaid}
                      onChange={(value: string) => setFieldValue('totalPaid', value)}
                      error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                      className="w-full"
                    />
                    <CustomInput
                      name="remaining"
                      label="Remaining"
                      type="text"
                      value={values.remaining}
                      onChange={(value: string) => setFieldValue('remaining', value)}
                      error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                      className="w-full"
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
        )}
      </Formik>
    </CustomModal>
  );
}
