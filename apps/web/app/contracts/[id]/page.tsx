'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTabs from '../../reusableComponents/CustomTabs';
import ContractDocuments from './ContractDetailsComponents/ContractDocuments';
import ContractFinance from './ContractDetailsComponents/ContractFinance';
import ContractInvoices from './ContractDetailsComponents/ContractInvoices';
import ContractOverview from './ContractDetailsComponents/ContractOverview';
import ContractPenalties from './ContractDetailsComponents/ContractPenalties';
import ContractStatusChangeModal from './ContractStatusChangeModal';
import ContractModal from '../ContractModal';
import { useHttpService } from '../../../lib/http-service';

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
  selected_vehicle_id?: string;
  vehicle_plate?: string;
  vehicle_serial_number?: string;
  selected_inspector?: string;
  inspector_name?: string;
  documents_count?: number;
  documents?: any[];

  // Customer data from join
  customer?: Customer | null;
}

export default function ContractDetails() {
  const params = useParams();
  const contractId = params?.id as string;
  const router = useRouter();
  const { getRequest, putRequest, deleteRequest } = useHttpService();

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

  // Edit modal management
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const tabs = [
    { label: 'Overview', key: 'overview' },
    { label: 'Invoices', key: 'invoices', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Finance', key: 'finance', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Penalties', key: 'penalties', disabled: true, disabledReason: 'This feature is not yet implemented' },
    { label: 'Documents', key: 'documents' },
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

    fetchContractData();
  }, [contractId]);

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
                  {!statusLoading.statuses && <Pencil size={14} />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomButton
                isSecondary
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </CustomButton>
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
                    onClick={handleContractDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Contract
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
          {activeTab === 'overview' && <ContractOverview contract={contract} />}
          {activeTab === 'invoices' && <ContractInvoices contractId={contract?.id} />}
          {activeTab === 'finance' && <ContractFinance contractId={contract?.id} />}
          {activeTab === 'penalties' && <ContractPenalties contractId={contract?.id} />}
          {activeTab === 'documents' && <ContractDocuments contractId={contract?.id} />}
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

      {/* Contract Edit Modal */}
      {isEditModalOpen && contract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-7xl mx-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            <ContractModal
              isEdit={true}
              contractId={contract.id}
              initialContract={contract}
              onContractAdded={() => {
                handleContractUpdate();
                setIsEditModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}