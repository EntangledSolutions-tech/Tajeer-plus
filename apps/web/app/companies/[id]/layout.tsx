'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CompanyOverview from '../CompanyOverview';
import CustomButton from '../../reusableComponents/CustomButton';
import { MoreHorizontal, ChevronDown, Trash2 } from 'lucide-react';
import CustomTabs from '../../reusableComponents/CustomTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useHttpService } from '../../../lib/http-service';
import { useBranch } from '../../../contexts/branch-context';
import { toast } from '@kit/ui/sonner';

interface Company {
  id: string;
  company_name: string;
  tax_number: string;
  commercial_registration_number: string;
  mobile_number?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  license_number?: string;
  license_type?: string;
  license_expiry_date?: string;
  establishment_date?: string;
  authorized_person_name?: string;
  authorized_person_id?: string;
  authorized_person_email?: string;
  authorized_person_mobile?: string;
  rental_type?: string;
}

export default function CompanyDetailsLayout() {
  const params = useParams();
  const companyId = params?.id as string;
  const router = useRouter();
  const { getRequest, deleteRequest } = useHttpService();
  const { selectedBranch } = useBranch();

  // Company data state
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { label: 'Overview', key: 'overview' },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  // Handle company deletion
  const handleCompanyDelete = async () => {
    try {
      const result = await deleteRequest(`/api/companies/${companyId}`);

      if (result.success) {
        toast.success('Company deleted successfully');
        router.push('/companies');
      } else {
        throw new Error(result.error || 'Failed to delete company');
      }
    } catch (err: any) {
      console.error('Error deleting company:', err);
      toast.error(err.message || 'Failed to delete company');
    }
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
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
          setCompany(result.data.company || result.data);
        } else {
          // Check if it's an unauthorized access error
          const isUnauthorized = result.error && result.error.includes('access denied');
          const isForbidden = (result as any).status === 403;

          if (!result.success && (isUnauthorized || isForbidden)) {
            toast.error('Access denied: This company belongs to a different branch or user');
            router.push('/companies');
            return;
          }
          throw new Error(result.error || 'Failed to fetch company details');
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, selectedBranch, getRequest, router]);

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
          <Link href="/companies" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">
            &lt; Back
          </Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">{company?.company_name || 'No Name'}</div>
                <div className="text-lg text-blue-100 font-medium">
                  Tax Number: {company?.tax_number || '-'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                    onClick={handleCompanyDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Company
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
          {activeTab === 'overview' && <CompanyOverview company={company} />}
        </div>
      </div>
    </div>
  );
}

