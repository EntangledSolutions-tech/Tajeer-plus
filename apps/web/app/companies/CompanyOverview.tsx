'use client';

import React from 'react';
import { CollapsibleSection } from '../reusableComponents/CollapsibleSection';

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
  license_type?: string | { license_type: string };
  license_expiry_date?: string;
  establishment_date?: string;
  authorized_person_name?: string;
  authorized_person_id?: string;
  authorized_person_email?: string;
  authorized_person_mobile?: string;
  rental_type?: string;
}

interface CompanyOverviewProps {
  company: Company | null;
}

export default function CompanyOverview({ company }: CompanyOverviewProps) {
  // Helper function to render field
  const renderField = (label: string, value: any) => {
    if (!value) return null;
    return (
      <div className="min-w-0">
        <div className="text-sm text-primary font-medium">{label}</div>
        <div className="font-bold text-primary text-base break-words overflow-hidden">{value}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-none">
          {/* Company Details */}
          <CollapsibleSection
            title="Company Details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-5 gap-y-4 gap-x-6 text-base overflow-hidden">
              {/* Basic Information */}
              {renderField('Company Name', company?.company_name)}
              {renderField('Tax Number', company?.tax_number)}
              {renderField('CR Number', company?.commercial_registration_number)}
              {renderField('Mobile Number', company?.mobile_number)}
              {renderField('Email', company?.email)}
              {renderField('Country', company?.country)}
              {renderField('City', company?.city)}
              {renderField('Address', company?.address)}
              {renderField('License Number', company?.license_number)}
              {renderField('License Type',
                typeof company?.license_type === 'object'
                  ? company.license_type?.license_type
                  : company?.license_type
              )}
              {renderField('License Expiry Date',
                company?.license_expiry_date
                  ? new Date(company.license_expiry_date).toLocaleDateString()
                  : null
              )}
              {renderField('Establishment Date',
                company?.establishment_date
                  ? new Date(company.establishment_date).toLocaleDateString()
                  : null
              )}
              {renderField('Rental Type', company?.rental_type)}
            </div>
          </CollapsibleSection>

          {/* Legal Representative Information */}
          <CollapsibleSection
            title="Legal Representative Information"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-5 gap-y-4 gap-x-6 text-base overflow-hidden">
              {renderField('Name', company?.authorized_person_name)}
              {renderField('ID Number', company?.authorized_person_id)}
              {renderField('Email', company?.authorized_person_email)}
              {renderField('Mobile', company?.authorized_person_mobile)}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

