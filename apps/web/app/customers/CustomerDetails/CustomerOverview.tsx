'use client';
import React, { useState } from 'react';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';

interface Customer {
  id: string;
  name: string;
  id_type: string;
  id_number: string;
  mobile_number?: string;
  classification?: string | { classification: string };
  license_type?: string | { license_type: string };
  nationality?: string | { nationality: string };
  date_of_birth: string;
  address: string;
  status?: string | { name: string; color?: string };
}

interface CustomerOverviewProps {
  customer: Customer | null;
}

export default function CustomerOverview({ customer }: CustomerOverviewProps) {

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
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Code</div>
                <div className="font-bold text-primary text-base">83</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Classification</div>
                <div className="font-bold text-primary text-base">
                  {typeof customer?.classification === 'object' ? customer.classification?.classification : customer?.classification || 'Individual'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Customer Name</div>
                <div className="font-bold text-primary text-base">{customer?.name || 'Liam Johnson'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Mobile Number</div>
                <div className="font-bold text-primary text-base">{customer?.mobile_number || '+966 50 123 4567'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Nationality</div>
                <div className="font-bold text-primary text-base">
                  {typeof customer?.nationality === 'object' ? customer.nationality?.nationality : customer?.nationality || 'Saudi'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Date of Birth</div>
                <div className="font-bold text-primary text-base">10/07/1988</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">ID Type</div>
                <div className="font-bold text-primary text-base">{customer?.id_type || 'National ID'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">ID Number</div>
                <div className="font-bold text-primary text-base">{customer?.id_number || '4823917460'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">License type</div>
                <div className="font-bold text-primary text-base">
                  {typeof customer?.license_type === 'object' ? customer.license_type?.license_type : customer?.license_type || 'Heavy Transport'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Address</div>
                <div className="font-bold text-primary text-base">{customer?.address || 'Buraydah-Al Dhahi'}</div>
              </div>
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