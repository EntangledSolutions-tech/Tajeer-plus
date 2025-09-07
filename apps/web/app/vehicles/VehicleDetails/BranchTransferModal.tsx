'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@kit/ui/dialog';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import { SimpleSearchableSelect } from '../../reusableComponents/SearchableSelect';

interface VehicleDetails {
  id: string;
  plate_number: string;
  make: { name: string };
  model: { name: string };
  make_year: string;
  chassis_number: string;
  branch_id?: string;
  branch?: { id: string; name: string; code: string; address?: string; phone?: string; email?: string } | string; // Can be object or string for backward compatibility
}

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  manager_name?: string;
  is_active: boolean;
}

interface BranchTransferFormValues {
  vehicleId: string;
  recipientBranch: string; // This will now store the branch name
  details: string;
}

interface BranchTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  onSuccess?: () => void;
}

// Validation schema
const BranchTransferSchema = Yup.object().shape({
  vehicleId: Yup.string()
    .required('Vehicle is required'),
  recipientBranch: Yup.string()
    .required('Recipient branch is required'),
  details: Yup.string()
    .required('Transfer details are required')
    .min(10, 'Details must be at least 10 characters long')
    .max(500, 'Details cannot exceed 500 characters')
});

export default function BranchTransferModal({ isOpen, onClose, vehicleId, onSuccess }: BranchTransferModalProps) {
  // Early return if vehicleId is not provided
  if (!vehicleId) {
    return null;
  }

  const [currentVehicle, setCurrentVehicle] = useState<VehicleDetails | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState({
    vehicleLoading: false,
    branchLoading: false,
    submitLoading: false
  });
  const [error, setError] = useState<string | null>(null);

  // Initial form values
  const initialValues: BranchTransferFormValues = {
    vehicleId: vehicleId,
    recipientBranch: '',
    details: ''
  };

  // Fetch current vehicle details
  const fetchCurrentVehicle = async () => {
    try {
      setLoading(prev => ({ ...prev, vehicleLoading: true }));
      setError(null);

      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle details');
      }

      const vehicleData = await response.json();
      setCurrentVehicle(vehicleData);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to load vehicle details');
    } finally {
      setLoading(prev => ({ ...prev, vehicleLoading: false }));
    }
  };

  // Fetch branches list
  const fetchBranches = async () => {
    try {
      setLoading(prev => ({ ...prev, branchLoading: true }));

      const response = await fetch('/api/branches');
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

            const data = await response.json();
      // Filter out the current vehicle's branch and only show active branches

      setBranches(data.branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Failed to load branches');
      setBranches([]);
    } finally {
      setLoading(prev => ({ ...prev, branchLoading: false }));
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchCurrentVehicle();
    }
  }, [isOpen, vehicleId]);

  // Fetch branches when vehicle is loaded
  useEffect(() => {
    if (currentVehicle) {
      fetchBranches();
    }
  }, [currentVehicle]);
console.log({currentVehicle})
  // Handle form submission
  const handleSubmit = async (values: BranchTransferFormValues) => {
    try {
      setLoading(prev => ({ ...prev, submitLoading: true }));
      setError(null);

      // Find the branch by ID (recipientBranch contains the branch ID)
      const selectedBranch = branches.find(branch => branch.id === values.recipientBranch);
      if (!selectedBranch) {
        throw new Error('Selected branch not found');
      }

      const transferData = {
        vehicleId: values.vehicleId,
        recipientBranchId: selectedBranch.id,
        details: values.details,
        transferDate: new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`/api/vehicles/${vehicleId}/branch-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to transfer vehicle');
      }

      const result = await response.json();
      console.log('Branch transfer completed:', result);

      // Show success toast
      toast.success('Vehicle transferred successfully!');

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      // Close modal on success
      onClose();

    } catch (error) {
      console.error('Error transferring vehicle:', error);
      setError(error instanceof Error ? error.message : 'Failed to transfer vehicle. Please try again.');
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
                Move to another branch
              </DialogTitle>
              <p className="text-primary text-sm">
                Enter the details below to transfer this vehicle to another branch
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
            validationSchema={BranchTransferSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => (
              <Form id="branch-transfer-form">

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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                      {/* Current Branch */}
                      {currentVehicle.branch && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Current Branch</label>
                          <p className="text-primary font-semibold">
                            {(() => {
                              // Use branch_id as primary source, fall back to branch object/string
                              const currentBranchId = currentVehicle.branch_id ||
                                (typeof currentVehicle.branch === 'object' && currentVehicle.branch !== null
                                  ? currentVehicle.branch.id
                                  : currentVehicle.branch);

                              // If we have branch object, use it directly
                              if (typeof currentVehicle.branch === 'object' && currentVehicle.branch !== null) {
                                return `${currentVehicle.branch.name} (${currentVehicle.branch.code})`;
                              }

                              // Otherwise, find the branch by ID
                              const currentBranch: Branch | undefined = branches.find(b => b.id === currentBranchId);
                              return currentBranch ? `${currentBranch.name} (${currentBranch.code})` : `Branch ID: ${currentBranchId}`;
                            })()}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No vehicle details available
                    </div>
                  )}
                </div>

                {/* Recipient Branch Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-4">Transfer details</h3>

                  {/* Branch Dropdown */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary mb-2">
                      Recipient Branch
                    </label>
                    <SimpleSearchableSelect
                      options={branches.filter(branch => {
                        // Use branch_id as primary source, fall back to branch object/string
                        const currentBranchId = currentVehicle?.branch_id ||
                          (typeof currentVehicle?.branch === 'object' && currentVehicle?.branch !== null
                            ? currentVehicle.branch.id
                            : currentVehicle?.branch);
                        return branch.is_active && branch.id !== currentBranchId;
                      }).map(branch => ({
                        key: branch.id,
                        id: branch.id,
                        value: branch.name,
                        subValue: `${branch.name} (${branch.code})${branch.address ? ` - ${branch.address}` : ''}`
                      }))}
                      value={values.recipientBranch}
                      onChange={(value) => setFieldValue('recipientBranch', value)}
                      placeholder="Select branch"
                      className="w-full"
                      error={errors.recipientBranch && touched.recipientBranch ? errors.recipientBranch : undefined}
                    />
                  </div>

                  {/* Details */}
                  <div className="mb-6">
                    <CustomTextarea
                      name="details"
                      label="Transfer Details"
                      value={values.details}
                      onChange={(value: string) => setFieldValue('details', value)}
                      placeholder="Enter reason for transfer and any additional details..."
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
              submittingText="Transferring..."
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              form="branch-transfer-form"
            >
              Transfer now
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

