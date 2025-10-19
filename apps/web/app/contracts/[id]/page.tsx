'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTabs from '../../reusableComponents/CustomTabs';
import ContractFinance from './ContractDetailsComponents/ContractFinance';
import ContractInvoices from './ContractDetailsComponents/ContractInvoices';
import ContractOverview from './ContractDetailsComponents/ContractOverview';
import ContractPenalties from './ContractDetailsComponents/ContractPenalties';
import ContractStatusChangeModal from './ContractStatusChangeModal';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import ContractDetailsStep from '../ContractModal/ContractStepper/ContractDetailsStep';
import CustomerDetailsStep from '../ContractModal/ContractStepper/CustomerDetailsStep';
import VehicleDetailsStep from '../ContractModal/ContractStepper/VehicleDetailsStep';
import PricingTermsStep from '../ContractModal/ContractStepper/PricingTermsStep';
import VehicleInspectionStep from '../ContractModal/ContractStepper/VehicleInspectionStep';
import SummaryStep from '../ContractModal/ContractStepper/SummaryStep';
import * as Yup from 'yup';
import { contractValidationSchema, customerDetailsSchema, vehicleDetailsSchema, vehicleInspectionSchema, documentsSchema, pricingTermsSchema, contractDetailsSchema } from '../ContractModal/validation-schema';
import { useHttpService } from '../../../lib/http-service';
import { useBranch } from '../../../contexts/branch-context';
import { toast } from '@kit/ui/sonner';

interface Customer {
  id: string;
  name: string;
  id_type: string;
  id_number: string;
  classification: string;
  license_type: string;
  date_of_birth: string;
  address: string;
  mobile_number: string;
  nationality: string;
  status: string;
  membership_id?: string;
  membership_tier?: string;
  membership_points?: number;
  membership_valid_until?: string;
}

interface ContractStatus {
  id: string;
  name: string;
  color: string | null;
  description?: string;
}

interface Contract {
  id: string;
  contract_number?: string;
  tajeer_number?: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status_id?: string;
  status?: { name: string; color?: string };
  total_amount: number;
  created_at: string;

  // Additional contract fields from database
  type?: string;
  insurance_type?: string;
  daily_rental_rate?: number;
  hourly_delay_rate?: number;
  current_km?: string;
  rental_days?: number;
  permitted_daily_km?: number;
  excess_km_rate?: number;
  payment_method?: string;
  membership_enabled?: boolean;
  selected_customer_id?: string;
  selected_vehicle_id?: string;
  vehicle_plate?: string;
  vehicle_serial_number?: string;
  vehicle_plate_registration_type?: string;
  vehicle_make_year?: string;
  vehicle_model?: string;
  vehicle_make?: string;
  vehicle_color?: string;
  vehicle_mileage?: number;
  vehicle_status?: string;
  vehicle_daily_rent_rate?: number;
  vehicle_hourly_delay_rate?: number;
  vehicle_permitted_daily_km?: number;
  vehicle_excess_km_rate?: number;
  selected_inspector?: string;
  inspector_name?: string;

  // Contract details
  duration_type?: string;
  duration_in_days?: number;
  total_fees?: number;

  // Customer data from join
  customer?: Customer | null;
}

