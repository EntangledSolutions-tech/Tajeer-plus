import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import CustomerDetailsStep from './CustomerStepper/CustomerDetailsStep';
import CustomerDocumentsStep from './CustomerStepper/CustomerDocumentsStep';
import * as Yup from 'yup';
import { useHttpService } from '../../../lib/http-service';
import { useBranch } from '../../../contexts/branch-context';

const customerDetailsSchema = Yup.object({
  name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  idType: Yup.string().required('ID Type is required'),
  idNumber: Yup.string().required('ID Number is required'),
  classification: Yup.string().required('Classification is required'),
  licenseType: Yup.string().required('License type is required'),
  nationality: Yup.string().required('Nationality is required'),
  status: Yup.string().required('Status is required'),
  mobileNumber: Yup.string().required('Mobile number is required').min(10, 'Mobile number must be at least 10 digits'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .test('not-future', 'Date of birth cannot be a future date', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
      return selectedDate <= today;
    }),
  address: Yup.string().required('Address is required').min(10, 'Address must be at least 10 characters'),
});

// Empty schema for documents step (no validation needed)
const emptySchema = Yup.object({});

const stepSchemas = [
  customerDetailsSchema,
  emptySchema, // No validation for documents step - handled manually
];

const initialValues = {
  // Step 0 - Customer Details
  name: '',
  idType: '',
  idNumber: '',
  classification: '',
  licenseType: '',
  nationality: '',
  status: '',
  mobileNumber: '',
  dateOfBirth: '',
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
  },
  {
    id: 'documents',
    name: 'Documents',
    component: CustomerDocumentsStep
  }
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
        id_number: values.idNumber,
        classification: values.classification,
        license_type: values.licenseType,
        nationality: values.nationality,
        status: values.status,
        date_of_birth: values.dateOfBirth,
        address: values.address,
        mobile_number: values.mobileNumber || '', // Add mobile number if available
        documents: uploadedDocuments,
        documents_count: uploadedDocuments.length,
        branch_id: selectedBranch.id
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