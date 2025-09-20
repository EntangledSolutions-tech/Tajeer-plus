'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Checkbox } from '@kit/ui/checkbox';
import { ArrowLeft, Edit, MoreHorizontal, Phone, Mail, MapPin, Globe, FileText, Building2, ChevronDown, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CustomButton from '../../../../reusableComponents/CustomButton';
import CustomCard from '../../../../reusableComponents/CustomCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useHttpService } from '../../../../../lib/http-service';

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  city_region?: string;
  commercial_registration_number?: string;
  website?: string;
  branch_license_number?: string;
  is_rental_office?: boolean;
  has_no_cars?: boolean;
  has_cars_and_employees?: boolean;
  is_maintenance_center?: boolean;
  has_shift_system_support?: boolean;
  is_limousine_office?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BranchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getRequest, deleteRequest } = useHttpService();

  useEffect(() => {
    fetchBranchDetails();
  }, [branchId]);

  const fetchBranchDetails = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`/api/branches/${branchId}`);

      if (response.success && response.data) {
        setBranch(response.data.branch);
      } else {
        throw new Error(response.error || 'Failed to fetch branch details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchDelete = async () => {
    try {
      const response = await deleteRequest(`/api/branches/${branchId}`);

      if (response.success) {
        // Redirect to branches list
        router.push('/configurations/rental-company');
      } else {
        throw new Error(response.error || 'Failed to delete branch');
      }
    } catch (err: any) {
      console.error('Error deleting branch:', err);
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      } else {
        alert('An unexpected error occurred while deleting the branch');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0065F2]"></div>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Error: {error || 'Branch not found'}
        </div>
      </div>
    );
  }

  const branchRoles = [
    { key: 'is_rental_office', label: 'Branch is a rental office', checked: branch.is_rental_office },
    { key: 'has_no_cars', label: 'Branch does not have cars', checked: branch.has_no_cars },
    { key: 'has_cars_and_employees', label: 'Branch has cars and employees', checked: branch.has_cars_and_employees },
    { key: 'is_maintenance_center', label: 'Branch is a maintenance center', checked: branch.is_maintenance_center },
    { key: 'has_shift_system_support', label: 'Branch has a shift system support', checked: branch.has_shift_system_support },
    { key: 'is_limousine_office', label: 'Branch is a limousine office', checked: branch.is_limousine_office },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-transparent">
        <div className="px-6 pb-2">
          <Link href="/configurations/rental-company" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">&lt; Back</Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">{branch.name}</div>
                <div className="text-lg text-blue-100 font-medium">Branch Code: {branch.code}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomButton
                isSecondary
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white"
              >
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
                  <DropdownMenuItem
                    onClick={handleBranchDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Branch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="py-6">
          <div className="mx-6  space-y-6">
            {/* Branch Details */}
            <CustomCard
              shadow="sm"
              radius="xl"
              padding="lg"
              className="overflow-hidden"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Branch Details</h2>
                <p className="text-sm text-gray-600">Complete information about this branch</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg font-semibold text-gray-900">{branch.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-base text-gray-900">{branch.phone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-base text-gray-900">{branch.email || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">City/Region</label>
                    <p className="text-base text-gray-900">{branch.city_region || '-'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-base text-gray-900">{branch.address || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Commercial registration number</label>
                      <p className="text-base text-gray-900">{branch.commercial_registration_number || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Branch license number</label>
                      <p className="text-base text-gray-900">{branch.branch_license_number || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <p className="text-base text-gray-900">
                        {branch.website ? (
                          <a
                            href={branch.website.startsWith('http') ? branch.website : `https://${branch.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {branch.website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Badge
                    className={branch.is_active
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Branch Code: {branch.code}
                  </span>
                </div>
              </div>
            </CustomCard>

            {/* Branch Roles */}
            <CustomCard
              shadow="sm"
              radius="xl"
              padding="lg"
              className="overflow-hidden"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Branch Roles</h2>
                <p className="text-sm text-gray-600">Define the roles and capabilities of this branch</p>
              </div>

              <div className="space-y-3">
                {branchRoles.map((role) => (
                  <div key={role.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={role.key}
                      checked={role.checked}
                      disabled
                      className="cursor-not-allowed"
                    />
                    <label
                      htmlFor={role.key}
                      className="text-sm font-medium leading-none cursor-not-allowed text-gray-700"
                    >
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
            </CustomCard>
          </div>
        </div>
      </div>
    </div>
  );
}
