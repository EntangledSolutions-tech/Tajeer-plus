'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CustomerOverview from './CustomerOverview';
import CustomerContracts from './CustomerContracts';
import CustomerInvoices from './CustomerInvoices';
import CustomerFinance from './CustomerFinance';
import CustomerPenalties from './CustomerPenalties';
import CustomerDocuments from './CustomerDocuments';
import CustomButton from '../../reusableComponents/CustomButton';
import { Edit, MoreHorizontal, Trash2, ChevronDown, Pencil } from 'lucide-react';
import StatusChangeModal from './StatusChangeModal';
import CustomTabs from '../../reusableComponents/CustomTabs';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import CustomerDetailsStep from '../CustomerModal/CustomerStepper/CustomerDetailsStep';
import CustomerDocumentsStep from '../CustomerModal/CustomerStepper/CustomerDocumentsStep';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import * as Yup from 'yup';

interface Customer {
  id: string;
  name: string;
  id_type: string;
  id_number: string;
  classification_id?: string;
  license_type_id?: string;
  nationality_id?: string;
  status_id?: string;
  mobile_number?: string;
  date_of_birth: string;
  address: string;
  // Joined data from foreign key relationships
  classification?: { classification: string };
  license_type?: { license_type: string };
  nationality?: { nationality: string };
  status?: string | { name: string; color?: string };
}

interface CustomerStatus {
  id: string;
  name: string;
  color: string | null;
  description?: string;
}

// Validation schemas for edit modal
const customerDetailsSchema = Yup.object({
  name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  idType: Yup.string().required('ID Type is required'),
  idNumber: Yup.string().required('ID Number is required'),
  classification: Yup.string().required('Classification is required'),
  licenseType: Yup.string().required('License type is required'),
  dateOfBirth: Yup.string().required('Date of birth is required'),
  address: Yup.string().required('Address is required').min(10, 'Address must be at least 10 characters'),
});

const emptySchema = Yup.object({});

const stepSchemas = [
  customerDetailsSchema,
  emptySchema, // No validation for documents step - handled manually
];

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

