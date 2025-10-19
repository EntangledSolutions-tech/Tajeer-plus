'use client';
import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../reusableComponents/CustomButton';
import CustomInput from '../reusableComponents/CustomInput';
import CustomSelect from '../reusableComponents/CustomSelect';
import SearchableSelect from '../reusableComponents/SearchableSelect';
import CustomModal from '../reusableComponents/CustomModal';

interface InspectionFormValues {
  vehicle_id: string;
  inspection_date: string;
  inspection_id: string;
  inspection_type: string;
  status: string;
  inspector: string;
}

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Validation schema
const InspectionSchema = Yup.object().shape({
  vehicle_id: Yup.string()
    .required('Vehicle is required'),
  inspection_date: Yup.date()
    .required('Inspection date is required')
    .max(new Date(), 'Inspection date cannot be in the future'),
  inspection_id: Yup.string()
    .required('Inspection ID is required')
    .min(3, 'Inspection ID must be at least 3 characters'),
  inspection_type: Yup.string()
    .required('Inspection type is required'),
  status: Yup.string()
    .required('Status is required'),
  inspector: Yup.string()
    .required('Inspector name is required')
    .min(2, 'Inspector name must be at least 2 characters')
});

export default function InspectionModal({ isOpen, onClose, onSuccess }: InspectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Mock vehicles data
  const mockVehicles = [
    { id: 'v1', plate_number: 'Z27846', make: 'Toyota', model: 'Camry' },
    { id: 'v2', plate_number: 'Z27847', make: 'Honda', model: 'Civic' },
    { id: 'v3', plate_number: 'Z27848', make: 'Ford', model: 'Focus' },
    { id: 'v4', plate_number: 'Z27849', make: 'Nissan', model: 'Altima' },
    { id: 'v5', plate_number: 'Z27850', make: 'Hyundai', model: 'Elantra' }
  ];

  // Initial form values
  const initialValues: InspectionFormValues = {
    vehicle_id: '',
    inspection_date: new Date().toISOString().split('T')[0],
    inspection_id: '',
    inspection_type: '',
    status: '',
    inspector: ''
  };

  useEffect(() => {
    if (isOpen) {
      setVehicles(mockVehicles);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (values: InspectionFormValues) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Creating inspection:', values);

      // Show success toast
      toast.success('Inspection created successfully!');

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to create inspection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="New Vehicle Inspection"
      subtitle="Enter the details below to create a new inspection"
    >
      <div className="px-8 py-6">
        <Formik
          initialValues={initialValues}
          validationSchema={InspectionSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form id="inspection-form">
              <div className="space-y-6">
                {/* Vehicle Selection */}
                <div>
                  <SearchableSelect
                    name="vehicle_id"
                    label="Vehicle"
                    required
                    options={vehicles.map(vehicle => ({
                      key: vehicle.id,
                      id: vehicle.id,
                      value: vehicle.plate_number,
                      subValue: `${vehicle.make} ${vehicle.model}`
                    }))}
                    placeholder="Select vehicle"
                    className="w-full"
                  />
                </div>

                {/* Inspection Date */}
                <div>
                  <CustomInput
                    name="inspection_date"
                    label="Inspection Date"
                    type="date"
                    value={values.inspection_date}
                    onChange={(value: string) => setFieldValue('inspection_date', value)}
                    error={errors.inspection_date && touched.inspection_date ? errors.inspection_date : undefined}
                    className="w-full"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Inspection ID */}
                <div>
                  <CustomInput
                    name="inspection_id"
                    label="Inspection ID"
                    type="text"
                    value={values.inspection_id}
                    onChange={(value: string) => setFieldValue('inspection_id', value)}
                    placeholder="e.g., INSP-1234"
                    error={errors.inspection_id && touched.inspection_id ? errors.inspection_id : undefined}
                    className="w-full"
                  />
                </div>

                {/* Inspection Type */}
                <div>
                  <CustomSelect
                    name="inspection_type"
                    label="Inspection Type"
                    value={values.inspection_type}
                    onChange={(value: string) => setFieldValue('inspection_type', value)}
                    options={[
                      { value: '', label: 'Select inspection type' },
                      { value: 'Check-in', label: 'Check-in' },
                      { value: 'Check-out', label: 'Check-out' },
                      { value: 'Routine', label: 'Routine' },
                      { value: 'Pre-rental', label: 'Pre-rental' },
                      { value: 'Post-rental', label: 'Post-rental' }
                    ]}
                    error={errors.inspection_type && touched.inspection_type ? errors.inspection_type : undefined}
                    className="w-full"
                  />
                </div>

                {/* Status */}
                <div>
                  <CustomSelect
                    name="status"
                    label="Status"
                    value={values.status}
                    onChange={(value: string) => setFieldValue('status', value)}
                    options={[
                      { value: '', label: 'Select status' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Done', label: 'Done' },
                      { value: 'With Damages', label: 'With Damages' },
                      { value: 'Failed', label: 'Failed' }
                    ]}
                    error={errors.status && touched.status ? errors.status : undefined}
                    className="w-full"
                  />
                </div>

                {/* Inspector */}
                <div>
                  <CustomInput
                    name="inspector"
                    label="Inspector"
                    type="text"
                    value={values.inspector}
                    onChange={(value: string) => setFieldValue('inspector', value)}
                    placeholder="Enter inspector name"
                    error={errors.inspector && touched.inspector ? errors.inspector : undefined}
                    className="w-full"
                  />
                </div>
              </div>
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
            submittingText="Creating..."
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            form="inspection-form"
          >
            Create Inspection
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
}
