'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CompanyOverview from './CompanyOverview';
import CompanyContracts from './CompanyContracts';
import CompanyDocuments from './CompanyDocuments';
import CustomButton from '../../../reusableComponents/CustomButton';
import { Edit, MoreHorizontal, Trash2, ChevronDown, Pencil, ArrowLeft } from 'lucide-react';
import CustomTabs from '../../../reusableComponents/CustomTabs';
import CustomStepperModal, { StepperModalStep } from '../../../reusableComponents/CustomStepperModal';
import CompanyDetailsStep from '../../CompanyModal/CompanyStepper/CompanyDetailsStep';
import CompanyDocumentsStep from '../../CompanyModal/CompanyStepper/CompanyDocumentsStep';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import * as Yup from 'yup';
import { useHttpService } from '../../../../lib/http-service';
import { useBranch } from '../../../../contexts/branch-context';
import { toast } from '@kit/ui/sonner';

interface Company {
  id: string;
  company_name: string;
  tax_number: string;
  commercial_registration_number: string;
  mobile_number: string;
  email: string;
  country: string;
  city: string;
  address: string;
  license_number: string;
  license_type: string;
  license_expiry_date: string;
  establishment_date: string;
  authorized_person_name: string;
  authorized_person_id: string;
  authorized_person_email: string;
  authorized_person_mobile: string;
  rental_type: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

const companyDetailsSchema = Yup.object({
  // Company Information
  companyName: Yup.string()
    .required('Company Name is required')
    .min(2, 'Company Name must be at least 2 characters')
    .max(50, 'Company Name must not exceed 50 characters')
    .test('trim', 'Company Name cannot be empty or whitespace', (value) => value?.trim().length > 0),

  taxNumber: Yup.string()
    .required('Tax Number is required')
    .matches(/^[0-9]{15}$/, 'Tax Number must be exactly 15 digits'),

  commercialRegistrationNumber: Yup.string()
    .required('Commercial Registration Number is required')
    .matches(/^[0-9]{10}$/, 'Commercial Registration Number must be exactly 10 digits'),

  mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .min(7, 'Mobile Number must be at least 7 characters')
    .max(15, 'Mobile Number must not exceed 15 characters'),

  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),

  country: Yup.string()
    .required('Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters'),

  city: Yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must not exceed 50 characters'),

  address: Yup.string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters'),

  licenseNumber: Yup.string()
    .required('License Number is required')
    .min(1, 'License Number must be at least 1 character')
    .max(50, 'License Number must not exceed 50 characters'),

  licenseType: Yup.string()
    .required('License Type is required'),

  licenseExpiryDate: Yup.string()
    .required('License Expiry Date is required'),

  establishmentDate: Yup.string()
    .required('Establishment Date is required'),

  // Legal Representative Information
  authorizedPersonName: Yup.string()
    .required('Legal Representative Name is required')
    .min(2, 'Legal Representative Name must be at least 2 characters')
    .max(100, 'Legal Representative Name must not exceed 100 characters')
    .test('trim', 'Legal Representative Name cannot be empty or whitespace', (value) => value?.trim().length > 0),

  authorizedPersonId: Yup.string()
    .required('Legal Representative ID Number is required')
    .min(1, 'Legal Representative ID Number must be at least 1 character')
    .max(50, 'Legal Representative ID Number must not exceed 50 characters'),

  authorizedPersonEmail: Yup.string()
    .required('Legal Representative Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Legal Representative Email must not exceed 100 characters'),

  authorizedPersonMobile: Yup.string()
    .required('Legal Representative Mobile Number is required')
    .min(7, 'Legal Representative Mobile Number must be at least 7 characters')
    .max(15, 'Legal Representative Mobile Number must not exceed 15 characters'),

  rentalType: Yup.string()
    .required('Rental Type is required'),
});

const companyDocumentsSchema = Yup.object({
  docName: Yup.string().notRequired(),
  docFile: Yup.mixed().notRequired(),
});

