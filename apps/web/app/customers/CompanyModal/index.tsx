import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import CompanyDetailsStep from './CompanyStepper/CompanyDetailsStep';
import CompanyDocumentsStep from './CompanyStepper/CompanyDocumentsStep';
import * as Yup from 'yup';
import { useHttpService } from '../../../lib/http-service';
import { useBranch } from '../../../contexts/branch-context';

const companyDetailsSchema = Yup.object({
  // Company Information
  companyName: Yup.string()
    .required('Company Name is required')
    .min(2, 'Company Name must be at least 2 characters')
    .max(50, 'Company Name must not exceed 50 characters')
    .test('trim', 'Company Name cannot be empty or whitespace', (value) => value?.trim().length > 0),

  taxNumber: Yup.string()
    .required('Tax Number is required')
    .matches(/^[0-9]{15}$/, 'Tax Number must be exactly 15 digits')
    .test('unique', 'This Tax Number already exists', async function(value) {
      if (!value) return true;

      try {
        const response = await fetch('/api/companies/check-uniqueness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'tax_number', value })
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

  commercialRegistrationNumber: Yup.string()
    .required('Commercial Registration Number is required')
    .matches(/^[0-9]{10}$/, 'Commercial Registration Number must be exactly 10 digits')
    .test('unique', 'This Commercial Registration Number already exists', async function(value) {
      if (!value) return true;

      try {
        const response = await fetch('/api/companies/check-uniqueness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'commercial_registration_number', value })
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

  mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .min(7, 'Mobile Number must be at least 7 digits')
    .matches(/^[0-9]+$/, 'Mobile Number must contain only digits'),

  countryCode: Yup.string().required('Country code is required'),

  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  country: Yup.string()
    .required('Country is required')
    .min(2, 'Country must be at least 2 characters'),

  city: Yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters'),

  address: Yup.string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .test('trim', 'Address cannot be empty or whitespace', (value) => value?.trim().length > 0),

  licenseNumber: Yup.string()
    .required('License Number is required')
    .min(1, 'License Number must be at least 1 character')
    .max(50, 'License Number must not exceed 50 characters')
    .test('trim', 'License Number cannot be empty or whitespace', (value) => value?.trim().length > 0),

  licenseType: Yup.string()
    .required('License Type is required'),

  licenseExpiryDate: Yup.string()
    .required('License Expiry Date is required')
    .test('future-date', 'License Expiry Date must be today or in the future', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),

  establishmentDate: Yup.string()
    .required('Establishment Date is required')
    .test('past-date', 'Establishment Date cannot be in the future', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return selectedDate <= today;
    }),

  // Legal Representative Information
  authorizedPersonName: Yup.string()
    .required('Legal Representative Name is required')
    .min(2, 'Legal Representative Name must be at least 2 characters')
    .max(100, 'Legal Representative Name must not exceed 100 characters')
    .test('trim', 'Legal Representative Name cannot be empty or whitespace', (value) => value?.trim().length > 0),

  authorizedPersonId: Yup.string()
    .required('Legal Representative ID Number is required')
    .min(1, 'ID Number must be at least 1 character')
    .max(50, 'ID Number must not exceed 50 characters')
    .test('trim', 'ID Number cannot be empty or whitespace', (value) => value?.trim().length > 0),

  authorizedPersonEmail: Yup.string()
    .email('Invalid email format')
    .required('Legal Representative Email is required'),

  authorizedPersonMobile: Yup.string()
    .required('Legal Representative Mobile Number is required')
    .min(7, 'Mobile Number must be at least 7 digits')
    .matches(/^[0-9]+$/, 'Mobile Number must contain only digits'),

  rentalType: Yup.string()
    .required('Rental Type is required'),
});

// Empty schema for documents step (no validation needed)
const emptySchema = Yup.object({});

const stepSchemas = [
  companyDetailsSchema,
  emptySchema, // Documents step
];

const initialValues = {
  // Company Information
  companyName: '',
  taxNumber: '',
  commercialRegistrationNumber: '',
  mobileNumber: '',
  countryCode: '+966', // Default to Saudi Arabia
  email: '',
  country: 'Saudi Arabia',
  city: '',
  address: '',
  licenseNumber: '',
  licenseType: '',
  licenseExpiryDate: '',
  establishmentDate: '',

  // Legal Representative Information
  authorizedPersonName: '',
  authorizedPersonId: '',
  authorizedPersonEmail: '',
  authorizedPersonMobile: '',
  rentalType: '',

  // Documents
  documents: [],
  docName: '',
  docFile: null,
};

const steps: StepperModalStep[] = [
  {
    id: 'company-details',
    name: 'Company Details',
    component: CompanyDetailsStep
  },
  {
    id: 'documents',
    name: 'Documents',
    component: CompanyDocumentsStep
  }
];

export default function CompanyModal({ onCompanyAdded }: { onCompanyAdded?: () => void }) {
  const [documents, setDocuments] = React.useState<{ name: string; file: File }[]>([]);
  const { postRequest } = useHttpService();
  const { selectedBranch } = useBranch();
  const supabase = useSupabase();

  const handleDocumentsChange = (docs: { name: string; file: File }[]) => {
    setDocuments(docs);
  };

  const submitCompany = async (values: any, stepData: any) => {
    try {
      // Validate that a branch is selected
      if (!selectedBranch) {
        throw new Error("Please select a branch before adding a company");
      }

      // First, upload all documents to storage if any exist
      let uploadedDocuments: any[] = [];
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          if (doc.file) {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('documentName', doc.name);
            formData.append('documentType', 'company_document');

            const uploadResult = await postRequest(`/api/companies/temp/documents`, formData);

            if (uploadResult.success && uploadResult.data) {
              uploadedDocuments.push({
                id: doc.name + '_' + Date.now(),
                document_name: doc.name,
                document_type: 'company_document',
                document_url: uploadResult.data.document.document_url,
                file_name: doc.file.name,
                file_size: doc.file.size,
                mime_type: doc.file.type,
                uploaded_at: new Date().toISOString(),
                temp_path: uploadResult.data.document.temp_path,
                tempPath: uploadResult.data.document.tempPath,
                fileName: doc.file.name
              });
            } else {
              throw new Error(`Failed to upload document ${doc.name}: ${uploadResult.error}`);
            }
          }
        }
      }

      // Prepare company data for API
      const companyData: any = {
        company_name: values.companyName,
        tax_number: values.taxNumber,
        commercial_registration_number: values.commercialRegistrationNumber,
        mobile_number: `${values.countryCode}${values.mobileNumber}`,
        email: values.email,
        country: values.country,
        city: values.city,
        address: values.address,
        license_number: values.licenseNumber,
        license_type: values.licenseType,
        license_expiry_date: values.licenseExpiryDate,
        establishment_date: values.establishmentDate,
        authorized_person_name: values.authorizedPersonName,
        authorized_person_id: values.authorizedPersonId,
        authorized_person_email: values.authorizedPersonEmail,
        authorized_person_mobile: `${values.countryCode}${values.authorizedPersonMobile}`,
        rental_type: values.rentalType,
        documents: uploadedDocuments,
        documents_count: uploadedDocuments.length,
        branch_id: selectedBranch.id,
      };

      // Call the API to create company
      const result = await postRequest('/api/companies', companyData);

      if (result.success && result.data) {
        console.log('Company created successfully:', result.data);

        // Move uploaded documents to the final company location
        if (uploadedDocuments.length > 0) {
          for (const doc of uploadedDocuments) {
            try {
              const moveResult = await postRequest(`/api/companies/${result.data.company.id}/documents`, {
                document: doc,
                moveFromTemp: true
              });

              if (!moveResult.success) {
                console.error(`Failed to move document ${doc.document_name} to final location:`, moveResult.error);
              }
            } catch (moveError) {
              console.error(`Error moving document ${doc.document_name}:`, moveError);
            }
          }
        }

        if (onCompanyAdded) {
          onCompanyAdded();
        }

        toast.success('Company added successfully!');
      } else {
        throw new Error(result.error || 'Failed to create company');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create company');
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
          Add Company
        </CustomButton>
      }
      title="Add new company"
      onSubmit={submitCompany}
      onComplete={() => {
        setDocuments([]);
      }}
      onDocumentsChange={handleDocumentsChange}
      maxWidth="max-w-5xl"
    />
  );
}
