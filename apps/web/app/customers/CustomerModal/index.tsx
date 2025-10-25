import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import CustomerDetailsStep from './CustomerStepper/CustomerDetailsStep';
// import CustomerDocumentsStep from './CustomerStepper/CustomerDocumentsStep';
import * as Yup from 'yup';
import { useHttpService } from '../../../lib/http-service';
import { useBranch } from '../../../contexts/branch-context';

const customerDetailsSchema = Yup.object({
  idType: Yup.string().required('ID Type is required'),
  mobileNumber: Yup.string()
    .required('Mobile number is required')
    .min(7, 'Mobile number must be at least 7 digits')
    .matches(/^[0-9]+$/, 'Mobile number must contain only digits'),
  countryCode: Yup.string().required('Country code is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),

  // National ID and Resident ID specific fields (shared)
  nationalOrResidentIdNumber: Yup.string().when('idType', {
    is: (val: string) => val === 'National ID' || val === 'Resident ID',
    then: (schema) => schema
      .required('National/Resident ID Number is required')
      .min(1, 'ID Number must be at least 1 character')
      .max(50, 'ID Number must not exceed 50 characters')
      .matches(/^[0-9]+$/, 'ID Number must contain only digits')
      .test('trim', 'ID Number cannot be empty', (value) => value?.trim().length > 0),
    otherwise: (schema) => schema.notRequired()
  }).test('unique', 'This ID number already exists', async function(value) {
    const { idType } = this.parent;
    if ((idType !== 'National ID' && idType !== 'Resident ID') || !value) return true;

    try {
      const field = idType === 'National ID' ? 'national_id_number' : 'resident_id_number';
      const response = await fetch('/api/customers/check-uniqueness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      });

      if (!response.ok) {
        console.warn('Uniqueness check failed, allowing submission');
        return true;
      }

      const data = await response.json();
      return data.isUnique;
    } catch (error) {
      console.warn('Uniqueness check error:', error);
      return true;
    }
  }),
  birthDate: Yup.string().when('idType', {
    is: (val: string) => val === 'National ID' || val === 'Resident ID',
    then: (schema) => schema
      .required('Birth Date is required')
      .test('past-or-today', 'Birth Date cannot be in the future', function(value) {
        if (!value) return false;
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        return selectedDate <= today;
      }),
    otherwise: (schema) => schema.notRequired()
  }),

  // GCC Countries Citizens specific fields (conditional validation)
  nationalOrGccIdNumber: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('National/GCC ID Number is required').min(1, 'ID Number must be at least 1 character').max(50, 'ID Number must not exceed 50 characters'),
    otherwise: (schema) => schema.notRequired()
  }).test('unique', 'This ID number already exists', async function(value) {
    const { idType } = this.parent;
    if (idType !== 'GCC Countries Citizens' || !value) return true;

    try {
      const response = await fetch('/api/customers/check-uniqueness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'gcc_id_number', value })
      });

      if (!response.ok) {
        // If the check fails (e.g., field doesn't exist yet), allow it to pass
        console.warn('Uniqueness check failed, allowing submission');
        return true;
      }

      const data = await response.json();
      return data.isUnique;
    } catch (error) {
      // If there's an error (e.g., field doesn't exist), allow it to pass
      console.warn('Uniqueness check error:', error);
      return true;
    }
  }),
  country: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema.required('Country is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  idCopyNumber: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema
      .required('ID Copy Number is required')
      .test('is-positive-number', 'ID Copy Number must be a positive number', (value) => {
        if (!value) return false;
        const num = Number(value);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      }),
    otherwise: (schema) => schema.notRequired()
  }),
  licenseNumber: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema.required('License Number is required').min(1, 'License Number must be at least 1 character').max(50, 'License Number must not exceed 50 characters').matches(/^[0-9\/]+$/, 'License Number must contain only digits and /'),
    otherwise: (schema) => schema.notRequired()
  }).test('unique', 'This license number already exists', async function(value) {
    const { idType } = this.parent;
    if ((idType !== 'GCC Countries Citizens' && idType !== 'Visitor') || !value) return true;

    const response = await fetch('/api/customers/check-uniqueness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'license_number', value })
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.isUnique;
  }),
  idExpiryDate: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema.required('ID Expiry Date is required').test('future-date', 'ID Expiry Date must be today or in the future', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
    otherwise: (schema) => schema.notRequired()
  }),
  licenseExpiryDate: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema.required('License Expiry Date is required').test('future-date', 'License Expiry Date must be today or in the future', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
    otherwise: (schema) => schema.notRequired()
  }),
  licenseType: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('License Type is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  placeOfIdIssue: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema.required('Place of ID Issue is required').min(2, 'Place of ID Issue must be at least 2 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  address: Yup.string().when('idType', {
    is: (val: string) => val === 'GCC Countries Citizens' || val === 'Visitor',
    then: (schema) => schema.required('Address is required').min(10, 'Address must be at least 10 characters').max(500, 'Address must not exceed 500 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  rentalType: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('Rental Type is required'),
    otherwise: (schema) => schema.notRequired()
  }),

  // Visitor specific fields (conditional validation)
  borderNumber: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('Border Number is required').min(1, 'Border Number must be at least 1 character'),
    otherwise: (schema) => schema.notRequired()
  }),
  passportNumber: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('Passport Number is required').min(1, 'Passport Number must be at least 1 character'),
    otherwise: (schema) => schema.notRequired()
  }).test('unique', 'This passport number already exists', async function(value) {
    const { idType } = this.parent;
    if (idType !== 'Visitor' || !value) return true;

    const response = await fetch('/api/customers/check-uniqueness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'passport_number', value })
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.isUnique;
  }),
});