// Define stepper steps
const stepperSteps: StepperModalStep[] = [
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

export default function ContractDetails() {
  const params = useParams();
  const contractId = params?.id as string;
  const router = useRouter();
  const { getRequest, putRequest, deleteRequest } = useHttpService();
  const { selectedBranch } = useBranch();

  // Contract data state
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contract status management
  const [contractStatuses, setContractStatuses] = useState<ContractStatus[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState({
    statuses: false,
    update: false
  });


  // Get initial values for edit modal
  const getEditInitialValues = () => {
    if (!contract) return {};

    // Helper function to safely get nested values
    const getNestedValue = (obj: any, path: string, defaultValue: any = '') => {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    };

    return {
      // Step 1 - Customer Details
      selectedCustomerId: contract.selected_customer_id || '',
      customerName: getNestedValue(contract, 'customer.name') || contract.customer_name || '',
      customerIdType: getNestedValue(contract, 'customer.id_type') || '',
      customerIdNumber: getNestedValue(contract, 'customer.id_number') || '',
      customerClassification: getNestedValue(contract, 'customer.classification') || '',
      customerDateOfBirth: getNestedValue(contract, 'customer.date_of_birth') || '',
      customerLicenseType: getNestedValue(contract, 'customer.license_type') || '',
      customerAddress: getNestedValue(contract, 'customer.address') || '',
      customerMobile: getNestedValue(contract, 'customer.mobile_number') || '',
      customerStatus: getNestedValue(contract, 'customer.status') || '',
      customerStatusId: getNestedValue(contract, 'customer.status_id') || '',
      customerNationality: getNestedValue(contract, 'customer.nationality') || '',

      // Step 2 - Vehicle Details
      selectedVehicleId: contract.selected_vehicle_id || '',
      vehiclePlate: contract.vehicle_plate || '',
      vehicleSerialNumber: contract.vehicle_serial_number || '',
      vehiclePlateRegistrationType: contract.vehicle_plate_registration_type || 'Private',
      vehicleMakeYear: contract.vehicle_make_year || '',
      vehicleModel: contract.vehicle_model || '',
      vehicleMake: contract.vehicle_make || '',
      vehicleColor: contract.vehicle_color || '',
      vehicleMileage: contract.vehicle_mileage || 0,
      vehicleStatus: contract.vehicle_status || 'Available',
      vehicleDailyRentRate: contract.vehicle_daily_rent_rate || contract.daily_rental_rate || 0,
      vehicleHourlyDelayRate: contract.vehicle_hourly_delay_rate || contract.hourly_delay_rate || 0,
      vehiclePermittedDailyKm: contract.vehicle_permitted_daily_km || contract.permitted_daily_km || 0,
      vehicleExcessKmRate: contract.vehicle_excess_km_rate || contract.excess_km_rate || 0,

      // Step 3 - Contract Details
      startDate: contract.start_date || '',
      endDate: contract.end_date || '',
      durationType: contract.duration_type || 'duration',
      durationInDays: contract.duration_in_days || 1,
      totalFees: contract.total_fees || 0,
      statusId: contract.status_id || '',
      contractNumber: contract.contract_number || '',

      // Step 4 - Pricing & Terms
      dailyRentalRate: contract.daily_rental_rate?.toString() || '0',
      hourlyDelayRate: contract.hourly_delay_rate?.toString() || '0',
      currentKm: contract.current_km?.toString() || '0',
      rentalDays: contract.rental_days?.toString() || '1',
      permittedDailyKm: contract.permitted_daily_km?.toString() || '0',
      excessKmRate: contract.excess_km_rate?.toString() || '0',
      paymentMethod: contract.payment_method || 'cash',
      membershipEnabled: Boolean(contract.membership_enabled),
      totalAmount: contract.total_amount?.toString() || '0',

      // Step 5 - Vehicle Inspection
      selectedInspector: contract.selected_inspector || '',
      inspectorName: contract.inspector_name || '',

      // Step 6 - Summary (no additional fields needed)
    };
  };

  // Handle contract edit submission
  const handleContractEditSubmit = async (values: any, stepData: any) => {
    try {
      // Prepare contract data for database update
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

      const response = await putRequest(`/api/contracts/${contractId}`, contractData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update contract');
      }

      // Refresh contract data
      const refreshContractData = async () => {
        if (!contractId) {
          setError('No contract ID provided');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response = await getRequest(`/api/contracts/${contractId}`);
          if (response.success && response.data) {
            setContract(response.data.contract);
          } else {
            throw new Error(response.error || 'Invalid response format');
          }
        } catch (err) {
          console.error('Error fetching contract data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch contract data');
        } finally {
          setLoading(false);
        }
      };

      refreshContractData();

    } catch (err: any) {
      throw new Error(err.message || 'Failed to update contract');
    }
  };

  const tabs = [
    { label: 'Overview', key: 'overview' },
    { label: 'Invoices', key: 'invoices', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Finance', key: 'finance', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Penalties', key: 'penalties', disabled: true, disabledReason: 'This feature is not yet implemented' },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch contract statuses
  const fetchContractStatuses = async () => {
    try {
      setStatusLoading(prev => ({ ...prev, statuses: true }));
      const response = await getRequest('/api/contract-statuses?limit=100');
      if (response.success && response.data) {
        setContractStatuses(response.data.statuses || []);
      }
    } catch (err: any) {
      console.error('Error fetching contract statuses:', err);
    } finally {
      setStatusLoading(prev => ({ ...prev, statuses: false }));
    }
  };

  // Handle contract status change
  const handleContractStatusChange = async (statusId: string) => {
    try {
      setStatusLoading(prev => ({ ...prev, update: true }));

      const response = await putRequest(`/api/contracts/${contractId}`, {
        status_id: statusId
      });

      if (response.success && response.data) {
        // Update the contract status in local state
        setContract(response.data.contract);
      } else {
        throw new Error(response.error || 'Failed to update contract status');
      }
    } catch (err: any) {
      console.error('Error updating contract status:', err);
      throw err; // Re-throw to let the modal handle the error
    } finally {
      setStatusLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Handle contract update after edit
  const handleContractUpdate = () => {
    // Refresh contract data
    const refreshContractData = async () => {
      if (!contractId) {
        setError('No contract ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch contract details with branch validation
        const url = selectedBranch
          ? `/api/contracts/${contractId}?branch_id=${selectedBranch.id}`
          : `/api/contracts/${contractId}`;

        const response = await getRequest(url);

        if (response.success && response.data) {
          setContract(response.data.contract);
        } else {
          // Check if it's an unauthorized access error
          const isUnauthorized = response.error && response.error.includes('access denied');
          const isForbidden = (response as any).status === 403;

          if (!response.success && (isUnauthorized || isForbidden)) {
            toast.error('Access denied: This contract belongs to a different branch or user');
            router.push('/home');
            return;
          }
          throw new Error(response.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching contract data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contract data');
      } finally {
        setLoading(false);
      }
    };

    refreshContractData();
  };

  // Handle contract deletion
  const handleContractDelete = async () => {
    try {
      const response = await deleteRequest(`/api/contracts/${contractId}`);
      if (response.success) {
        // Redirect to contracts list
        router.push('/contracts');
      } else {
        throw new Error(response.error || 'Failed to delete contract');
      }
    } catch (err: any) {
      console.error('Error deleting contract:', err);
      // You might want to show a toast error here
    }
  };

  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractId) {
        setError('No contract ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch contract details with branch validation
        const url = selectedBranch
          ? `/api/contracts/${contractId}?branch_id=${selectedBranch.id}`
          : `/api/contracts/${contractId}`;

        const response = await getRequest(url);

        if (response.success && response.data) {
          setContract(response.data.contract);
        } else {
          // Check if it's an unauthorized access error
          if (response.error && (response.error.includes('access denied') || response.code === 'UNAUTHORIZED_ACCESS')) {
            toast.error('Access denied: This contract belongs to a different branch or user');
            router.push('/home');
            return;
          }
          throw new Error(response.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching contract data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contract data');
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId, selectedBranch]);

  // Fetch contract statuses on component mount
  useEffect(() => {
    fetchContractStatuses();
  }, []);

  if (loading) {
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
          <Link href="/contracts" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">
            &lt; Back
          </Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">
                  {contract?.contract_number || contract?.tajeer_number || `Contract #${contract?.id?.slice(0, 8)}` || 'Contract'}
                </div>
                <div className="text-lg text-blue-100 font-medium">
                  Contract ID: {contract?.id || '-'}
                </div>
              </div>
              <div className="ml-4">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity bg-white border"
                  style={{
                    color: contract?.status?.color || '#000',
                    borderColor: contract?.status?.color || '#d1d5db'
                  }}
                  onClick={() => {
                    if (contractStatuses.length > 0 && !statusLoading.statuses) {
                      setIsStatusModalOpen(true);
                    }
                  }}
                >
                  <span>
                    {statusLoading.statuses ? 'Loading...' : contract?.status?.name || 'Draft'}
                  </span>
                  {/* {!statusLoading.statuses && <Pencil size={14} />} */}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomStepperModal
                steps={stepperSteps}
                stepSchemas={stepSchemas}
                initialValues={getEditInitialValues()}
                title="Edit Contract"
                onSubmit={handleContractEditSubmit}
                triggerButton={
                  <CustomButton isSecondary className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </CustomButton>
                }
              />
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
          {activeTab === 'overview' && <ContractOverview contract={contract} />}
          {activeTab === 'invoices' && <ContractInvoices contractId={contract?.id} />}
          {activeTab === 'finance' && <ContractFinance contractId={contract?.id} />}
          {activeTab === 'penalties' && <ContractPenalties contractId={contract?.id} />}
        </div>
      </div>

      {/* Contract Status Change Modal */}
      <ContractStatusChangeModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        currentStatus={contractStatuses.find(status => status.id === contract?.status_id) || null}
        availableStatuses={contractStatuses}
        onStatusChange={handleContractStatusChange}
        loading={statusLoading.update}
      />

    </div>
  );
}