export default function CustomerDetailsLayout() {
  const params = useParams();
  const customerId = params?.id as string;
  const router = useRouter();

  // Customer data state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<{
    customer: boolean;
    statusUpdate: boolean;
    statuses: boolean;
  }>({
    customer: true,
    statusUpdate: false,
    statuses: false
  });
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ name: string; file: File }[]>([]);

  // Status modal state
  const [customerStatuses, setCustomerStatuses] = useState<CustomerStatus[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const tabs = [
    { label: 'Overview', key: 'overview' },
    { label: 'Contracts', key: 'contracts' },
    { label: 'Invoices', key: 'invoices', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Finance', key: 'finance', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Penalties', key: 'penalties', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Documents', key: 'documents' },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  // Handle documents change for edit modal
  const handleDocumentsChange = (docs: { name: string; file: File }[]) => {
    setDocuments(docs);
  };

  // Handle customer update
  const handleCustomerUpdate = async (values: any, stepData: any) => {
    try {
      // Prepare customer data for API update
      const customerData = {
        name: values.name,
        id_type: values.idType,
        id_number: values.idNumber,
        classification_id: values.classification,
        license_type_id: values.licenseType,
        nationality_id: values.nationality,
        status_id: values.status,
        mobile_number: values.mobileNumber,
        date_of_birth: values.dateOfBirth,
        address: values.address,
      };

      // Call the API to update customer
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      const result = await response.json();
      setCustomer(result);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update customer');
    }
  };

  // Handle customer deletion
  const handleCustomerDelete = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      // Redirect to customers list
      router.push('/customers');
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      // You might want to show a toast error here
    }
  };

  // Fetch customer statuses
  const fetchCustomerStatuses = async () => {
    try {
      setLoading(prev => ({ ...prev, statuses: true }));
      const response = await fetch('/api/customer-configuration/statuses?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch customer statuses');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.statuses)) {
        setCustomerStatuses(data.statuses);
      }
    } catch (err) {
      console.error('Error fetching customer statuses:', err);
      setCustomerStatuses([]);
    } finally {
      setLoading(prev => ({ ...prev, statuses: false }));
    }
  };

  // Update customer status
  const updateCustomerStatus = async (statusId: string) => {
    try {
      setLoading(prev => ({ ...prev, statusUpdate: true }));
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status_id: statusId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer status');
      }

      const updatedCustomer = await response.json();
      setCustomer(updatedCustomer);
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Error updating customer status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update customer status');
    } finally {
      setLoading(prev => ({ ...prev, statusUpdate: false }));
    }
  };

  // Get initial values for edit modal
  const getEditInitialValues = () => {
    if (!customer) return {};

    return {
      name: customer.name || '',
      idType: customer.id_type || '',
      idNumber: customer.id_number || '',
      classification: customer.classification_id || '',
      licenseType: customer.license_type_id || '',
      nationality: customer.nationality_id || '',
      status: customer.status_id || '',
      mobileNumber: customer.mobile_number || '',
      dateOfBirth: customer.date_of_birth || '',
      address: customer.address || '',
    };
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(prev => ({ ...prev, customer: true }));
        setError(null);

        if (!customerId) {
          throw new Error('Customer ID not found');
        }

        // Fetch customer details
        const response = await fetch(`/api/customers/${customerId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch customer details: ${response.status}`);
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch customer data');
      } finally {
        setLoading(prev => ({ ...prev, customer: false }));
      }
    };

    if (customerId) {
      fetchCustomerData();
      fetchCustomerStatuses();
    }
  }, [customerId]);

  if (loading.customer) {
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-transparent">
        <div className="px-6 pb-2">
          <Link href="/customers" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">
            &lt; Back
          </Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">{customer?.name || '-'}</div>
                <div className="text-lg text-blue-100 font-medium">
                  {customer ? `${customer.id_type} - ${customer.id_number}` : '-'}
                </div>
              </div>
              <div className="ml-4">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity bg-white border"
                  style={{
                    color: (typeof customer?.status === 'object' && customer?.status?.color) ? customer.status.color : '#000',
                    borderColor: (typeof customer?.status === 'object' && customer?.status?.color) ? customer.status.color : '#d1d5db'
                  }}
                  onClick={() => {
                    if (customerStatuses.length > 0 && !loading.statuses) {
                      setIsStatusModalOpen(true);
                    }
                  }}
                >
                  <span>
                    {loading.statuses ? 'Loading...' : (typeof customer?.status === 'object' ? customer?.status?.name : customer?.status) || 'Active'}
                  </span>
                  {!loading.statuses && <Pencil size={14} />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomStepperModal
                steps={steps}
                stepSchemas={stepSchemas}
                initialValues={getEditInitialValues()}
                title="Edit Customer"
                onSubmit={handleCustomerUpdate}
                onDocumentsChange={handleDocumentsChange}
                triggerButton={
                  <CustomButton isSecondary className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </CustomButton>
                }
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CustomButton isSecondary className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    More Actions
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </CustomButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleCustomerDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Customer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mt-10">
        <div className="px-6 py-4">
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <div className="py-6 px-0">
          {activeTab === 'overview' && <CustomerOverview customer={customer} />}
          {activeTab === 'contracts' && <CustomerContracts customerId={customerId} />}
          {activeTab === 'invoices' && <CustomerInvoices />}
          {activeTab === 'finance' && <CustomerFinance />}
          {activeTab === 'penalties' && <CustomerPenalties />}
          {activeTab === 'documents' && <CustomerDocuments customerId={customerId} />}
        </div>
      </div>

      {/* Status Change Modal */}
      {customerStatuses.length > 0 && (
        <StatusChangeModal
          open={isStatusModalOpen}
          onOpenChange={setIsStatusModalOpen}
          currentStatus={customerStatuses.find(s => s.id === customer?.status_id) || (customer?.status ? { id: customer.status_id || '', name: typeof customer.status === 'object' ? customer.status.name : customer.status, color: typeof customer.status === 'object' ? customer.status.color || null : null } : null)}
          availableStatuses={customerStatuses}
          onStatusChange={updateCustomerStatus}
          loading={loading.statusUpdate}
        />
      )}
    </div>
  );
}