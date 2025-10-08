'use client';
import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Calendar } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import CustomSelect from '../../reusableComponents/CustomSelect';
import CustomSwitch from '../../reusableComponents/CustomSwitch';
import CustomModal from '../../reusableComponents/CustomModal';
import { useHttpService } from '../../../lib/http-service';

interface VehicleDetails {
  id: string;
  plate_number: string;
  make: { name: string };
  model: { name: string };
  make_year: string;
  chassis_number: string;
}

interface AccidentFormValues {
  vehicleId: string;
  accidentDate: string;
  details: string;
  logMaintenanceUpdate: boolean;
  // Amount details fields (only when logMaintenanceUpdate is true)
  totalAmount: string;
  statementType: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
}

interface AccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  onSuccess?: () => void;
}

// Validation schema
const AccidentSchema = Yup.object().shape({
  vehicleId: Yup.string()
    .required('Vehicle is required'),
  accidentDate: Yup.date()
    .required('Accident date is required')
    .max(new Date(), 'Accident date cannot be in the future'),
  details: Yup.string()
    .required('Accident details are required')
    .min(10, 'Details must be at least 10 characters long')
    .max(500, 'Details cannot exceed 500 characters'),
  logMaintenanceUpdate: Yup.boolean(),
  // Conditional validation for amount details
  totalAmount: Yup.string().when('logMaintenanceUpdate', {
    is: true,
    then: (schema) => schema.required('Total amount is required').matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
    otherwise: (schema) => schema.notRequired()
  }),
  statementType: Yup.string().when('logMaintenanceUpdate', {
    is: true,
    then: (schema) => schema.required('Statement type is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  totalDiscount: Yup.string().when('logMaintenanceUpdate', {
    is: true,
    then: (schema) => schema.required('Total discount is required').matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
    otherwise: (schema) => schema.notRequired()
  }),
  vat: Yup.string().when('logMaintenanceUpdate', {
    is: true,
    then: (schema) => schema.required('VAT is required').matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid percentage'),
    otherwise: (schema) => schema.notRequired()
  }),
  netInvoice: Yup.string().when('logMaintenanceUpdate', {
    is: true,
    then: (schema) => schema.required('Net invoice is required').matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
    otherwise: (schema) => schema.notRequired()
  }),
  totalPaid: Yup.string().when('logMaintenanceUpdate', {
    is: true,
    then: (schema) => schema.required('Total paid is required').matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
    otherwise: (schema) => schema.notRequired()
  })
});

export default function AccidentModal({ isOpen, onClose, vehicleId, onSuccess }: AccidentModalProps) {
  // Early return if vehicleId is not provided
  if (!vehicleId) {
    return null;
  }
    const [currentVehicle, setCurrentVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState({
    vehicleLoading: false,
    submitLoading: false
  });
  const [error, setError] = useState<string | null>(null);
  const { getRequest, postRequest, putRequest } = useHttpService();

  // Initial form values
  const initialValues: AccidentFormValues = {
    vehicleId: vehicleId,
    accidentDate: new Date().toISOString().split('T')[0] || '', // Today's date
    details: '',
    logMaintenanceUpdate: false,
    totalAmount: '',
    statementType: '',
    totalDiscount: '',
    vat: '',
    netInvoice: '',
    totalPaid: ''
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

  // Load vehicle data when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchCurrentVehicle();
    }
  }, [isOpen, vehicleId]);

  // Helper function to find or create accident status
  const findOrCreateAccidentStatus = async (): Promise<string> => {
    try {
      // First, try to find existing accident status
      const statusResponse = await getRequest('/api/vehicle-configuration/statuses?limit=100');

      if (statusResponse.success && statusResponse.data && Array.isArray(statusResponse.data.statuses)) {
        // Look for any status containing "accident" (case insensitive)
        const accidentStatus = statusResponse.data.statuses.find((status: any) =>
          status.name.toLowerCase().includes('accident')
        );

        if (accidentStatus) {
          console.log('Found existing accident status:', accidentStatus);
          return accidentStatus.id;
        }
      }

      // If no accident status found, create one
      console.log('No accident status found, creating new one...');
      const createResponse = await postRequest('/api/vehicle-configuration/statuses', {
        name: 'Accident',
        description: 'Vehicle is in an accident',
        color: '#EF4444', // Red color for accident status
        is_active: true
      });

      if (createResponse.success && createResponse.data) {
        console.log('Created new accident status:', createResponse.data);
        return createResponse.data.id;
      } else {
        throw new Error(createResponse.error || 'Failed to create accident status');
      }

    } catch (error) {
      console.error('Error finding/creating accident status:', error);
      throw new Error('Failed to find or create accident status');
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
  const handleSubmit = async (values: AccidentFormValues) => {
    try {
      setLoading(prev => ({ ...prev, submitLoading: true }));
      setError(null);

      // Step 1: Find or create accident status
      const accidentStatusId = await findOrCreateAccidentStatus();

      // Step 2: Create accident record
      const accidentData = {
        vehicleId: values.vehicleId,
        accidentDate: values.accidentDate,
        details: values.details,
        logMaintenanceUpdate: values.logMaintenanceUpdate,
        // Include maintenance fields only if checkbox is selected
        ...(values.logMaintenanceUpdate && {
          totalAmount: values.totalAmount,
          statementType: values.statementType,
          totalDiscount: values.totalDiscount,
          vat: values.vat,
          netInvoice: values.netInvoice,
          totalPaid: values.totalPaid
        })
      };

      const accidentResponse = await postRequest(`/api/vehicles/${vehicleId}/accidents`, accidentData);

      if (accidentResponse.success && accidentResponse.data) {
        console.log('Accident record created:', accidentResponse.data);
      } else {
        throw new Error(accidentResponse.error || 'Failed to save accident data');
      }

      // Step 3: Update vehicle status to Accident
      await updateVehicleStatus(accidentStatusId);

      // Step 4: Refresh vehicle data to show updated status
      await fetchCurrentVehicle();

      // Show success toast
      toast.success('Vehicle accident record created and status updated successfully!');

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      // Close modal on success
      onClose();

    } catch (error) {
      console.error('Error submitting accident data:', error);
      setError(error instanceof Error ? error.message : 'Failed to save accident data. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submitLoading: false }));
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Car in an Accident"
      subtitle="Enter the details below to set this vehicle as in an accident"
    >
      {/* Error Alert */}
      {error && (
        <div className="mx-8 mt-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="px-8 py-6">
        {/* Accident Details Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={AccidentSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form id="accident-form">
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
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-primary mb-4">Accident details</h3>

                {/* Accident Date */}
                <div className="mb-6">
                  <CustomInput
                    name="accidentDate"
                    label="Accident Date"
                    type="date"
                    value={values.accidentDate}
                    onChange={(value: string) => setFieldValue('accidentDate', value)}
                    error={errors.accidentDate && touched.accidentDate ? errors.accidentDate : undefined}
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

                {/* Checkbox */}
                <div className="mb-6">
                  <CustomSwitch
                    name="logMaintenanceUpdate"
                    label="Log maintenance update for this vehicle"
                    checked={values.logMaintenanceUpdate}
                    onChange={(checked: boolean) => setFieldValue('logMaintenanceUpdate', checked)}
                    className="text-primary"
                  />
                </div>
              </div>

              {/* Amount Details Section - Conditional */}
              {values.logMaintenanceUpdate && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-4">Amount details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Amount */}
                    <div>
                      <CustomInput
                        name="totalAmount"
                        label="Total Amount"
                        type="text"
                        value={values.totalAmount}
                        onChange={(value: string) => setFieldValue('totalAmount', value)}
                        placeholder="SAR 1.00"
                        error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                        className="w-full"
                      />
                    </div>

                    {/* Statement Type */}
                    <div>
                      <CustomSelect
                        name="statementType"
                        label="Statement Type"
                        value={values.statementType}
                        onChange={(value: string) => setFieldValue('statementType', value)}
                        options={[
                          { value: '', label: 'Select statement type' },
                          { value: 'Sale', label: 'Sale' },
                          { value: 'Purchase', label: 'Purchase' },
                          { value: 'Maintenance', label: 'Maintenance' },
                          { value: 'Insurance', label: 'Insurance' }
                        ]}
                        error={errors.statementType && touched.statementType ? errors.statementType : undefined}
                        className="w-full"
                      />
                    </div>

                    {/* Total Discount */}
                    <div>
                      <CustomInput
                        name="totalDiscount"
                        label="Total Discount"
                        type="text"
                        value={values.totalDiscount}
                        onChange={(value: string) => setFieldValue('totalDiscount', value)}
                        placeholder="SAR 0.00"
                        error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                        className="w-full"
                      />
                    </div>

                    {/* VAT */}
                    <div>
                      <CustomInput
                        name="vat"
                        label="VAT"
                        type="text"
                        value={values.vat}
                        onChange={(value: string) => setFieldValue('vat', value)}
                        placeholder="15%"
                        error={errors.vat && touched.vat ? errors.vat : undefined}
                        className="w-full"
                      />
                    </div>

                    {/* Net Invoice */}
                    <div>
                      <CustomInput
                        name="netInvoice"
                        label="Net Invoice"
                        type="text"
                        value={values.netInvoice}
                        onChange={(value: string) => setFieldValue('netInvoice', value)}
                        placeholder="SAR 1.15"
                        error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                        className="w-full"
                      />
                    </div>

                    {/* Total Paid */}
                    <div>
                      <CustomInput
                        name="totalPaid"
                        label="Total Paid"
                        type="text"
                        value={values.totalPaid}
                        onChange={(value: string) => setFieldValue('totalPaid', value)}
                        placeholder="SAR 0.00"
                        error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
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
            submittingText="Setting in accident..."
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            form="accident-form"
          >
            Set in accident
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
}
