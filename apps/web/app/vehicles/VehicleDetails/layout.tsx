'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@kit/ui/dialog';
import VehicleOverview from './VehicleOverview';
import VehicleContract from './VehicleContract';
import VehicleDocuments from './VehicleDocuments';
import VehicleFinance from './VehicleFinance';
import VehicleRegistrationKey from './VehicleRegistrationKey';
import VehicleMaintenance from './VehicleMaintenance';
import VehicleTransfersLogs from './VehicleTransfersLogs';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTabs from '../../reusableComponents/CustomTabs';
import CustomStepperModal, { StepperModalStep } from '../../reusableComponents/CustomStepperModal';
import VehicleDetailsStep from '../VehicleModal/VehicleStepper/VehicleDetailsStep';
import PricingFeeStep from '../VehicleModal/VehicleStepper/PricingFeeStep';
import ExpirationDatesStep from '../VehicleModal/VehicleStepper/ExpirationDatesStep';
import VehiclePricingStep from '../VehicleModal/VehicleStepper/VehiclePricingStep';
import DocumentsStep from '../VehicleModal/VehicleStepper/DocumentsStep';
import AdditionalDetailsStep from '../VehicleModal/VehicleStepper/AdditionalDetailsStep';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { MoreHorizontal, Trash2, ChevronDown } from 'lucide-react';
import StatusChangeModal from './StatusChangeModal';
import * as Yup from 'yup';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useHttpService } from '../../../lib/http-service';
import { useBranch } from '../../../contexts/branch-context';
import { toast } from '@kit/ui/sonner';

interface Vehicle {
  id: string;
  plate_number: string;
  make: { name: string } | string;
  make_year: string;
  model?: { name: string } | string;
  color?: { name: string; hex_code?: string } | string;
  age_range?: string;
  serial_number?: string;
  mileage?: string;
  year_of_manufacture?: string;
  car_class?: string;
  plate_registration_type?: string;
  expected_sale_price?: string;
  branch?: string;
  branch_id?: string;
  status?: { name: string; color?: string } | string;
  status_id?: string;
  // Pricing fields
  daily_rental_rate?: number;
  daily_minimum_rate?: number;
  daily_hourly_delay_rate?: number;
  daily_permitted_km?: number;
  daily_excess_km_rate?: number;
  daily_open_km_rate?: number;
  monthly_rental_rate?: number;
  monthly_minimum_rate?: number;
  monthly_hourly_delay_rate?: number;
  monthly_permitted_km?: number;
  monthly_excess_km_rate?: number;
  monthly_open_km_rate?: number;
  hourly_rental_rate?: number;
  hourly_permitted_km?: number;
  hourly_excess_km_rate?: number;
  // Expiration dates
  form_license_expiration?: string;
  insurance_policy_expiration?: string;
  periodic_inspection_end?: string;
  operating_card_expiration?: string;
  // Vehicle pricing
  car_pricing?: number;
  acquisition_date?: string;
  operation_date?: string;
  depreciation_rate?: number;
  depreciation_years?: number;
  // Additional details
  owner?: { name: string; code?: string } | string;
  owner_id?: string;
  actual_user?: { name: string; code?: string } | string;
  user_id?: string;
  insurance_company?: string;
  insurance_type?: string;
  policy_number?: string;
  insurance_value?: string;
  deductible_premium?: string;
  chassis_number?: string;
  insurance_policy?: {
    policy_company?: string;
    policy_type?: string;
    policy_number?: string;
    deductible_premium?: string;
    policy_amount?: string;
  };
}

interface VehicleStatus {
  id: string;
  name: string;
  color: string | null;
  description?: string;
}

// Validation schemas for edit modal
const vehicleDetailsSchema = Yup.object({
  make: Yup.string().required('Car Make is required'),
  model: Yup.string().required('Car Model is required'),
  makeYear: Yup.string().required('Make Year is required'),
  color: Yup.string().required('Car color is required'),
  ageRange: Yup.string().required('Age range is required'),
  serialNumber: Yup.string().required('Serial number is required'),
  plateNumber: Yup.string().required('Plate number is required'),
  mileage: Yup.string().required('Mileage is required').test('is-number', 'Must be a number', value => !isNaN(Number(value)) && Number(value) > 0),
  yearOfManufacture: Yup.string().required('Year of Manufacture is required'),
  carClass: Yup.string().required('Car class classification is required'),
  plateRegistrationType: Yup.string().required('Plate registration type is required'),
  expectedSalePrice: Yup.string().required('Expected Sale Price is required').test('is-number', 'Must be a number', value => !isNaN(Number(value)) && Number(value) > 0),
  branch_id: Yup.string().required('Branch is required'),
});

