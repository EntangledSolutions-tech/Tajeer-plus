import React from 'react';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';

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

interface CompanyOverviewProps {
  company: Company | null;
}

export default function CompanyOverview({ company }: CompanyOverviewProps) {
  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No company data available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <CollapsibleSection title="Company Information" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <p className="text-gray-900">{company.company_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
              <p className="text-gray-900">{company.tax_number || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Registration Number</label>
              <p className="text-gray-900">{company.commercial_registration_number || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <p className="text-gray-900">{company.mobile_number || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{company.email || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <p className="text-gray-900">{company.country || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <p className="text-gray-900">{company.city || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="text-gray-900">{company.address || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Type</label>
              <p className="text-gray-900">{company.rental_type || '-'}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* License Information */}
      <CollapsibleSection title="License Information" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <p className="text-gray-900">{company.license_number || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
              <p className="text-gray-900">{company.license_type || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
              <p className="text-gray-900">{formatDate(company.license_expiry_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Establishment Date</label>
              <p className="text-gray-900">{formatDate(company.establishment_date)}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Legal Representative Information */}
      <CollapsibleSection title="Legal Representative Information" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Representative Name</label>
              <p className="text-gray-900">{company.authorized_person_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Representative ID Number</label>
              <p className="text-gray-900">{company.authorized_person_id || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Representative Email</label>
              <p className="text-gray-900">{company.authorized_person_email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Representative Mobile Number</label>
              <p className="text-gray-900">{company.authorized_person_mobile || '-'}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* System Information */}
      <CollapsibleSection title="System Information" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
              <p className="text-gray-900 font-mono text-sm">{company.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch ID</label>
              <p className="text-gray-900 font-mono text-sm">{company.branch_id || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">{formatDate(company.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-gray-900">{formatDate(company.updated_at)}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