const steps: StepperModalStep[] = [
  {
    title: 'Company Details',
    description: 'Basic company information',
    schema: companyDetailsSchema,
    component: CompanyDetailsStep
  },
  {
    title: 'Documents',
    description: 'Upload company documents',
    schema: companyDocumentsSchema,
    component: CompanyDocumentsStep
  }
];

export default function CompanyDetailsLayout() {
  const params = useParams();
  const router = useRouter();
  const { getRequest, postRequest } = useHttpService();
  const { selectedBranch } = useBranch();

  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState({
    company: true,
    edit: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getEditInitialValues = () => {
    if (!company) return {};

    return {
      companyName: company.company_name || '',
      taxNumber: company.tax_number || '',
      commercialRegistrationNumber: company.commercial_registration_number || '',
      mobileNumber: company.mobile_number || '',
      email: company.email || '',
      country: company.country || '',
      city: company.city || '',
      address: company.address || '',
      licenseNumber: company.license_number || '',
      licenseType: company.license_type || '',
      licenseExpiryDate: company.license_expiry_date || '',
      establishmentDate: company.establishment_date || '',
      authorizedPersonName: company.authorized_person_name || '',
      authorizedPersonId: company.authorized_person_id || '',
      authorizedPersonEmail: company.authorized_person_email || '',
      authorizedPersonMobile: company.authorized_person_mobile || '',
      rentalType: company.rental_type || '',
    };
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(prev => ({ ...prev, company: true }));
        setError(null);

        if (!companyId) {
          throw new Error('Company ID not found');
        }

        // Fetch company details with branch validation
        const url = selectedBranch
          ? `/api/companies/${companyId}?branch_id=${selectedBranch.id}`
          : `/api/companies/${companyId}`;

        const result = await getRequest(url);

        if (result.success && result.data) {
          setCompany(result.data);
        } else {
          // Check if it's an unauthorized access error
          const isUnauthorized = result.error && result.error.includes('access denied');
          const isForbidden = (result as any).status === 403;

          if (!result.success && (isUnauthorized || isForbidden)) {
            toast.error('Access denied: This company belongs to a different branch or user');
            router.push('/customers');
            return;
          }
          throw new Error(result.error || 'Failed to fetch company details');
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch company data');
      } finally {
        setLoading(prev => ({ ...prev, company: false }));
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, selectedBranch, getRequest]);

  const handleEditCompany = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, edit: true }));

      const result = await postRequest(`/api/companies/${companyId}`, values);

      if (result.success) {
        // Refresh company data
        const refreshResult = await getRequest(`/api/companies/${companyId}`);
        if (refreshResult.success && refreshResult.data) {
          setCompany(refreshResult.data);
        }

        setIsEditModalOpen(false);
        toast.success('Company updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update company');
      }
    } catch (err: any) {
      toast.error('Error updating company: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  if (loading.company) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0065F2]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <CustomButton onClick={() => router.push('/customers')}>
              Back to Customers
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600 mb-4">The requested company could not be found.</p>
            <CustomButton onClick={() => router.push('/customers')}>
              Back to Customers
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', component: <CompanyOverview company={company} /> },
    { id: 'contracts', label: 'Contracts', component: <CompanyContracts companyId={companyId} /> },
    { id: 'documents', label: 'Documents', component: <CompanyDocuments companyId={companyId} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fff]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CustomButton
              variant="ghost"
              onClick={() => router.push('/customers')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </CustomButton>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
              <p className="text-sm text-gray-600">Company Details</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Company
            </CustomButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CustomButton variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </CustomButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Edit Modal */}
      <CustomStepperModal
        steps={steps}
        stepSchemas={[companyDetailsSchema, companyDocumentsSchema]}
        initialValues={getEditInitialValues()}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company"
        onSubmit={handleEditCompany}
        onComplete={() => {
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}