const pricingFeeSchema = Yup.object({
  dailyRentalRate: Yup.number().typeError('Must be a number').required('Daily rental rate is required'),
  dailyMinimumRate: Yup.number().typeError('Must be a number').required('Daily minimum rate is required'),
  dailyHourlyDelayRate: Yup.number().typeError('Must be a number').required('Daily hourly delay rate is required'),
  dailyPermittedKm: Yup.number().typeError('Must be a number').required('Permitted daily km is required'),
  dailyExcessKmRate: Yup.number().typeError('Must be a number').required('Excess km rate is required'),
  dailyOpenKmRate: Yup.number().typeError('Must be a number').required('Open km rate is required'),
  monthlyRentalRate: Yup.number().typeError('Must be a number').required('Monthly rental rate is required'),
  monthlyMinimumRate: Yup.number().typeError('Must be a number').required('Monthly minimum rate is required'),
  monthlyHourlyDelayRate: Yup.number().typeError('Must be a number').required('Monthly hourly delay rate is required'),
  monthlyPermittedKm: Yup.number().typeError('Must be a number').required('Permitted daily km (monthly) is required'),
  monthlyExcessKmRate: Yup.number().typeError('Must be a number').required('Excess km rate (monthly) is required'),
  monthlyOpenKmRate: Yup.number().typeError('Must be a number').required('Open km rate (monthly) is required'),
  hourlyRentalRate: Yup.number().typeError('Must be a number').required('Hourly rental rate is required'),
  hourlyPermittedKm: Yup.number().typeError('Must be a number').required('Permitted km per hour is required'),
  hourlyExcessKmRate: Yup.number().typeError('Must be a number').required('Excess km rate (hourly) is required'),
});

const expirationDatesSchema = Yup.object({
  formLicenseExpiration: Yup.string().required('Form/license expiration date is required'),
  insurancePolicyExpiration: Yup.string().required('Insurance policy expiration date is required'),
  periodicInspectionEnd: Yup.string().required('Periodic inspection end date is required'),
  operatingCardExpiration: Yup.string().required('Operating card expiration date is required'),
});

const vehiclePricingSchema = Yup.object({
  carPricing: Yup.number().typeError('Must be a number').required('Car Pricing is required').min(1, 'Car Pricing cannot be 0'),
  acquisitionDate: Yup.string().required('Acquisition Date is required'),
  operationDate: Yup.string().required('Operation Date is required'),
  depreciationRate: Yup.number().typeError('Must be a number').required('Depreciation Rate is required').min(0, 'Depreciation Rate must be at least 0%').max(100, 'Depreciation Rate cannot exceed 100%'),
  depreciationYears: Yup.number().typeError('Must be a number').required('Number of depreciation years is required'),
});

const additionalDetailsSchema = Yup.object({
  ownerName: Yup.string().required('Owner Name is required'),
  ownerId: Yup.string(),
  actualUser: Yup.string().required('Actual User is required'),
  userId: Yup.string(),
  insuranceCompany: Yup.string().required('Insurance Company is required'),
  insuranceType: Yup.string().required('Insurance Type is required'),
  policyNumber: Yup.string(),
  insuranceValue: Yup.string(),
  deductiblePremium: Yup.string(),
  chassisNumber: Yup.string().required('Chassis Number is required'),
});

const emptySchema = Yup.object({});

const stepSchemas = [
  vehicleDetailsSchema,
  pricingFeeSchema,
  expirationDatesSchema,
  vehiclePricingSchema,
  emptySchema, // No validation for documents step - handled manually
  additionalDetailsSchema,
];

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

