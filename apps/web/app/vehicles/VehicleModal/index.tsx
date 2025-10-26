import React from 'react';
import * as Yup from 'yup';
import VehicleDetailsStep from './VehicleStepper/VehicleDetailsStep';
import PricingFeeStep from './VehicleStepper/PricingFeeStep';
import ExpirationDatesStep from './VehicleStepper/ExpirationDatesStep';
import VehiclePricingStep from './VehicleStepper/VehiclePricingStep';
import DocumentsStep from './VehicleStepper/DocumentsStep';
import AdditionalDetailsStep from './VehicleStepper/AdditionalDetailsStep';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useHttpService } from '../../../lib/http-service';
import { Plus } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import { useBranch } from '../../../contexts/branch-context';

// Define stepper steps
const stepperSteps: StepperModalStep[] = [
  {
    id: 'vehicle-details',
    name: 'Vehicle Details',
    component: VehicleDetailsStep
  },
  {
    id: 'pricing-fee',
    name: 'Pricing / Fee',
    component: PricingFeeStep
  },
  {
    id: 'expiration-dates',
    name: 'Expiration Dates',
    component: ExpirationDatesStep
  },
  {
    id: 'vehicle-pricing',
    name: 'Vehicle Pricing & Depreciation',
    component: VehiclePricingStep
  },
  {
    id: 'documents',
    name: 'Documents',
    component: DocumentsStep
  },
  {
    id: 'additional-details',
    name: 'Additional Details',
    component: AdditionalDetailsStep
  }
];

