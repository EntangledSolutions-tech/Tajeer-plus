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
import DocumentsStep from './ContractStepper/DocumentsStep';
import * as Yup from 'yup';

const steps: StepperModalStep[] = [
  {
    id: 'contract-details',
    name: 'Contract Details',
    component: ContractDetailsStep
  },
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
    id: 'documents',
    name: 'Documents',
    component: DocumentsStep
  }
];

const contractDetailsSchema = Yup.object({
  startDate: Yup.string()
    .required('Start date is required')
    .test('not-past', 'Start date cannot be in the past', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  endDate: Yup.string()
    .required('End date is required')
    .when('startDate', ([startDate], schema) => {
      return startDate
        ? schema.test('after-start', 'End date must be at least one day after start date', function(value) {
            if (!value || !startDate) return false;
            const start = new Date(startDate as string);
            const end = new Date(value);
            return end > start;
          })
        : schema;
    }),
  type: Yup.string().required('Type is required'),
  insuranceType: Yup.string().required('Insurance type is required'),
  statusId: Yup.string().required('Status is required'),
  contractNumberType: Yup.string().required('Contract number type is required'),
  contractNumber: Yup.string().when('contractNumberType', {
    is: 'dynamic',
    then: (schema) => schema.required('Contract number is required'),
    otherwise: (schema) => schema
  }),
  tajeerNumber: Yup.string().when('contractNumberType', {
    is: 'linked',
    then: (schema) => schema.required('Tajeer number is required'),
    otherwise: (schema) => schema
  })
});

const customerDetailsSchema = Yup.object({
  customerType: Yup.string().required('Customer type is required'),
  selectedCustomerId: Yup.string().when('customerType', {
    is: 'existing',
    then: (schema) => schema.required('Please select a customer'),
    otherwise: (schema) => schema
  }),
  customerName: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('Customer name is required'),
    otherwise: (schema) => schema
  }),
  customerIdType: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('ID type is required'),
    otherwise: (schema) => schema
  }),
  customerIdNumber: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('ID number is required'),
    otherwise: (schema) => schema
  }),
  customerClassification: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('Classification is required'),
    otherwise: (schema) => schema
  }),
  customerDateOfBirth: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('Date of birth is required'),
    otherwise: (schema) => schema
  }),
  customerLicenseType: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('License type is required'),
    otherwise: (schema) => schema
  }),
  customerAddress: Yup.string().when('customerType', {
    is: 'new',
    then: (schema) => schema.required('Address is required'),
    otherwise: (schema) => schema
  })
});

const vehicleDetailsSchema = Yup.object({
  selectedVehicleId: Yup.string().required('Please select a vehicle'),
  vehiclePlate: Yup.string().required('Vehicle plate is required'),
  vehicleSerialNumber: Yup.string().required('Vehicle serial number is required')
});

const pricingTermsSchema = Yup.object({
  dailyRentalRate: Yup.string().required('Daily rental rate is required'),
  hourlyDelayRate: Yup.string().required('Hourly delay rate is required'),
  currentKm: Yup.string().required('Current km is required'),
  rentalDays: Yup.string().required('Rental days is required'),
  permittedDailyKm: Yup.string().required('Permitted daily km is required'),
  excessKmRate: Yup.string().required('Excess km rate is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
  totalAmount: Yup.string().required('Total amount is required')
});

const vehicleInspectionSchema = Yup.object({
  selectedInspector: Yup.string().required('Please select an inspector'),
  inspectorName: Yup.string().required('Inspector name is required')
});

const documentsSchema = Yup.object({
  documentsCount: Yup.number().min(1, 'At least one document is required'),
  documents: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Document name is required'),
      uploaded: Yup.boolean().oneOf([true], 'Document must be uploaded')
    })
  ).min(1, 'At least one document is required')
});

const stepSchemas = [
  contractDetailsSchema,
  customerDetailsSchema,
  vehicleDetailsSchema,
  pricingTermsSchema,
  vehicleInspectionSchema,
  documentsSchema,
];