export default function VehicleDetailsLayout() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const supabase = useSupabase();
  const router = useRouter();
  const { selectedBranch } = useBranch();

  // Vehicle data state
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState({
    vehicle: true,
    statusUpdate: false,
    statuses: false,
    deleteVehicle: false
  });
  const [error, setError] = useState<string | null>(null);

  // Status dropdown state
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [documents, setDocuments] = useState<{ name: string; file: File }[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<{ name: string; document_url: string }[]>([]);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();

  const tabs = [
    { label: 'Overview', key: 'overview' },
    { label: 'Contracts', key: 'contracts' },
    { label: 'Maintenance', key: 'maintenance'},
    { label: 'Finance', key: 'finance'},
    { label: 'Documents', key: 'documents' },
    { label: 'Transfers & Logs', key: 'transfers-logs' },
    { label: 'Registration & Key', key: 'registration-key'},
  ];

  const [activeTab, setActiveTab] = useState('overview');

  // Handle documents change for edit modal
  const handleDocumentsChange = (docs: { name: string; file: File }[]) => {
    setDocuments(docs);
  };

  // Fetch existing documents
  const fetchExistingDocuments = async () => {
    try {
      const response = await getRequest(`/api/vehicles/${vehicleId}/documents`);
      if (response.success && response.data) {
        const formattedDocs = response.data.map((doc: any) => ({
          name: doc.document_name,
          document_url: doc.document_url
        }));
        setExistingDocuments(formattedDocs);
      }
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  // Handle vehicle update
  const handleVehicleUpdate = async (values: any, stepData: any) => {
    try {
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

      const response = await putRequest(`/api/vehicles/${vehicleId}`, {
        vehicle: values,
        pricing: values,
        expirations: values,
        depreciation: values,
        additional_details: values,
        documents: uploadedDocs
      });

      if (response.success && response.data) {
        // Refresh vehicle data
        const vehicleResponse = await getRequest(`/api/vehicles/${vehicleId}`);
        if (vehicleResponse.success && vehicleResponse.data) {
          setVehicle(vehicleResponse.data);
        }
      } else {
        throw new Error(response.error || 'Failed to update vehicle');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update vehicle');
    }
  };

  // Handle vehicle deletion confirmation
  const handleVehicleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Confirm vehicle deletion
  const confirmVehicleDelete = async () => {
    try {
      setLoading(prev => ({ ...prev, deleteVehicle: true }));

      const response = await deleteRequest(`/api/vehicles/${vehicleId}`);

      if (response.success) {
        // Close modal and redirect to vehicles list
        setIsDeleteModalOpen(false);
        router.push('/vehicles');
      } else {
        throw new Error(response.error || 'Failed to delete vehicle');
      }
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      setError(err.message || 'Failed to delete vehicle');
    } finally {
      setLoading(prev => ({ ...prev, deleteVehicle: false }));
    }
  };

  // Get initial values for edit modal
  const getEditInitialValues = () => {
    if (!vehicle) return {};

    return {
      // Vehicle details
      make: typeof vehicle.make === 'object' ? vehicle.make?.name : vehicle.make || '',
      model: typeof vehicle.model === 'object' ? vehicle.model?.name : vehicle.model || '',
      makeYear: vehicle.make_year ? vehicle.make_year.toString() : '',
      color: typeof vehicle.color === 'object' ? vehicle.color?.name : vehicle.color || '',
      ageRange: vehicle.age_range || '',
      serialNumber: vehicle.serial_number || '',
      plateNumber: vehicle.plate_number || '',
      mileage: vehicle.mileage || '',
      yearOfManufacture: vehicle.year_of_manufacture ? vehicle.year_of_manufacture.toString() : '',
      carClass: vehicle.car_class || '',
      plateRegistrationType: vehicle.plate_registration_type || '',
      expectedSalePrice: vehicle.expected_sale_price || '',
      branch: vehicle.branch_id || '',

      // Pricing
      dailyRentalRate: vehicle.daily_rental_rate || 0,
      dailyMinimumRate: vehicle.daily_minimum_rate || 0,
      dailyHourlyDelayRate: vehicle.daily_hourly_delay_rate || 0,
      dailyPermittedKm: vehicle.daily_permitted_km || 0,
      dailyExcessKmRate: vehicle.daily_excess_km_rate || 0,
      dailyOpenKmRate: vehicle.daily_open_km_rate || 0,
      monthlyRentalRate: vehicle.monthly_rental_rate || 0,
      monthlyMinimumRate: vehicle.monthly_minimum_rate || 0,
      monthlyHourlyDelayRate: vehicle.monthly_hourly_delay_rate || 0,
      monthlyPermittedKm: vehicle.monthly_permitted_km || 0,
      monthlyExcessKmRate: vehicle.monthly_excess_km_rate || 0,
      monthlyOpenKmRate: vehicle.monthly_open_km_rate || 0,
      hourlyRentalRate: vehicle.hourly_rental_rate || 0,
      hourlyPermittedKm: vehicle.hourly_permitted_km || 0,
      hourlyExcessKmRate: vehicle.hourly_excess_km_rate || 0,

      // Expiration dates
      formLicenseExpiration: vehicle.form_license_expiration || '',
      insurancePolicyExpiration: vehicle.insurance_policy_expiration || '',
      periodicInspectionEnd: vehicle.periodic_inspection_end || '',
      operatingCardExpiration: vehicle.operating_card_expiration || '',

      // Vehicle pricing
      carPricing: vehicle.car_pricing || 0,
      acquisitionDate: vehicle.acquisition_date || '',
      operationDate: vehicle.operation_date || '',
      depreciationRate: vehicle.depreciation_rate || 0,
      depreciationYears: vehicle.depreciation_years ? vehicle.depreciation_years.toString() : '',

      // Additional details
      ownerName: typeof vehicle.owner === 'object' ? vehicle.owner?.name : vehicle.owner || '',
      ownerId: vehicle.owner_id || '',
      actualUser: typeof vehicle.actual_user === 'object' ? vehicle.actual_user?.name : vehicle.actual_user || '',
      userId: vehicle.user_id || '',
      insuranceCompany: vehicle.insurance_company || (typeof vehicle.insurance_policy === 'object' ? vehicle.insurance_policy?.policy_company : '') || '',
      insuranceType: vehicle.insurance_type || (typeof vehicle.insurance_policy === 'object' ? vehicle.insurance_policy?.policy_type : '') || '',
      policyNumber: vehicle.policy_number || (typeof vehicle.insurance_policy === 'object' ? vehicle.insurance_policy?.policy_number : '') || '',
      insuranceValue: vehicle.insurance_value || (typeof vehicle.insurance_policy === 'object' ? vehicle.insurance_policy?.policy_amount : '') || '',
      deductiblePremium: vehicle.deductible_premium || (typeof vehicle.insurance_policy === 'object' ? vehicle.insurance_policy?.deductible_premium : '') || '',
      chassisNumber: vehicle.chassis_number || '',
    };
  };

  // Fetch vehicle statuses for dropdown
  const fetchVehicleStatuses = async () => {
    try {
      setLoading(prev => ({ ...prev, statuses: true }));
      const response = await getRequest('/api/vehicle-configuration/statuses?limit=100');

      if (response.success && response.data && Array.isArray(response.data.statuses)) {
        setVehicleStatuses(response.data.statuses);
      } else {
        console.error('Error fetching vehicle statuses:', response.error);
        if (response.error) {
          toast.error(`Error: ${response.error}`);
        }
      }
    } catch (err) {
      console.error('Error fetching vehicle statuses:', err);
    } finally {
      setLoading(prev => ({ ...prev, statuses: false }));
    }
  };

  // Update vehicle status
  const updateVehicleStatus = async (statusId: string) => {
    try {
      setLoading(prev => ({ ...prev, statusUpdate: true }));
      const response = await putRequest(`/api/vehicles/${vehicleId}`, { status_id: statusId });

      if (response.success && response.data) {
        setVehicle(response.data);
        setIsStatusModalOpen(false);
      } else {
        throw new Error(response.error || 'Failed to update vehicle status');
      }
    } catch (err) {
      console.error('Error updating vehicle status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update vehicle status');
    } finally {
      setLoading(prev => ({ ...prev, statusUpdate: false }));
    }
  };

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(prev => ({ ...prev, vehicle: true }));
        setError(null);

        if (!vehicleId) {
          throw new Error('Vehicle ID not found');
        }

        // Check if vehicleId is a UUID (vehicle ID) or plate number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicleId);

        let actualVehicleId = vehicleId;

        if (!isUUID) {
          // If it's not a UUID, treat it as a plate number and fetch the vehicle ID
          const vehicleResponse = await getRequest(`/api/vehicles?plate_number=${vehicleId}`);

          if (vehicleResponse.success && vehicleResponse.data) {
            // Handle the API response format
            let vehicleData;
            if (Array.isArray(vehicleResponse.data)) {
              vehicleData = vehicleResponse.data;
            } else if (vehicleResponse.data.vehicles && Array.isArray(vehicleResponse.data.vehicles)) {
              vehicleData = vehicleResponse.data.vehicles;
            } else {
              throw new Error('Unexpected vehicle response format');
            }

            if (!vehicleData || !Array.isArray(vehicleData) || vehicleData.length === 0) {
              throw new Error(`Vehicle not found for plate number: ${vehicleId}`);
            }

            const foundVehicleId = vehicleData[0]?.id;
            if (!foundVehicleId) {
              throw new Error('Vehicle ID not found in response');
            }

            actualVehicleId = foundVehicleId;
          } else {
            throw new Error(vehicleResponse.error || 'Failed to fetch vehicle data');
          }
        }

        // Fetch vehicle details with branch validation
        const url = selectedBranch
          ? `/api/vehicles/${actualVehicleId}?branch_id=${selectedBranch.id}`
          : `/api/vehicles/${actualVehicleId}`;

        const response = await getRequest(url);

        if (response.success && response.data) {
          setVehicle(response.data);
        } else {
          // Check if it's an unauthorized access error
          const isUnauthorized = response.error && response.error.includes('access denied');
          const isForbidden = (response as any).status === 403;

          if (!response.success && (isUnauthorized || isForbidden)) {
            toast.error('Access denied: This vehicle belongs to a different branch or user');
            router.push('/home');
            return;
          }
          throw new Error(response.error || 'Failed to fetch vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicle data');
      } finally {
        setLoading(prev => ({ ...prev, vehicle: false }));
      }
    };

    if (vehicleId) {
      fetchVehicleData();
      fetchVehicleStatuses();
      fetchExistingDocuments();
    }
  }, [vehicleId, selectedBranch]);



  if (loading.vehicle) {
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
          <Link href="/vehicles" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">&lt; Back</Link>
        </div>
        <div className="px-6  pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">{vehicle?.plate_number || '-'}</div>
                <div className="text-lg text-blue-100 font-medium">
                  {vehicle ? `${typeof vehicle.make === 'object' ? vehicle.make?.name : vehicle.make} ${vehicle.make_year || ''}`.trim() : '-'}
                </div>
              </div>
              <div className="ml-4">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity bg-white border"
                  style={{
                    color: (typeof vehicle?.status === 'object' && vehicle?.status?.color) ? vehicle.status.color : '#000',
                    borderColor: (typeof vehicle?.status === 'object' && vehicle?.status?.color) ? vehicle.status.color : '#d1d5db'
                  }}
                  onClick={() => {
                    if (vehicleStatuses.length > 0 && !loading.statuses) {
                      setIsStatusModalOpen(true);
                    }
                  }}
                >
                  <span>
                    {loading.statuses ? 'Loading...' : (typeof vehicle?.status === 'object' ? vehicle?.status?.name : vehicle?.status) || 'Available'}
                  </span>
                  {!loading.statuses && <Pencil size={14} />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomStepperModal
                steps={stepperSteps}
                stepSchemas={stepSchemas}
                initialValues={getEditInitialValues()}
                title="Edit Vehicle"
                onSubmit={handleVehicleUpdate}
                onDocumentsChange={handleDocumentsChange}
                initialDocuments={existingDocuments}
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
                    onClick={handleVehicleDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vehicle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mt-10 align-center">
        <div className="px-6 py-4 align-center">
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1">
        <div className="py-6">
          {activeTab === 'overview' && <VehicleOverview />}
          {activeTab === 'contracts' && <VehicleContract />}
          {activeTab === 'documents' && <VehicleDocuments vehicleId={vehicleId} />}
          {activeTab === 'finance' && <VehicleFinance />}
          {activeTab === 'registration-key' && <VehicleRegistrationKey />}
          {activeTab === 'maintenance' && <VehicleMaintenance />}
          {activeTab === 'transfers-logs' && <VehicleTransfersLogs />}
          {/* Add more tab content as needed */}
        </div>
      </div>

      {/* Status Change Modal */}
      {vehicleStatuses.length > 0 && (
        <StatusChangeModal
          open={isStatusModalOpen}
          onOpenChange={setIsStatusModalOpen}
          currentStatus={vehicleStatuses.find(s => s.id === vehicle?.status_id) || (vehicle?.status ? { id: vehicle.status_id || '', name: typeof vehicle.status === 'object' ? vehicle.status.name : vehicle.status, color: typeof vehicle.status === 'object' ? vehicle.status.color || null : null } : null)}
          availableStatuses={vehicleStatuses}
          onStatusChange={updateVehicleStatus}
          loading={loading.statusUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
              {vehicle && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Vehicle Details:</p>
                  <p>Plate Number: {vehicle.plate_number}</p>
                  <p>Make: {typeof vehicle.make === 'object' ? vehicle.make.name : vehicle.make}</p>
                  <p>Model: {typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <CustomButton
              isSecondary
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={loading.deleteVehicle}
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={confirmVehicleDelete}
              disabled={loading.deleteVehicle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading.deleteVehicle ? 'Deleting...' : 'Delete Vehicle'}
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}