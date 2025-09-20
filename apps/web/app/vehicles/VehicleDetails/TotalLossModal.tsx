'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@kit/ui/dialog';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Calendar, X } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import CustomSelect from '../../reusableComponents/CustomSelect';
import SearchableSelect from '../../reusableComponents/SearchableSelect';
import { toast } from '@kit/ui/sonner';
import { useHttpService } from '../../../lib/http-service';

interface VehicleDetails {
  id: string;
  plate_number: string;
  make: { name: string };
  model: { name: string };
  make_year: string;
  chassis_number: string;
}

interface InsuranceOption {
  id: string;
  code: number;
  name: string;
  description: string;
  deductible_premium: number;
  rental_increase_type: 'value' | 'percentage';
  rental_increase_value?: number;
  rental_increase_percentage?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TotalLossFormValues {
  vehicleId: string;
  insuranceCompany: string;
  insuranceAmount: string;
  depreciationDate: string;
  details: string;
}

interface TotalLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  onSuccess?: () => void;
}

// Validation schema
const TotalLossSchema = Yup.object().shape({
  vehicleId: Yup.string()
    .required('Vehicle is required'),
  insuranceCompany: Yup.string()
    .required('Insurance company is required'),
  insuranceAmount: Yup.string()
    .required('Insurance amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  depreciationDate: Yup.date()
    .required('Depreciation date is required')
    .max(new Date(), 'Depreciation date cannot be in the future'),
  details: Yup.string()
    .required('Details are required')
    .min(10, 'Details must be at least 10 characters long')
    .max(500, 'Details cannot exceed 500 characters')
});

export default function TotalLossModal({ isOpen, onClose, vehicleId, onSuccess }: TotalLossModalProps) {
  // Early return if vehicleId is not provided
  if (!vehicleId) {
    return null;
  }

    const [currentVehicle, setCurrentVehicle] = useState<VehicleDetails | null>(null);
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceOption[]>([]);
  const [loading, setLoading] = useState({
    vehicleLoading: false,
    insuranceLoading: false,
    submitLoading: false
  });
  const [error, setError] = useState<string | null>(null);
  const { getRequest, postRequest, putRequest } = useHttpService();

  // Initial form values
  const initialValues: TotalLossFormValues = {
    vehicleId: vehicleId,
    insuranceCompany: '',
    insuranceAmount: '',
    depreciationDate: new Date().toISOString().split('T')[0] || '',
    details: ''
  };

  // Fetch current vehicle details
  const fetchCurrentVehicle = async () => {
    try {
      setLoading(prev => ({ ...prev, vehicleLoading: true }));
      setError(null);

      const response = await getRequest(`/api/vehicles/${vehicleId}`);

      if (response.success && response.data) {
        setCurrentVehicle(response.data);
      } else {
        console.error('Error fetching vehicle:', response.error);
        setError('Failed to load vehicle details');
        if (response.error) {
          alert(`Error: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to load vehicle details');
    } finally {
      setLoading(prev => ({ ...prev, vehicleLoading: false }));
    }
  };

  // Fetch insurance options
  const fetchInsuranceOptions = async () => {
    try {
      setLoading(prev => ({ ...prev, insuranceLoading: true }));

      const response = await getRequest('/api/insurance-options');

      if (response.success && response.data) {
        // The API returns { success: true, insuranceOptions: [...] }
        const optionsArray = response.data.insuranceOptions || [];
        setInsuranceOptions(optionsArray);
      } else {
        console.error('Error fetching insurance options:', response.error);
        setError('Failed to load insurance options');
        setInsuranceOptions([]);
        if (response.error) {
          alert(`Error: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Error fetching insurance options:', error);
      setError('Failed to load insurance options');
      setInsuranceOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, insuranceLoading: false }));
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchCurrentVehicle();
      fetchInsuranceOptions();
    }
  }, [isOpen, vehicleId]);

  // Helper function to find or create destroyed status
  const findOrCreateDestroyedStatus = async (): Promise<string> => {
    try {
      // First, try to find existing destroyed status
      const statusResponse = await getRequest('/api/vehicle-configuration/statuses?limit=100');

      if (statusResponse.success && statusResponse.data && Array.isArray(statusResponse.data.statuses)) {
        // Look for any status containing "destroyed" (case insensitive)
        const destroyedStatus = statusResponse.data.statuses.find((status: any) =>
          status.name.toLowerCase().includes('destroyed')
        );

        if (destroyedStatus) {
          console.log('Found existing destroyed status:', destroyedStatus);
          return destroyedStatus.id;
        }
      }

      // If no destroyed status found, create one
      console.log('No destroyed status found, creating new one...');
      const createResponse = await postRequest('/api/vehicle-configuration/statuses', {
        name: 'Destroyed',
        description: 'Vehicle is destroyed/total loss',
        color: '#DC2626', // Dark red color for destroyed status
        is_active: true
      });

      if (createResponse.success && createResponse.data) {
        console.log('Created new destroyed status:', createResponse.data);
        return createResponse.data.id;
      } else {
        throw new Error(createResponse.error || 'Failed to create destroyed status');
      }

    } catch (error) {
      console.error('Error finding/creating destroyed status:', error);
      throw new Error('Failed to find or create destroyed status');
    }
  };

  // Helper function to update vehicle status
  const updateVehicleStatus = async (statusId: string) => {
    try {
      const response = await putRequest(`/api/vehicles/${vehicleId}`, { status_id: statusId });

      if (response.success && response.data) {
        console.log('Vehicle status updated:', response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update vehicle status');
      }

    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw new Error('Failed to update vehicle status');
    }
  };

  // Handle form submission
  const handleSubmit = async (values: TotalLossFormValues) => {
    try {
      setLoading(prev => ({ ...prev, submitLoading: true }));
      setError(null);

      // Step 1: Find or create destroyed status
      const destroyedStatusId = await findOrCreateDestroyedStatus();

      // Step 2: Create total loss record with transfer log
      const totalLossData = {
        vehicleId: values.vehicleId,
        insuranceCompany: values.insuranceCompany,
        insuranceAmount: parseFloat(values.insuranceAmount),
        depreciationDate: values.depreciationDate,
        details: values.details,
        // Include transfer log data
        createTransferLog: true,
        transferType: 'Destroyed',
        fromLocation: 'Current Branch',
        toLocation: 'Garbage'
      };

      const totalLossResponse = await postRequest(`/api/vehicles/${vehicleId}/total-loss`, totalLossData);

      if (totalLossResponse.success && totalLossResponse.data) {
        console.log('Total loss record created:', totalLossResponse.data);
      } else {
        throw new Error(totalLossResponse.error || 'Failed to save total loss data');
      }

      // Step 3: Update vehicle status to Destroyed
      await updateVehicleStatus(destroyedStatusId);

      // Step 4: Refresh vehicle data to show updated status
      await fetchCurrentVehicle();

      // Show success toast
      toast.success('Vehicle marked as total loss and status updated successfully!');

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      // Close modal on success
      onClose();

    } catch (error) {
      console.error('Error submitting total loss data:', error);
      setError(error instanceof Error ? error.message : 'Failed to save total loss data. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submitLoading: false }));
    }
  };

  if (loading.vehicleLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl w-full bg-white p-8 rounded-2xl [&>button]:hidden">
          <div className="flex items-center justify-center h-64">
            <div className="text-primary font-medium">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full bg-white p-0 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col [&>button]:hidden">
        {/* Header */}
        <div className="bg-primary/5 px-8 py-6 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-primary mb-2">
                Set Car as Total Loss
              </DialogTitle>
              <p className="text-primary text-sm">
                Enter the details below to set this vehicle as total loss
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="mx-8 mt-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="px-8 py-6">
          {/* Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={TotalLossSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => (
              <Form id="total-loss-form">


                {/* Vehicle Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-4">Vehicle details</h3>

                  {loading.vehicleLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-primary">Loading vehicle details...</span>
                    </div>
                  ) : currentVehicle ? (
                    <>
                      {/* Current Vehicle Plate Number */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                        <div className="px-4 py-3 border border-primary/20 rounded-lg bg-primary/5 text-primary font-semibold">
                          {currentVehicle.plate_number}
                        </div>
                      </div>

                      {/* Vehicle Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Make</label>
                          <p className="text-primary font-semibold">{currentVehicle.make?.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Model</label>
                          <p className="text-primary font-semibold">{currentVehicle.model?.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Year</label>
                          <p className="text-primary font-semibold">{currentVehicle.make_year}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Chassis Number</label>
                          <p className="text-primary font-semibold">{currentVehicle.chassis_number}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No vehicle details available
                    </div>
                  )}
                </div>

                {/* Insurance Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-4">Insurance details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Insurance Company */}
                    <div>
                      <SearchableSelect
                        name="insuranceCompany"
                        label="Insurance Company"
                        required
                        options={(insuranceOptions || []).map(option => ({
                          key: option.id,
                          id: option.id,
                          value: option.name,
                          subValue: option.description
                        }))}
                        placeholder="Select insurance"
                        className="w-full"
                      />
                    </div>

                                        {/* Insurance Amount */}
                    <div>
                      <CustomInput
                        name="insuranceAmount"
                        label="Insurance Amount"
                        type="number"
                        isCurrency={true}
                        value={values.insuranceAmount}
                        onChange={(value: string) => setFieldValue('insuranceAmount', value)}
                        placeholder="SAR 5"
                        error={errors.insuranceAmount && touched.insuranceAmount ? errors.insuranceAmount : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>

                                    {/* Depreciation Date */}
                  <div className="mb-6">
                    <CustomInput
                      name="depreciationDate"
                      label="Depreciation Date"
                      type="date"
                      value={values.depreciationDate}
                      onChange={(value: string) => setFieldValue('depreciationDate', value)}
                      error={errors.depreciationDate && touched.depreciationDate ? errors.depreciationDate : undefined}
                      className="w-full"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                                    {/* Details */}
                  <div className="mb-6">
                    <CustomTextarea
                      name="details"
                      label="Details"
                      value={values.details}
                      onChange={(value: string) => setFieldValue('details', value)}
                      placeholder="Enter a description..."
                      rows={4}
                      error={errors.details && touched.details ? errors.details : undefined}
                      className="w-full"
                    />
                  </div>
                </div>

              </Form>
            )}
          </Formik>
          </div>
        </div>

        {/* Fixed Form Actions */}
        <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
          <div className="flex justify-end gap-4">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading.submitLoading}
              className="border-primary text-primary hover:bg-primary/5"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              disabled={loading.submitLoading}
              loading={loading.submitLoading}
              submittingText="Setting as total loss..."
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              form="total-loss-form"
            >
              Set as total loss
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