const vehicleDetailsSchema = Yup.object({
  make: Yup.string().required('Car Make is required'),
  model: Yup.string().required('Car Model is required'),
  makeYear: Yup.string().required('Make Year is required'),
  color: Yup.string().required('Car color is required'),
  serialNumber: Yup.string().required('Serial number is required'),
  plateNumber: Yup.string().required('Plate number is required').max(10, 'Plate number must be at most 10 characters'),
  mileage: Yup.string().required('Mileage is required').test('is-number', 'Must be a number', value => !isNaN(Number(value)) && Number(value) > 0),
  carClass: Yup.string().required('Car class classification is required'),
  plateRegistrationType: Yup.string().required('Plate registration type is required'),
  branch_id: Yup.string().required('Branch is required'),
  chassis_number: Yup.string().required('Chassis Number is required').max(20, 'Chassis number must be at most 20 characters'),
  vehicle_load_capacity: Yup.string().required('Vehicle Load Capacity is required').test('is-number', 'Must be a number', value => !isNaN(Number(value)) && Number(value) > 0),
  ownerName: Yup.string().required('Owner Name is required'),
  ownerId: Yup.string(),
  actualUser: Yup.string().required('Actual User is required'),
  userId: Yup.string(),
});
const pricingFeeSchema = Yup.object({
  // Only validate the daily fields that users actually input
  dailyRentalRate: Yup.number().typeError('Must be a number').required('Daily rental rate is required'),
  dailyMinimumRate: Yup.number().typeError('Must be a number').required('Daily minimum rate is required'),
  dailyHourlyDelayRate: Yup.number().typeError('Must be a number').required('Daily hourly delay rate is required'),
  dailyPermittedKm: Yup.number().typeError('Must be a number').required('Permitted daily km is required'),
  dailyExcessKmRate: Yup.number().typeError('Must be a number').required('Excess km rate is required'),
  dailyOpenKmRate: Yup.number().typeError('Must be a number').required('Open km rate is required'),
  // Monthly and hourly rates are calculated fields - not required for validation
  monthlyRentalRate: Yup.number().typeError('Must be a number').notRequired(),
  monthlyMinimumRate: Yup.number().typeError('Must be a number').notRequired(),
  monthlyHourlyDelayRate: Yup.number().typeError('Must be a number').notRequired(),
  monthlyPermittedKm: Yup.number().typeError('Must be a number').notRequired(),
  monthlyExcessKmRate: Yup.number().typeError('Must be a number').notRequired(),
  monthlyOpenKmRate: Yup.number().typeError('Must be a number').notRequired(),
  hourlyRentalRate: Yup.number().typeError('Must be a number').notRequired(),
  hourlyPermittedKm: Yup.number().typeError('Must be a number').notRequired(),
  hourlyExcessKmRate: Yup.number().typeError('Must be a number').notRequired(),
});
const expirationDatesSchema = Yup.object({
  formLicenseExpiration: Yup.string().required('Form/license expiration date is required'),
  insurancePolicyExpiration: Yup.string().required('Insurance policy expiration date is required'),
  periodicInspectionEnd: Yup.string().required('Periodic inspection end date is required'),
  operatingCardExpiration: Yup.string().required('Operating card expiration date is required'),
});
const vehiclePricingSchema = Yup.object({
  ageRange: Yup.string().required('Age range is required'),
  expectedSalePrice: Yup.string().required('Expected Sale Price is required').test('is-number', 'Must be a number', value => !isNaN(Number(value)) && Number(value) > 0),
  paymentType: Yup.string().required('Payment type is required'),
  // Cash payment fields - only required when paymentType is 'cash'
  carPricing: Yup.number().when('paymentType', {
    is: 'cash',
    then: (schema) => schema.typeError('Must be a number').required('Car Pricing is required').min(1, 'Car Pricing cannot be 0'),
    otherwise: (schema) => schema.notRequired()
  }),
  acquisitionDate: Yup.string().when('paymentType', {
    is: 'cash',
    then: (schema) => schema.required('Acquisition Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  operationDate: Yup.string().when('paymentType', {
    is: 'cash',
    then: (schema) => schema.required('Operation Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  depreciationRate: Yup.number().when('paymentType', {
    is: 'cash',
    then: (schema) => schema.typeError('Must be a number').required('Depreciation Rate is required').min(0, 'Depreciation Rate must be at least 0%').max(100, 'Depreciation Rate cannot exceed 100%'),
    otherwise: (schema) => schema.notRequired()
  }),
  depreciationYears: Yup.string().when('paymentType', {
    is: 'cash',
    then: (schema) => schema.required('Number of depreciation years is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  // Lease-to-own fields - only required when paymentType is 'LeaseToOwn'
  installmentValue: Yup.mixed().when('paymentType', {
    is: 'LeaseToOwn',
    then: (schema) => schema.typeError('Must be a number').required('Installment Value is required').test('min', 'Installment Value must be at least 0', (value) => !value || Number(value) >= 0),
    otherwise: (schema) => schema.notRequired()
  }),
  interestRate: Yup.mixed().when('paymentType', {
    is: 'LeaseToOwn',
    then: (schema) => schema.typeError('Must be a number').required('Interest Rate is required').test('range', 'Interest Rate must be between 0% and 100%', (value) => !value || (Number(value) >= 0 && Number(value) <= 100)),
    otherwise: (schema) => schema.notRequired()
  }),
  totalPrice: Yup.mixed().when('paymentType', {
    is: 'LeaseToOwn',
    then: (schema) => schema.typeError('Must be a number').required('Total Price is required').test('min', 'Total Price must be at least 0', (value) => !value || Number(value) >= 0),
    otherwise: (schema) => schema.notRequired()
  }),
  numberOfInstallments: Yup.mixed().when('paymentType', {
    is: 'LeaseToOwn',
    then: (schema) => schema.typeError('Must be a number').required('Number of Installments is required').test('range', 'Must be between 1 and 120', (value) => !value || (Number(value) >= 1 && Number(value) <= 120)),
    otherwise: (schema) => schema.notRequired()
  }),
});
const documentSchema = Yup.object({
  name: Yup.string().required('Document Name is required'),
  file: Yup.mixed().required('File is required'),
});
const documentsSchema = Yup.object({
  documents: Yup.array(documentSchema).min(1, 'At least one document is required'),
});
const additionalDetailsSchema = Yup.object({
  insuranceCompany: Yup.string().required('Insurance Company is required'),
  insuranceType: Yup.string().required('Insurance Type is required'),
  policyNumber: Yup.string(), // Not required since it's auto-populated
  insuranceValue: Yup.string(), // Not required since it's auto-populated
  deductiblePremium: Yup.string(), // Not required since it's auto-populated
});

// Empty schema for documents step (no validation needed)
const emptySchema = Yup.object({});

const stepSchemas = [
  vehicleDetailsSchema,
  pricingFeeSchema,
  expirationDatesSchema,
  vehiclePricingSchema,
  emptySchema, // No validation for documents step - handled manually
  additionalDetailsSchema,
];

const initialValues = {
  // Step 0 - Vehicle Details
  make: 'Toyota',
  model: 'Camry',
  makeYear: '2023',
  color: 'White',
  serialNumber: 'VIN123456789',
  plateNumber: 'ABC-1234',
  mileage: '15000',
  carClass: 'Van',
  plateRegistrationType: 'Private',
  branch_id: '',
  chassis_number: 'CH123456789',
  vehicle_load_capacity: '500',

  // Payment Type
  paymentType: 'cash',

  // Lease-to-own fields
  installmentValue: 0,
  interestRate: 0,
  totalPrice: 0,
  numberOfInstallments: 0,

  // Step 1 - Pricing/Fee
  dailyRentalRate: 150,
  dailyMinimumRate: 120,
  dailyHourlyDelayRate: 20,
  dailyPermittedKm: 200,
  dailyExcessKmRate: 2,
  dailyOpenKmRate: 1.5,
  monthlyRentalRate: 3500,
  monthlyMinimumRate: 3000,
  monthlyHourlyDelayRate: 25,
  monthlyPermittedKm: 5000,
  monthlyExcessKmRate: 1.8,
  monthlyOpenKmRate: 1.2,
  hourlyRentalRate: 25,
  hourlyPermittedKm: 50,
  hourlyExcessKmRate: 3,

  // Step 2 - Expiration Dates
  formLicenseExpiration: '2025-12-31',
  insurancePolicyExpiration: '2025-12-31',
  periodicInspectionEnd: '2025-06-30',
  operatingCardExpiration: '2025-12-31',

  // Step 3 - Vehicle Pricing & Depreciation
  ageRange: '0-1',
  expectedSalePrice: '45000',
  carPricing: 45000,
  acquisitionDate: '2023-01-15',
  operationDate: '2023-02-01',
  depreciationRate: 15,
  depreciationYears: '5',

  // Step 4 - Documents
  docName: '',
  docFile: null,

  // Step 5 - Additional Details
  carStatus: 'Available',
  ownerName: 'Company Fleet',
  ownerId: '',
  actualUser: 'Fleet Manager',
  userId: '',
  insuranceCompany: 'AXA Insurance',
  insuranceType: 'Comprehensive',
  policyNumber: 'POL123456789',
  insuranceValue: '45000',
  deductiblePremium: '500',
};

export default function VehicleModal({ onVehicleAdded }: { onVehicleAdded?: () => void }) {
  const [documents, setDocuments] = React.useState<{ name: string; file: File }[]>([]);
  const supabase = useSupabase();
  const { postRequest } = useHttpService();
  const { selectedBranch } = useBranch();

  const handleDocumentsChange = React.useCallback((docs: { name: string; file: File }[]) => {
    setDocuments(docs);
  }, []);

  const handleSubmit = async (values: any, stepData: any) => {
    // Validate that a branch is selected
    if (!selectedBranch) {
      throw new Error("Please select a branch before adding a vehicle");
    }

    // Upload all files
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No active session");
    }

    const uploadedDocs = await Promise.all(
      documents.map(async (doc: any) => {
        const filePath = `vehicles/${Date.now()}_${doc.file.name}`;
        const { error } = await supabase.storage.from('vehicle-documents').upload(filePath, doc.file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('vehicle-documents').getPublicUrl(filePath);
        return { document_name: doc.name, document_url: urlData.publicUrl };
      })
    );

    const result = await postRequest('/api/add-vehicle', {
      vehicle: values,
      pricing: values,
      expirations: values,
      depreciation: values,
      additional_details: values,
      documents: uploadedDocs,
      branch_id: selectedBranch.id
    });

    if (result.error) {
      // Show specific error message for plate number conflicts
      if (result.error === 'Plate number already exists') {
        toast.error('Plate number already exists. Please use a different plate number.');
      } else {
        toast.error(result.error);
      }
      throw new Error(result.error);
    }

    toast.success('Vehicle added successfully');
  };

  return (
    <CustomStepperModal
      steps={stepperSteps}
      stepSchemas={stepSchemas}
      initialValues={initialValues}
      title="Add new vehicle"
      onSubmit={handleSubmit}
      onComplete={onVehicleAdded}
      onDocumentsChange={handleDocumentsChange}
      triggerButton={
        <CustomButton
          icon={<Plus className='w-4 h-4'/>}
          className="rounded-lg border border-white bg-transparent text-white"
        >
          Add Vehicle
        </CustomButton>
      }
    />
  );
}
