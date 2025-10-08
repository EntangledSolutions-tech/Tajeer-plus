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
import { useHttpService } from '../../../lib/http-service';

// Interfaces
interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  is_active: boolean;
}

interface VehicleFinanceFormValues {
  amount: string;
  date: string;
  transactionType: string;
  vehicle: string;
  description: string;
  invoiceNumber: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: VehicleFinanceFormValues) => Promise<void>;
  vehicles: Vehicle[];
  loading: boolean;
}

// Validation schema
const VehicleFinanceSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^SAR\s?\d+(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/, 'Please enter a valid amount (e.g., 1000.00 or SAR 1000.00)')
    .test('positive-amount', 'Amount must be greater than 0', function(value) {
      if (!value) return true;
      const numericValue = parseFloat(value.replace(/SAR\s?/i, ''));
      return numericValue > 0;
    }),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future')
    .typeError('Please enter a valid date'),
  transactionType: Yup.string()
    .required('Please select a transaction type'),
  vehicle: Yup.string()
    .required('Please select a vehicle'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required')
    .min(3, 'Invoice number must be at least 3 characters')
    .max(50, 'Invoice number must not exceed 50 characters')
});

// Vehicle details state interface
interface VehicleDetailsState {
  paginatedVehicles: Vehicle[];
  vehiclesPage: number;
  vehiclesHasMore: boolean;
  vehiclesLoading: boolean;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  loading
}: AddTransactionModalProps) {
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
      title="Add new vehicle transaction"
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={{
          amount: '0',
          date: '03/10/2022',
          transactionType: '',
          vehicle: '',
          description: 'Vehicle maintenance and repair services',
          invoiceNumber: 'INV-V001'
        }}
        validationSchema={VehicleFinanceSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <CustomInput
                  name="amount"
                  label="Amount"
                  type="number"
                  isCurrency
                  className="w-full"
                />

                {/* Date */}
                <CustomInput
                  name="date"
                  label="Date"
                  type="date"
                  className="w-full"
                />

                {/* Transaction Type */}
                <CustomSelect
                  name="transactionType"
                  label="Transaction type"
                  options={[
                    { value: '', label: 'Select type' },
                    { value: 'Sale', label: 'Sale' },
                    { value: 'Return', label: 'Return' },
                    { value: 'Deprecation', label: 'Deprecation' },
                    { value: 'Penalty', label: 'Penalty' },
                    { value: 'Maintenance', label: 'Maintenance' },
                    { value: 'Service', label: 'Service' },
                    { value: 'Insurance', label: 'Insurance' },
                    { value: 'Accident', label: 'Accident' }
                  ]}
                  className="w-full"
                />

                {/* Vehicle */}
                  <SearchableSelect
                    name="vehicle"
                    label="Vehicle"
                    required
                    options={vehicleDetails.paginatedVehicles.map(vehicle => ({
                      key: vehicle.id,
                      id: vehicle.id,
                      value: vehicle.plate_number,
                      subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
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

                {/* Invoice Number */}
                <CustomInput
                  name="invoiceNumber"
                  label="Invoice Number"
                  type="text"
                  placeholder="INV-V001"
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="mt-6">
                <CustomTextarea
                  name="description"
                  label="Description"
                  placeholder="Vehicle maintenance and repair services"
                  rows={4}
                  className="w-full"
                />
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
                  submittingText="Adding Transaction..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Transaction
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
