'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import SearchableSelect from '../../reusableComponents/SearchableSelect';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { Vehicle } from './types';
import { useHttpService } from '../../../lib/http-service';

interface MaintenanceFormValues {
  vehicle: string;
  maintenanceType: string;
  date: string;
  supplier: string;
  notes: string;
  totalAmount: string;
  vatIncluded: boolean;
  statementType: string;
  totalDiscount: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MaintenanceFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for maintenance
const MaintenanceSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Please select a vehicle'),
  maintenanceType: Yup.string()
    .required('Please select a maintenance type'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future')
    .typeError('Please enter a valid date'),
  supplier: Yup.string()
    .required('Please select a supplier'),
  notes: Yup.string(),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid amount (e.g., 1000.00 or SAR 1000.00)')
    .test('positive-amount', 'Amount must be greater than 0', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue > 0;
    }),
  statementType: Yup.string()
    .required('Please select a statement type'),
  totalDiscount: Yup.string()
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid discount amount')
    .test('non-negative-discount', 'Discount cannot be negative', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue >= 0;
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
      const netInvoice = total - discount;
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

export default function MaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: MaintenanceModalProps) {
  const { getRequest } = useHttpService();
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsState>({
    paginatedVehicles: [],
    vehiclesPage: 1,
    vehiclesHasMore: true,
    vehiclesLoading: false,
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

  // Calculate net invoice automatically
  const calculateNetInvoice = (totalAmount: string, totalDiscount: string, vatIncluded: boolean) => {
    const total = parseFloat(totalAmount) || 0;
    const discount = parseFloat(totalDiscount) || 0;

    // Net Invoice = Total Amount - Discount (VAT is already included in total)
    const netInvoice = total - discount;
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
    }
  }, [isOpen, fetchVehicles]);
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Maintenance Log"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          maintenanceType: '',
          date: '',
          supplier: '',
          notes: '',
          totalAmount: '0',
          vatIncluded: true,
          statementType: 'Sale',
          totalDiscount: '0',
          netInvoice: '0',
          totalPaid: '0',
          remaining: '0'
        }}
        validationSchema={MaintenanceSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => {
          // Calculate net invoice whenever relevant fields change
          const netInvoice = calculateNetInvoice(values.totalAmount, values.totalDiscount, values.vatIncluded);
          // Calculate remaining amount
          const remaining = calculateRemaining(netInvoice, values.totalPaid);

          return (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                {/* Vehicle Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <CustomSelect
                      name="maintenanceType"
                      label="Maintenance type"
                      options={[
                        { value: '', label: 'Select type' },
                        { value: 'Oil Change', label: 'Oil Change' },
                        { value: 'Brake Service', label: 'Brake Service' },
                        { value: 'Engine Repair', label: 'Engine Repair' },
                        { value: 'Transmission Service', label: 'Transmission Service' },
                        { value: 'Tire Replacement', label: 'Tire Replacement' },
                        { value: 'General Maintenance', label: 'General Maintenance' }
                      ]}
                      className="w-full"
                    />
                    <CustomInput
                      name="date"
                      label="Date"
                      type="date"
                      className="w-full"
                    />
                    <CustomSelect
                      name="supplier"
                      label="Supplier"
                      options={[
                        { value: '', label: 'Select supplier' },
                        { value: 'Auto Parts Co.', label: 'Auto Parts Co.' },
                        { value: 'Service Center', label: 'Service Center' },
                        { value: 'Dealership', label: 'Dealership' },
                        { value: 'Independent Mechanic', label: 'Independent Mechanic' }
                      ]}
                      className="w-full"
                    />
                    <div className="md:col-span-2">
                      <CustomTextarea
                        name="notes"
                        label="Notes"
                        placeholder="Enter note"
                        rows={3}
                        className="w-full"
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
                  submittingText="Adding Maintenance Log..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Maintenance Log
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