const initialValues = {
  // Step 1 - Contract Details
  startDate: '',
  endDate: '',
  type: '',
  insuranceType: '',
  statusId: '',
  contractNumberType: 'dynamic',
  contractNumber: '',
  tajeerNumber: '',

    // Step 2 - Customer Details
  customerType: 'existing',
  selectedCustomerId: '',
  customerName: '',
  customerIdType: '',
  customerIdNumber: '',
  customerClassification: '',
  customerDateOfBirth: '',
  customerLicenseType: '',
  customerAddress: '',

  // Step 3 - Vehicle Details
  selectedVehicleId: '',
  vehiclePlate: '',
  vehicleSerialNumber: '',

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

  // Step 6 - Documents
  documentsCount: 0,
  documents: [],
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

  // Get initial values for edit mode
  const getEditInitialValues = () => {
    if (!initialContract) return initialValues;

    return {
      // Step 1 - Contract Details
      startDate: initialContract.start_date || '',
      endDate: initialContract.end_date || '',
      type: initialContract.type || '',
      insuranceType: initialContract.insurance_type || '',
      statusId: initialContract.status_id || '',
      contractNumberType: initialContract.contract_number_type || 'dynamic',
      contractNumber: initialContract.contract_number || '',
      tajeerNumber: initialContract.tajeer_number || '',

      // Step 2 - Customer Details
      customerType: initialContract.customer_type || 'existing',
      selectedCustomerId: initialContract.selected_customer_id || '',
      customerName: initialContract.customer_name || '',
      customerIdType: initialContract.customer_id_type || '',
      customerIdNumber: initialContract.customer_id_number || '',
      customerClassification: initialContract.customer_classification || '',
      customerDateOfBirth: initialContract.customer_date_of_birth || '',
      customerLicenseType: initialContract.customer_license_type || '',
      customerAddress: initialContract.customer_address || '',

      // Step 3 - Vehicle Details
      selectedVehicleId: initialContract.selected_vehicle_id || '',
      vehiclePlate: initialContract.vehicle_plate || '',
      vehicleSerialNumber: initialContract.vehicle_serial_number || '',

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

      // Step 6 - Documents
      documentsCount: initialContract.documents_count || 0,
      documents: initialContract.documents || [],
    };
  };

  const submitContract = async (values: any, stepData: any) => {
    try {
      // First, upload all documents to storage if any exist
      let uploadedDocuments: any[] = [];
      if (values.documents && values.documents.length > 0) {
        for (const doc of values.documents as any[]) {
          if (doc.file) {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('documentName', doc.name);

            const response = await fetch(`/api/contracts/temp/documents`, {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to upload document ${doc.name}: ${errorData.error}`);
            }

            const uploadResult = await response.json();
            uploadedDocuments.push({
              id: doc.id,
              name: doc.name,
              fileName: doc.file.name,
              fileUrl: uploadResult.document.fileUrl,
              fileSize: doc.file.size,
              mimeType: doc.file.type,
              uploaded: true,
              uploadedAt: new Date().toISOString()
            });
          }
        }
      }

      // Prepare contract data for database insertion
      const contractData = {
        // Contract Details
        start_date: values.startDate,
        end_date: values.endDate,
        type: values.type,
        insurance_type: values.insuranceType,
        contract_number_type: values.contractNumberType,
        contract_number: values.contractNumber || null,
        tajeer_number: values.tajeerNumber || null,

        // Customer Details
        customer_type: values.customerType,
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

        // Documents
        documents_count: uploadedDocuments.length,
        documents: uploadedDocuments,

        // Status - use status_id from the form
        status_id: values.statusId
      };

      // Log the contract data being sent for debugging
      console.log('Contract data being sent:', contractData);

      let response;
      if (isEdit && contractId) {
        // Update existing contract
        response = await fetch('/api/contracts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: contractId,
            ...contractData
          })
        });
      } else {
        // Create new contract
        response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contractData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} contract`);
      }

      const result = await response.json();
      const createdContract = result.contract;

      // Move uploaded documents to the final contract location (only for new contracts)
      if (!isEdit && uploadedDocuments.length > 0) {
        for (const doc of uploadedDocuments) {
          try {
            const moveResponse = await fetch(`/api/contracts/${createdContract.id}/documents`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                document: doc,
                moveFromTemp: true
              })
            });

            if (!moveResponse.ok) {
              console.warn(`Failed to move document ${doc.name} to final location`);
            }
          } catch (moveError) {
            console.warn(`Error moving document ${doc.name}:`, moveError);
          }
        }
      }

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
