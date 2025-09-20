'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Edit, MoreHorizontal, ChevronDown, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import CustomButton from '../../../reusableComponents/CustomButton';
import CollapsibleSection from '../../../reusableComponents/CollapsibleSection';

interface Income {
  id: string;
  transaction_number: string;
  transaction_date: string;
  amount: number;
  description: string;
  employee_name: string;
  status: string;
  transaction_type: {
    name: string;
    category: string;
  };
  branch?: {
    name: string;
  };
  vehicle?: {
    plate_number: string;
    make: { name: string };
    model: { name: string };
    make_year: string;
  };
  contract?: {
    contract_number: string;
    customer_name: string;
    start_date: string;
    end_date: string;
    created_at: string;
  };
  customer?: {
    name: string;
    id_type: string;
    id_number: string;
    classification: string;
    mobile_number: string;
    nationality: string;
    date_of_birth: string;
    address: string;
    membership_tier: string;
  };
  rental_income?: {
    income_type: string;
    source: string;
  };
  payment_method?: string;
  linked_invoice?: string;
}

export default function IncomeDetailPage() {
  const params = useParams();
  const incomeId = params.id as string;

  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/finance/income/${incomeId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch income details');
        }

        const data = await response.json();
        setIncome(data);
      } catch (err) {
        console.error('Error fetching income:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch income');
      } finally {
        setLoading(false);
      }
    };

    if (incomeId) {
      fetchIncome();
    }
  }, [incomeId]);

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

  if (!income) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Income not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-transparent">
        <div className="px-6 pb-2">
          <Link href="/finance/rental-finances" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">
            &lt; Back
          </Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">Income</div>
                <div className="text-lg text-blue-100 font-medium">
                  {income.transaction_number}
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-green-100 text-green-700 border border-green-200">
                  <span>{income.status || 'Received'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomButton isSecondary className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white">
                <Edit className="w-4 h-4 mr-2" />
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
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    Delete Income
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-6">
          {/* Details Section */}
          <CollapsibleSection title="Details" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(income.transaction_date).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee</label>
                  <p className="text-lg font-semibold text-gray-900">{income.employee_name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                  <p className="text-lg font-semibold text-gray-900">{income.transaction_type.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-semibold text-green-600">
                    SAR {income.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Linked Invoice</label>
                  <p className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                    INV-123
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Method</label>
                  <p className="text-lg font-semibold text-gray-900">{income.payment_method || 'Bank Transfer'}</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Contract Details Section */}
          {income.contract && (
            <CollapsibleSection title="Contract details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price</label>
                    <p className="text-lg font-semibold text-gray-900">SAR 1,450</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(income.contract.start_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(income.contract.end_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created on</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(income.contract.created_at).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tajeer Contract</label>
                    <p className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                      {income.contract.contract_number}
                      <ExternalLink className="w-4 h-4" />
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Add-ons</label>
                    <p className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                      3 Add-ons
                      <ChevronDown className="w-4 h-4" />
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Customer Details Section */}
          {income.customer && (
            <CollapsibleSection title="Customer details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Type</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.id_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Number</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.id_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Classification</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.classification}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.mobile_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {income.customer.date_of_birth ? new Date(income.customer.date_of_birth).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License type</label>
                    <p className="text-lg font-semibold text-gray-900">Heavy Transport</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.address || 'Buraydah-Al Dhahi'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Membership</label>
                    <p className="text-lg font-semibold text-gray-900">{income.customer.membership_tier || 'Gold'}</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Vehicle Details Section */}
          {income.vehicle && (
            <CollapsibleSection title="Vehicle details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Serial Number</label>
                    <p className="text-lg font-semibold text-gray-900">343525315</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plate</label>
                    <p className="text-lg font-semibold text-gray-900">{income.vehicle.plate_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plate registration type</label>
                    <p className="text-lg font-semibold text-gray-900">Private</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year</label>
                    <p className="text-lg font-semibold text-gray-900">{income.vehicle.make_year}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <p className="text-lg font-semibold text-gray-900">{income.vehicle.model.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Make</label>
                    <p className="text-lg font-semibold text-gray-900">{income.vehicle.make.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Color</label>
                    <p className="text-lg font-semibold text-gray-900">Black</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age Range</label>
                    <p className="text-lg font-semibold text-gray-900">1-3 years</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year of Manufacture</label>
                    <p className="text-lg font-semibold text-gray-900">{income.vehicle.make_year}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mileage (km)</label>
                    <p className="text-lg font-semibold text-gray-900">28,914</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Oil Expiry (km)</label>
                    <p className="text-lg font-semibold text-gray-900">5,901</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Description Section */}
          <CollapsibleSection title="Description" defaultOpen={true}>
            <div>
              <p className="text-gray-700 leading-relaxed">{income.description}</p>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
