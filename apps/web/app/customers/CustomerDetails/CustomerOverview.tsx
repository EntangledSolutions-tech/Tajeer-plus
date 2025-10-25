'use client';
import React, { useState } from 'react';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';

interface Customer {
  id: string;
  name?: string | null;
  id_type: string;
  id_number: string;
  mobile_number?: string;
  email?: string;
  classification?: string | { classification: string };
  license_type?: string | { license_type: string };
  nationality?: string | { nationality: string };
  date_of_birth?: string;
  address?: string;
  status?: string | { name: string; color?: string };

  // National ID specific fields
  national_id_number?: string;
  national_id_issue_date?: string;
  national_id_expiry_date?: string;
  place_of_birth?: string;
  father_name?: string;
  mother_name?: string;

  // GCC Countries Citizens specific fields
  id_copy_number?: string;
  license_expiration_date?: string;
  place_of_id_issue?: string;

  // Visitor specific fields
  border_number?: string;
  passport_number?: string;
  license_number?: string;
  id_expiry_date?: string;
  license_expiry_date?: string;
  country?: string;
}

interface CustomerOverviewProps {
  customer: Customer | null;
}

export default function CustomerOverview({ customer }: CustomerOverviewProps) {
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

  // Helper to get display name
  const getDisplayName = () => {
    return customer?.name || 'Anonymous';
  };

  // Render fields based on ID type
  const renderIdTypeSpecificFields = () => {
    const idType = customer?.id_type;

    if (idType === 'National ID') {
      return (
        <>
          {renderField('National ID Number', customer?.national_id_number)}
          {renderField('National ID Issue Date', customer?.national_id_issue_date ? new Date(customer.national_id_issue_date).toLocaleDateString() : null)}
          {renderField('National ID Expiry Date', customer?.national_id_expiry_date ? new Date(customer.national_id_expiry_date).toLocaleDateString() : null)}
          {renderField('Place of Birth', customer?.place_of_birth)}
          {renderField('Father Name', customer?.father_name)}
          {renderField('Mother Name', customer?.mother_name)}
        </>
      );
    } else if (idType === 'GCC Countries Citizens') {
      return (
        <>
          {renderField('ID Copy Number', customer?.id_copy_number)}
          {renderField('License Expiration Date', customer?.license_expiration_date ? new Date(customer.license_expiration_date).toLocaleDateString() : null)}
          {renderField('Place of ID Issue', customer?.place_of_id_issue)}
        </>
      );
    } else if (idType === 'Visitor') {
      return (
        <>
          {renderField('Border Number', customer?.border_number)}
          {renderField('Passport Number', customer?.passport_number)}
          {renderField('License Number', customer?.license_number)}
          {renderField('ID Copy Number', customer?.id_copy_number)}
          {renderField('ID Expiry Date', customer?.id_expiry_date ? new Date(customer.id_expiry_date).toLocaleDateString() : null)}
          {renderField('License Expiry Date', customer?.license_expiry_date ? new Date(customer.license_expiry_date).toLocaleDateString() : null)}
          {renderField('Place of ID Issue', customer?.place_of_id_issue)}
          {renderField('Country', customer?.country)}
          {renderField('Address', customer?.address)}
        </>
      );
    }
    // Resident ID - no additional fields
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-none">
          {/* Customer Details */}
          <CollapsibleSection
            title="Customer details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-5 gap-y-4 gap-x-6 text-base overflow-hidden">
              {/* Common Fields */}
              {renderField('Customer Name', getDisplayName())}
              {renderField('ID Type', customer?.id_type)}
              {renderField('ID Number', customer?.id_number)}
              {renderField('Mobile Number', customer?.mobile_number)}
              {renderField('Email', customer?.email)}

              {/* Conditional fields based on ID type */}
              {customer?.id_type !== 'Visitor' && renderField('Nationality',
                typeof customer?.nationality === 'object' ? customer.nationality?.nationality : customer?.nationality
              )}
              {customer?.id_type !== 'Visitor' && renderField('Classification',
                typeof customer?.classification === 'object' ? customer.classification?.classification : customer?.classification
              )}
              {customer?.id_type !== 'Visitor' && customer?.date_of_birth && renderField('Date of Birth', new Date(customer.date_of_birth).toLocaleDateString())}

              {/* ID Type Specific Fields */}
              {renderIdTypeSpecificFields()}

              {/* License Type - for all types except National ID */}
              {customer?.id_type !== 'National ID' && renderField('License Type',
                typeof customer?.license_type === 'object' ? customer.license_type?.license_type : customer?.license_type
              )}
            </div>
          </CollapsibleSection>

          {/* Membership */}
          <CollapsibleSection
            title="Membership"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="flex flex-col gap-4">
              {/* Membership Details */}
              <div>
                <div className="font-bold text-primary text-base mb-2">Membership Information</div>
                <div className="grid grid-cols-4 gap-4 text-base">
                  <div>
                    <span className="text-sm text-primary font-medium">Points</span><br />
                    <span className="text-lg text-primary font-bold">12,897 pts (SAR 140)</span>
                  </div>
                  <div>
                    <span className="text-sm text-primary font-medium">Membership ID</span><br />
                    <span className="text-lg text-primary font-bold">934827850522</span>
                  </div>
                  <div>
                    <span className="text-sm text-primary font-medium">Tier</span><br />
                    <span className="text-lg text-primary font-bold">Gold</span>
                  </div>
                  <div>
                    <span className="text-sm text-primary font-medium">Valid until</span><br />
                    <span className="text-lg text-primary font-bold">12/10/2027</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-primary my-2" />
              {/* Benefits */}
              <div>
                <div className="font-bold text-primary text-base mb-2">Benefits</div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-900 text-sm">
                        Lorem ipsum dolor sit amet consectetur. Risus scelerisque eget ullamcorper amet viverra nunc massa quam.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}