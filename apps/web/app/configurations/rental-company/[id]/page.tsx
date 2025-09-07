'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Checkbox } from '@kit/ui/checkbox';
import { ArrowLeft, Edit, MoreHorizontal, Phone, Mail, MapPin, Globe, FileText, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CustomButton from '../../../reusableComponents/CustomButton';

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
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBranchDetails();
  }, [branchId]);

  const fetchBranchDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/branches/${branchId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch branch details');
      }

      const data = await response.json();
      setBranch(data.branch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Branch not found'}</p>
          <Link href="/configurations/rental-company">
            <Button variant="outline">Back to Branches</Button>
          </Link>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/configurations/rental-company">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
                <p className="text-sm text-muted-foreground">Branch Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CustomButton
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </CustomButton>
              <CustomButton
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <MoreHorizontal className="w-4 h-4" />
                More Actions
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Branch Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branch Details
              </CardTitle>
              <CardDescription>Complete information about this branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-semibold">{branch.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-base">{branch.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-base">{branch.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City/Region</label>
                    <p className="text-base">{branch.city_region || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-base">{branch.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Commercial registration number</label>
                      <p className="text-base">{branch.commercial_registration_number || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Branch license number</label>
                      <p className="text-base">{branch.branch_license_number || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="text-base">
                        {branch.website ? (
                          <a
                            href={branch.website.startsWith('http') ? branch.website : `https://${branch.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {branch.website}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant={branch.is_active ? "default" : "secondary"}>
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Branch Code: {branch.code}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branch Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Roles</CardTitle>
              <CardDescription>Define the roles and capabilities of this branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branchRoles.map((role) => (
                  <div key={role.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={role.key}
                      checked={role.checked}
                      disabled
                    />
                    <label
                      htmlFor={role.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
