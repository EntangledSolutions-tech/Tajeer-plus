import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import ContractDetailsStep from './ContractStepper/ContractDetailsStep';
import CustomerDetailsStep from './ContractStepper/CustomerDetailsStep';
import VehicleDetailsStep from './ContractStepper/VehicleDetailsStep';
import PricingTermsStep from './ContractStepper/PricingTermsStep';
import VehicleInspectionStep from './ContractStepper/VehicleInspectionStep';
import SummaryStep from './ContractStepper/SummaryStep';
import * as Yup from 'yup';
import { useHttpService } from '../../../lib/http-service';
import { contractValidationSchema, customerDetailsSchema, vehicleDetailsSchema, vehicleInspectionSchema, documentsSchema, pricingTermsSchema, contractDetailsSchema } from './validation-schema';

const steps: StepperModalStep[] = [
  {
    id: 'customer-details',
    name: 'Customer Details',
    component: CustomerDetailsStep
  },
  {
    id: 'vehicle-details',
    name: 'Vehicle Details',
    component: VehicleDetailsStep
  },
  {
    id: 'contract-details',
    name: 'Contract Details',
    component: ContractDetailsStep
  },
  {
    id: 'pricing-terms',
    name: 'Pricing & Terms',
    component: PricingTermsStep
  },
  {
    id: 'vehicle-inspection',
    name: 'Vehicle Inspection',
    component: VehicleInspectionStep
  },
  {
    id: 'summary',
    name: 'Summary',
    component: SummaryStep
  }
];

// Use step-specific validation schemas
const stepSchemas = [
  customerDetailsSchema,    // Step 1 - Customer Details
  vehicleDetailsSchema,     // Step 2 - Vehicle Details
  contractDetailsSchema,    // Step 3 - Contract Details
  pricingTermsSchema,       // Step 4 - Pricing & Terms
  vehicleInspectionSchema,  // Step 5 - Vehicle Inspection
  Yup.object({}),          // Step 6 - Summary (no validation needed)
];

const initialValues = {
  // Step 1 - Customer Details
  selectedCustomerId: '',
  customerName: '',
  customerIdType: '',
  customerIdNumber: '',
  customerClassification: '',
  customerDateOfBirth: '',
  customerLicenseType: '',
  customerAddress: '',
  customerMobile: '',
  customerStatus: '',
  customerStatusId: '',
  customerNationality: '',

  // Step 2 - Vehicle Details
  selectedVehicleId: '',
  vehiclePlate: '',
  vehicleSerialNumber: '',
  vehiclePlateRegistrationType: '',
  vehicleMakeYear: '',
  vehicleModel: '',
  vehicleMake: '',
  vehicleColor: '',
  vehicleMileage: 0,
  vehicleStatus: '',
  vehicleDailyRentRate: 0,

  // Step 3 - Contract Details
  startDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  endDate: '',
  durationType: 'duration',
  durationInDays: 1, // Default to 1 day
  totalFees: 0,
  statusId: '',
  contractNumber: '',

  // Step 4 - Pricing & Terms
  dailyRentalRate: '0',
  hourlyDelayRate: '0',
  currentKm: '0',
  rentalDays: '0',
  permittedDailyKm: '0',
  excessKmRate: '0',
  paymentMethod: 'cash',
  membershipEnabled: false,
  totalAmount: '0',

  // Step 5 - Vehicle Inspection
  selectedInspector: '',
  inspectorName: '',

  // Step 6 - Summary (no additional fields needed)
};

interface ContractModalProps {
  onContractAdded?: () => void;
  isEdit?: boolean;
  contractId?: string;
  initialContract?: any;
}

