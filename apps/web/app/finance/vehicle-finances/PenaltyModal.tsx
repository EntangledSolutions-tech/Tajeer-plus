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
import { Vehicle } from './types';
import { useHttpService } from '../../../lib/http-service';

interface PenaltyFormValues {
  vehicle: string;
  reason: string;
  date: string;
  notes: string;
  totalAmount: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PenaltyFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema for penalty
const PenaltySchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Please select a vehicle'),
  reason: Yup.string()
    .required('Please select a penalty reason'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future')
    .typeError('Please enter a valid date'),
  notes: Yup.string(),
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
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$|^\d+%$/, 'Please enter a valid VAT amount or percentage')
    .test('vat-range', 'VAT must be between 0% and 100%', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, '').replace('%', ''));
      return numericValue >= 0 && numericValue <= 100;
    }),
  netInvoice: Yup.string()
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid net invoice amount')
    .test('non-negative-net', 'Net invoice amount cannot be negative', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue >= 0;
    }),
  totalPaid: Yup.string()
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid total paid amount')
    .test('non-negative-paid', 'Total paid cannot be negative', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue >= 0;
    }),
  remaining: Yup.string()
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid remaining amount')
    .test('non-negative-remaining', 'Remaining amount cannot be negative', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue >= 0;
    })
});

// Vehicle details state interface
interface VehicleDetailsState {
  paginatedVehicles: Vehicle[];
  vehiclesPage: number;
  vehiclesHasMore: boolean;
  vehiclesLoading: boolean;
}

export default function PenaltyModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: PenaltyModalProps) {
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
      title="Add penalty"
      maxWidth="max-w-4xl"
    >
      <Formik
        initialValues={{
          vehicle: '',
          reason: '',
          date: '',
          notes: '',
          totalAmount: '0',
          totalDiscount: '0',
          vat: '0',
          netInvoice: '0',
          totalPaid: '0',
          remaining: '0'
        }}
        validationSchema={PenaltySchema}
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

                {/* Penalty Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Penalty details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect
                      name="reason"
                      label="Reason"
                      options={[
                        { value: '', label: 'Select penalty reason' },
                        { value: 'Late Return', label: 'Late Return' },
                        { value: 'Damage', label: 'Damage' },
                        { value: 'Traffic Violation', label: 'Traffic Violation' },
                        { value: 'Overdue Payment', label: 'Overdue Payment' },
                        { value: 'Contract Violation', label: 'Contract Violation' }
                      ]}
                      className="w-full"
                    />
                    <CustomInput
                      name="date"
                      label="Date"
                      type="date"
                      className="w-full"
                    />
                    <div className="md:col-span-2">
                      <CustomTextarea
                        name="notes"
                        label="Notes (optional)"
                        placeholder="Enter notes"
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
                    <CustomInput
                      name="totalDiscount"
                      label="Total Discount"
                      type="number"
                      isCurrency
                      className="w-full"
                    />
                    <CustomInput
                      name="vat"
                      label="VAT"
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
                  submittingText="Adding Penalty..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Penalty
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