// Empty schema for documents step (no validation needed)
const emptySchema = Yup.object({});

const stepSchemas = [
  customerDetailsSchema,
];

const initialValues = {
  // Step 0 - Customer Details
  idType: 'Resident ID', // Default to Resident ID
  mobileNumber: '',
  countryCode: '+966', // Default to Saudi Arabia
  email: '',

  // National ID and Resident ID shared fields
  nationalOrResidentIdNumber: '',
  birthDate: '',
  address: '',
  rentalType: '',

  // GCC Countries Citizens specific fields
  nationalOrGccIdNumber: '',
  country: '',
  idCopyNumber: '',
  licenseNumber: '',
  idExpiryDate: '',
  licenseExpiryDate: '',
  licenseType: '',
  placeOfIdIssue: '',

  // Visitor specific fields
  borderNumber: '',
  passportNumber: '',

  // Step 1 - Documents (handled separately)
  documents: [],
  docName: '',
  docFile: null,
};

const steps: StepperModalStep[] = [
  {
    id: 'customer-details',
    name: 'Customer Details',
    component: CustomerDetailsStep
  }
  // {
  //   id: 'documents',
  //   name: 'Documents',
  //   component: CustomerDocumentsStep
  // }
];

export default function CustomerModal({ onCustomerAdded }: { onCustomerAdded?: () => void }) {
  const [documents, setDocuments] = React.useState<{ name: string; file: File }[]>([]);
  const { postRequest } = useHttpService();
  const { selectedBranch } = useBranch();
  const supabase = useSupabase();

  const handleDocumentsChange = (docs: { name: string; file: File }[]) => {
    setDocuments(docs);
  };

  const submitCustomer = async (values: any, stepData: any) => {
    try {
      // Validate that a branch is selected
      if (!selectedBranch) {
        throw new Error("Please select a branch before adding a customer");
      }

      // First, upload all documents to storage if any exist
      let uploadedDocuments: any[] = [];
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          if (doc.file) {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('documentName', doc.name);
            formData.append('documentType', 'customer_document'); // Default type

            const uploadResult = await postRequest(`/api/customers/temp/documents`, formData);

            if (uploadResult.success && uploadResult.data) {
              uploadedDocuments.push({
                id: doc.name + '_' + Date.now(),
                document_name: doc.name,
                document_type: 'customer_document',
                document_url: uploadResult.data.document.document_url,
                file_name: doc.file.name,
                file_size: doc.file.size,
                mime_type: doc.file.type,
                uploaded_at: new Date().toISOString(),
                temp_path: uploadResult.data.document.temp_path,
                tempPath: uploadResult.data.document.tempPath,
                fileName: doc.file.name // Add fileName for the API
              });
            } else {
              throw new Error(`Failed to upload document ${doc.name}: ${uploadResult.error}`);
            }
          }
        }
      }

      // Prepare customer data for API
      const customerData: any = {
        id_type: values.idType,
        mobile_number: `${values.countryCode}${values.mobileNumber}`,
        email: values.email || '',
        documents: uploadedDocuments,
        documents_count: uploadedDocuments.length,
        branch_id: selectedBranch.id,
      };

      // Add ID type specific fields
      if (values.idType === 'National ID' || values.idType === 'Resident ID') {
        // National ID and Resident ID specific fields
        customerData.nationalOrResidentIdNumber = values.nationalOrResidentIdNumber;
        customerData.birthDate = values.birthDate;
        customerData.address = values.address;
        customerData.rentalType = values.rentalType;
      } else if (values.idType === 'GCC Countries Citizens') {
        // GCC Countries Citizens specific fields
        customerData.nationalOrGccIdNumber = values.nationalOrGccIdNumber;
        customerData.country = values.country;
        customerData.idCopyNumber = values.idCopyNumber;
        customerData.licenseNumber = values.licenseNumber;
        customerData.idExpiryDate = values.idExpiryDate;
        customerData.licenseExpiryDate = values.licenseExpiryDate;
        customerData.licenseType = values.licenseType;
        customerData.placeOfIdIssue = values.placeOfIdIssue;
        customerData.address = values.address;
        customerData.rentalType = values.rentalType;
      } else if (values.idType === 'Visitor') {
        // Visitor specific fields
        customerData.border_number = values.borderNumber;
        customerData.passport_number = values.passportNumber;
        customerData.license_number = values.licenseNumber;
        customerData.id_expiry_date = values.idExpiryDate;
        customerData.license_expiry_date = values.licenseExpiryDate;
        customerData.license_type = values.licenseType;
        customerData.place_of_id_issue = values.placeOfIdIssue;
        customerData.address = values.address;
        customerData.country = values.country;
        customerData.id_copy_number = values.idCopyNumber;
      }

      // Call the API to create customer
      const result = await postRequest('/api/customers', customerData);

      if (result.success && result.data) {
        console.log('Customer created successfully:', result.data);

        // Move uploaded documents to the final customer location
        if (uploadedDocuments.length > 0) {
          console.log('Moving documents:', uploadedDocuments);
          for (const doc of uploadedDocuments) {
            try {
              console.log('Moving document:', doc);
              const moveResult = await postRequest(`/api/customers/${result.data.customer.id}/documents`, {
                document: doc,
                moveFromTemp: true
              });

              console.log('Move result:', moveResult);
              if (!moveResult.success) {
                console.error(`Failed to move document ${doc.document_name} to final location:`, moveResult.error);
              } else {
                console.log(`Successfully moved document ${doc.document_name}`);
              }
            } catch (moveError) {
              console.error(`Error moving document ${doc.document_name}:`, moveError);
            }
          }
        }

        if (onCustomerAdded) {
          onCustomerAdded();
        }

        // Show success toast
        toast.success('Customer added successfully!');
      } else {
        throw new Error(result.error || 'Failed to create customer');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create customer');
    }
  };

  return (
    <CustomStepperModal
      steps={steps}
      stepSchemas={stepSchemas}
      initialValues={initialValues}
      triggerButton={
        <CustomButton
          className="rounded-lg border border-white bg-transparent text-white"
          icon={<Plus className="h-4 w-4" />}
        >
          Add Customer
        </CustomButton>
      }
      title="Add new customer"
      onSubmit={submitCustomer}
      onComplete={() => {
        // Reset documents when modal is closed
        setDocuments([]);
      }}
      onDocumentsChange={handleDocumentsChange}
      maxWidth="max-w-5xl"
    />
  );
}