export default function ContractModal({
  onContractAdded,
  isEdit = false,
  contractId,
  initialContract
}: ContractModalProps) {
  const supabase = useSupabase();
  const { postRequest } = useHttpService();

  // Get initial values for edit mode
  const getEditInitialValues = () => {
    if (!initialContract) return initialValues;

    return {
      // Step 1 - Customer Details
      selectedCustomerId: initialContract.selected_customer_id || '',
      customerName: initialContract.customer_name || '',
      customerIdType: initialContract.customer_id_type || '',
      customerIdNumber: initialContract.customer_id_number || '',
      customerClassification: initialContract.customer_classification || '',
      customerDateOfBirth: initialContract.customer_date_of_birth || '',
      customerLicenseType: initialContract.customer_license_type || '',
      customerAddress: initialContract.customer_address || '',
      customerMobile: initialContract.customer_mobile || '',
      customerStatus: initialContract.customer_status || '',
      customerStatusId: initialContract.customer_status_id || '',
      customerNationality: initialContract.customer_nationality || '',

      // Step 2 - Vehicle Details
      selectedVehicleId: initialContract.selected_vehicle_id || '',
      vehiclePlate: initialContract.vehicle_plate || '',
      vehicleSerialNumber: initialContract.vehicle_serial_number || '',
      vehiclePlateRegistrationType: initialContract.vehicle_plate_registration_type || '',
      vehicleMakeYear: initialContract.vehicle_make_year || '',
      vehicleModel: initialContract.vehicle_model || '',
      vehicleMake: initialContract.vehicle_make || '',
      vehicleColor: initialContract.vehicle_color || '',
      vehicleMileage: initialContract.vehicle_mileage || 0,
      vehicleStatus: initialContract.vehicle_status || '',
      vehicleDailyRentRate: initialContract.vehicle_daily_rent_rate || 0,

      // Step 3 - Contract Details
      startDate: initialContract.start_date || '',
      endDate: initialContract.end_date || '',
      durationType: initialContract.duration_type || 'duration',
      durationInDays: initialContract.duration_in_days || 0,
      totalFees: initialContract.total_fees || 0,
      statusId: initialContract.status_id || '',
      contractNumber: initialContract.contract_number || '',

      // Step 4 - Pricing & Terms
      dailyRentalRate: initialContract.daily_rental_rate?.toString() || '0',
      hourlyDelayRate: initialContract.hourly_delay_rate?.toString() || '0',
      currentKm: initialContract.current_km || '0',
      rentalDays: initialContract.rental_days?.toString() || '0',
      permittedDailyKm: initialContract.permitted_daily_km?.toString() || '0',
      excessKmRate: initialContract.excess_km_rate?.toString() || '0',
      paymentMethod: initialContract.payment_method || 'cash',
      membershipEnabled: initialContract.membership_enabled || false,
      totalAmount: initialContract.total_amount?.toString() || '0',

      // Step 5 - Vehicle Inspection
      selectedInspector: initialContract.selected_inspector || '',
      inspectorName: initialContract.inspector_name || '',

      // Step 6 - Summary (no additional fields needed)
    };
  };

  const submitContract = async (values: any, stepData: any) => {
    try {
      // Prepare contract data for database insertion
      const contractData = {
        // Contract Details
        start_date: values.startDate,
        end_date: values.endDate,
        contract_number: values.contractNumber || null,

        // Customer Details
        selected_customer_id: values.selectedCustomerId || null,
        customer_name: values.customerName || null,
        customer_id_type: values.customerIdType || null,
        customer_id_number: values.customerIdNumber || null,
        customer_classification: values.customerClassification || null,
        customer_date_of_birth: values.customerDateOfBirth && values.customerDateOfBirth.trim() ? values.customerDateOfBirth : null,
        customer_license_type: values.customerLicenseType || null,
        customer_address: values.customerAddress || null,

        // Vehicle Details
        selected_vehicle_id: values.selectedVehicleId,
        vehicle_plate: values.vehiclePlate,
        vehicle_serial_number: values.vehicleSerialNumber,

        // Pricing & Terms
        daily_rental_rate: parseFloat(values.dailyRentalRate) || 0,
        hourly_delay_rate: parseFloat(values.hourlyDelayRate) || 0,
        current_km: values.currentKm || '0',
        rental_days: parseInt(values.rentalDays) || 0,
        permitted_daily_km: parseInt(values.permittedDailyKm) || 0,
        excess_km_rate: parseFloat(values.excessKmRate) || 0,
        payment_method: values.paymentMethod || 'cash',
        membership_enabled: Boolean(values.membershipEnabled),
        total_amount: parseFloat(values.totalAmount) || 0,

        // Vehicle Inspection
        selected_inspector: values.selectedInspector,
        inspector_name: values.inspectorName,

        // Status - use status_id from the form
        status_id: values.statusId
      };

      // Log the contract data being sent for debugging
      console.log('Contract data being sent:', contractData);

      let response;
      if (isEdit && contractId) {
        // Update existing contract
        response = await postRequest('/api/contracts', {
          id: contractId,
          ...contractData
        });
      } else {
        // Create new contract
        response = await postRequest('/api/contracts', contractData);
      }

      if (!response.success) {
        throw new Error(response.error || `Failed to ${isEdit ? 'update' : 'create'} contract`);
      }

      const createdContract = response.data.contract;

      // Note: Document handling removed as Documents step is no longer used

      if (onContractAdded) {
        onContractAdded();
      }

      // Show success toast
      toast.success(`Contract ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create contract');
    }
  };

  return (
    <CustomStepperModal
      steps={steps}
      stepSchemas={stepSchemas}
      initialValues={isEdit ? getEditInitialValues() : initialValues}
      triggerButton={
        <CustomButton
          className="rounded-lg border border-white bg-transparent text-white"
          icon={<Plus className="h-4 w-4" />}
        >
          {isEdit ? 'Edit Contract' : 'Add Contract'}
        </CustomButton>
      }
      title={isEdit ? 'Edit Contract' : 'Add new contract'}
      onSubmit={submitContract}
      maxWidth="max-w-7xl"
    />
  );
}
