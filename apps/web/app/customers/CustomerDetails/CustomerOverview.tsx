'use client';
import React, { useState } from 'react';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';

interface Customer {
  id: string;
  id_type: string;
  id_number: string;
  mobile_number?: string;
  email?: string;
  classification?: string | { classification: string };
  license_type?: string | { license_type: string };
  nationality?: string | { nationality: string };
  status?: string | { name: string; color?: string };

  // National ID and Resident ID shared fields
  national_id_number?: string;
  resident_id_number?: string;
  date_of_birth?: string;
  address?: string;

  // GCC Countries Citizens specific fields
  gcc_id_number?: string;
  rental_type?: string;

  // Shared fields (GCC and Visitor)
  country?: string;
  id_copy_number?: string;
  license_number?: string;
  id_expiry_date?: string;
  license_expiry_date?: string;
  place_of_id_issue?: string;

  // Visitor specific fields
  border_number?: string;
  passport_number?: string;
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


  // Render fields based on ID type
  const renderIdTypeSpecificFields = () => {
    const idType = customer?.id_type;

    if (idType === 'National ID') {
      return (
        <>
          {renderField('National ID Number', customer?.national_id_number)}
          {renderField('Date of Birth', customer?.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : null)}
          {renderField('Address', customer?.address)}
          {renderField('Rental Type', customer?.rental_type)}
        </>
      );
    } else if (idType === 'Resident ID') {
      return (
        <>
          {renderField('Resident ID Number', customer?.resident_id_number)}
          {renderField('Date of Birth', customer?.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : null)}
          {renderField('Address', customer?.address)}
          {renderField('Rental Type', customer?.rental_type)}
        </>
      );
    } else if (idType === 'GCC Countries Citizens') {
      return (
        <>
          {renderField('National/GCC ID Number', customer?.gcc_id_number)}
          {renderField('Country', customer?.country)}
          {renderField('ID Copy Number', customer?.id_copy_number)}
          {renderField('License Number', customer?.license_number)}
          {renderField('ID Expiry Date', customer?.id_expiry_date ? new Date(customer.id_expiry_date).toLocaleDateString() : null)}
          {renderField('License Expiry Date', customer?.license_expiry_date ? new Date(customer.license_expiry_date).toLocaleDateString() : null)}
          {renderField('License Type',
            typeof customer?.license_type === 'object' ? customer.license_type?.license_type : customer?.license_type
          )}
          {renderField('Place of ID Issue', customer?.place_of_id_issue)}
          {renderField('Address', customer?.address)}
          {renderField('Rental Type', customer?.rental_type)}
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
              {renderField('ID Type', customer?.id_type)}
              {/* Only show general ID Number for GCC and Visitor types */}
              {(customer?.id_type === 'GCC Countries Citizens' || customer?.id_type === 'Visitor') &&
                renderField('ID Number', customer?.id_number)}
              {renderField('Mobile Number', customer?.mobile_number)}
              {renderField('Email', customer?.email)}

              {/* ID Type Specific Fields */}
              {renderIdTypeSpecificFields()}
            </div>
          </CollapsibleSection>

          {/* Membership */}
          {/* <CollapsibleSection
            title="Membership"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="flex flex-col gap-4">
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
          </CollapsibleSection> */}
        </div>
      </div>
    </div>
  );
}