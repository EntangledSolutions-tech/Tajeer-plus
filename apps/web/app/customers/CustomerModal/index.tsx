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
  name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  idType: Yup.string().required('ID Type is required'),
  nationality: Yup.string().required('Nationality is required'),
  mobileNumber: Yup.string().required('Mobile number is required').min(10, 'Mobile number must be at least 10 digits'),
  email: Yup.string().email('Invalid email format').required('Email is required'),

  // National ID specific fields (conditional validation)
  nationalIdNumber: Yup.string().when('idType', {
    is: 'National ID',
    then: (schema) => schema.required('National ID Number is required').length(10, 'National ID must be 10 digits'),
    otherwise: (schema) => schema.notRequired()
  }),
  nationalIdIssueDate: Yup.string().when('idType', {
    is: 'National ID',
    then: (schema) => schema.required('National ID Issue Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  nationalIdExpiryDate: Yup.string().when('idType', {
    is: 'National ID',
    then: (schema) => schema.required('National ID Expiry Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  placeOfBirth: Yup.string().when('idType', {
    is: 'National ID',
    then: (schema) => schema.required('Place of Birth is required').min(2, 'Place of Birth must be at least 2 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  fatherName: Yup.string().when('idType', {
    is: 'National ID',
    then: (schema) => schema.required('Father Name is required').min(2, 'Father Name must be at least 2 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  motherName: Yup.string().when('idType', {
    is: 'National ID',
    then: (schema) => schema.required('Mother Name is required').min(2, 'Mother Name must be at least 2 characters'),
    otherwise: (schema) => schema.notRequired()
  }),

  // GCC Countries Citizens specific fields (conditional validation)
  idCopyNumber: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('ID Copy Number is required').min(1, 'ID Copy Number must be at least 1 character'),
    otherwise: (schema) => schema.notRequired()
  }),
  licenseExpirationDate: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('License Expiration Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  licenseType: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('License Type is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  placeOfIdIssue: Yup.string().when('idType', {
    is: 'GCC Countries Citizens',
    then: (schema) => schema.required('Place of ID Issue is required').min(2, 'Place of ID Issue must be at least 2 characters'),
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
  }),
  licenseNumber: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('License Number is required').min(1, 'License Number must be at least 1 character'),
    otherwise: (schema) => schema.notRequired()
  }),
  idExpiryDate: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('ID Expiry Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  licenseExpiryDate: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('License Expiry Date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  address: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('Address is required').min(10, 'Address must be at least 10 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  rentalType: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('Rental Type is required').min(2, 'Rental Type must be at least 2 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  hasAdditionalDriver: Yup.string().when('idType', {
    is: 'Visitor',
    then: (schema) => schema.required('Please select if there is an additional driver'),
    otherwise: (schema) => schema.notRequired()
  }),
});

// Empty schema for documents step (no validation needed)
const emptySchema = Yup.object({});

const stepSchemas = [
  customerDetailsSchema,
];

const initialValues = {
  // Step 0 - Customer Details
  name: '',
  idType: 'Resident ID', // Default to Resident ID
  nationality: '',
  mobileNumber: '',
  email: '',

  // National ID specific fields
  nationalIdNumber: '',
  nationalIdIssueDate: '',
  nationalIdExpiryDate: '',
  placeOfBirth: '',
  fatherName: '',
  motherName: '',

  // GCC Countries Citizens specific fields
  idCopyNumber: '',
  licenseExpirationDate: '',
  licenseType: '',
  placeOfIdIssue: '',

  // Visitor specific fields
  borderNumber: '',
  passportNumber: '',
  licenseNumber: '',
  idExpiryDate: '',
  licenseExpiryDate: '',
  rentalType: '',
  hasAdditionalDriver: '',
  address: '',

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
      const customerData = {
        name: values.name,
        id_type: values.idType,
        nationality: values.nationality,
        mobile_number: values.mobileNumber || '',
        email: values.email || '',
        documents: uploadedDocuments,
        documents_count: uploadedDocuments.length,
        branch_id: selectedBranch.id,

        // National ID specific fields
        ...(values.idType === 'National ID' && {
          national_id_number: values.nationalIdNumber,
          national_id_issue_date: values.nationalIdIssueDate,
          national_id_expiry_date: values.nationalIdExpiryDate,
          place_of_birth: values.placeOfBirth,
          father_name: values.fatherName,
          mother_name: values.motherName,
        }),

        // GCC Countries Citizens specific fields
        ...(values.idType === 'GCC Countries Citizens' && {
          id_copy_number: values.idCopyNumber,
          license_expiration_date: values.licenseExpirationDate,
          license_type: values.licenseType,
          place_of_id_issue: values.placeOfIdIssue,
        }),

        // Visitor specific fields
        ...(values.idType === 'Visitor' && {
          border_number: values.borderNumber,
          passport_number: values.passportNumber,
          license_number: values.licenseNumber,
          id_expiry_date: values.idExpiryDate,
          license_expiry_date: values.licenseExpiryDate,
          address: values.address,
          rental_type: values.rentalType,
          has_additional_driver: values.hasAdditionalDriver,
        })
      };

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