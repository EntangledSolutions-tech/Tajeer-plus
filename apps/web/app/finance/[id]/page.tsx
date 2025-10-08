'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, MoreHorizontal } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';
import { useHttpService } from '../../../lib/http-service';

interface FinanceTransaction {
  id: string;
  date: string;
  transactionType: string;
  amount: string;
  invoiceNumber: string;
  status: string;
  isPaid: boolean;
  description: string;
  vehicleId?: string;
  customerId?: string;
  contractId?: string;
  // Add more fields as needed
}

interface Vehicle {
  id: string;
  plate_number: string;
  serial_number: string;
  make?: { name: string };
  model?: { name: string };
  make_year: number;
  color?: { name: string; hex_code: string };
  age_range?: string;
  year_of_manufacture: number;
  mileage: number;
  oil_expiry_km: number;
}

interface Customer {
  id: string;
  name: string;
  id_type: string;
  id_number: string;
  mobile_number?: string;
  classification?: string;
  license_type?: string;
  nationality?: string;
  date_of_birth: string;
  address: string;
}

interface Contract {
  id: string;
  price: number;
  start_date: string;
  end_date: string;
  created_at: string;
  contract_number: string;
}

export default function FinanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getRequest } = useHttpService();

  const [transaction, setTransaction] = useState<FinanceTransaction | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);

      // Fetch transaction details
      const transactionResponse = await getRequest(`/api/finance/transaction/${params.id}`);
      if (transactionResponse.success) {
        setTransaction(transactionResponse.data);

        // Fetch related vehicle if exists
        if (transactionResponse.data.vehicleId) {
          const vehicleResponse = await getRequest(`/api/vehicles/${transactionResponse.data.vehicleId}`);
          if (vehicleResponse.success) {
            setVehicle(vehicleResponse.data);
          }
        }

        // Fetch related customer if exists
        if (transactionResponse.data.customerId) {
          const customerResponse = await getRequest(`/api/customers/${transactionResponse.data.customerId}`);
          if (customerResponse.success) {
            setCustomer(customerResponse.data);
          }
        }

        // Fetch related contract if exists
        if (transactionResponse.data.contractId) {
          const contractResponse = await getRequest(`/api/contracts/${transactionResponse.data.contractId}`);
          if (contractResponse.success) {
            setContract(contractResponse.data);
          }
        }
      } else {
        toast.error('Failed to load transaction details');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('An error occurred while loading transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTransactionDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Transaction not found</p>
          <CustomButton onClick={() => router.back()} className="mt-4">
            Go Back
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <CustomButton
            onClick={() => router.back()}
            variant="ghost"
            className="text-white font-medium text-sm hover:text-blue-100 transition-colors p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </CustomButton>
          <div>
            <h1 className="text-3xl font-bold text-white">{transaction.invoiceNumber}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.isPaid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CustomButton variant="primary" className="bg-transparent text-white border border-white hover:bg-white hover:text-primary hover:border-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </CustomButton>
          <CustomButton variant="primary" className="bg-transparent text-white border border-white hover:bg-white hover:text-primary hover:border-white">
            <MoreHorizontal className="w-4 h-4" />
          </CustomButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-none">
          {/* Transaction Details */}
          <CollapsibleSection
            title="Details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-4 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Date</div>
                <div className="font-bold text-primary text-base">{transaction.date}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Transaction Type</div>
                <div className="font-bold text-primary text-base">{transaction.transactionType}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Amount</div>
                <div className="font-bold text-primary text-base">{transaction.amount}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Linked Invoice</div>
                <div className="font-bold text-primary text-base underline cursor-pointer hover:text-primary/80">
                  {transaction.invoiceNumber}
                </div>
              </div>
              <div className="col-span-4">
                <div className="text-sm text-primary font-medium">Description</div>
                <div className="font-bold text-primary text-base">{transaction.description}</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Contract Details */}
          {contract && (
            <CollapsibleSection
              title="Contract details"
              defaultOpen={true}
              className="mb-6 mx-0"
              headerClassName="bg-[#F6F9FF]"
            >
              <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Price</div>
                  <div className="font-bold text-primary text-base">SAR {contract.price?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Start Date</div>
                  <div className="font-bold text-primary text-base">{contract.start_date}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">End Date</div>
                  <div className="font-bold text-primary text-base">{contract.end_date}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Created on</div>
                  <div className="font-bold text-primary text-base">{new Date(contract.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Tajeer Contract</div>
                  <div className="font-bold text-primary text-base underline cursor-pointer hover:text-primary/80">
                    {contract.contract_number}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Customer Details */}
          {customer && (
            <CollapsibleSection
              title="Customer details"
              defaultOpen={true}
              className="mb-6 mx-0"
              headerClassName="bg-[#F6F9FF]"
            >
              <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Customer Name</div>
                  <div className="font-bold text-primary text-base">{customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Nationality</div>
                  <div className="font-bold text-primary text-base">{customer.nationality || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">ID Type</div>
                  <div className="font-bold text-primary text-base">{customer.id_type}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">ID Number</div>
                  <div className="font-bold text-primary text-base">{customer.id_number}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Classification</div>
                  <div className="font-bold text-primary text-base">{customer.classification || 'Individual'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Mobile Number</div>
                  <div className="font-bold text-primary text-base">{customer.mobile_number || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Date of Birth</div>
                  <div className="font-bold text-primary text-base">{customer.date_of_birth}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">License type</div>
                  <div className="font-bold text-primary text-base">{customer.license_type || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Address</div>
                  <div className="font-bold text-primary text-base">{customer.address}</div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Vehicle Details */}
          {vehicle && (
            <CollapsibleSection
              title="Vehicle details"
              defaultOpen={true}
              className="mb-6 mx-0"
              headerClassName="bg-[#F6F9FF]"
            >
              <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Serial Number</div>
                  <div className="font-bold text-primary text-base">{vehicle.serial_number}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Plate</div>
                  <div className="font-bold text-primary text-base">{vehicle.plate_number}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Year</div>
                  <div className="font-bold text-primary text-base">{vehicle.make_year}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Model</div>
                  <div className="font-bold text-primary text-base">{vehicle.model?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Make</div>
                  <div className="font-bold text-primary text-base">{vehicle.make?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Color</div>
                  <div className="font-bold text-primary text-base">{vehicle.color?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Age Range</div>
                  <div className="font-bold text-primary text-base">{vehicle.age_range || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Year of Manufacture</div>
                  <div className="font-bold text-primary text-base">{vehicle.year_of_manufacture}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Mileage (in km)</div>
                  <div className="font-bold text-primary text-base">{vehicle.mileage?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Oil Expiry (km)</div>
                  <div className="font-bold text-primary text-base">{vehicle.oil_expiry_km?.toLocaleString()}</div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
}
