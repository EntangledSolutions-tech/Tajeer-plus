'use client';
import React from 'react';
import CustomButton from '../../../reusableComponents/CustomButton';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';

interface Customer {
  id: string;
  name: string;
  id_type: string;
  id_number: string;
  classification: string;
  license_type: string;
  date_of_birth: string;
  address: string;
  mobile_number: string;
  nationality: string;
  status: string;
  membership_id?: string;
  membership_tier?: string;
  membership_points?: number;
  membership_valid_until?: string;
}

interface Contract {
  id: string;
  contract_number?: string;
  tajeer_number?: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status_id?: string;
  status?: { name: string; color?: string };
  total_amount: number;
  created_at: string;

  // Additional contract fields from database
  type?: string;
  insurance_type?: string;
  daily_rental_rate?: number;
  hourly_delay_rate?: number;
  current_km?: string;
  rental_days?: number;
  permitted_daily_km?: number;
  excess_km_rate?: number;
  payment_method?: string;
  membership_enabled?: boolean;
  selected_vehicle_id?: string;
  vehicle_plate?: string;
  vehicle_serial_number?: string;
  selected_inspector?: string;
  inspector_name?: string;
  documents_count?: number;
  documents?: any[];

  // Customer data from join
  customer?: Customer | null;
}

interface ContractOverviewProps {
  contract: Contract | null;
}

export default function ContractOverview({ contract }: ContractOverviewProps) {
  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-none">
          {/* Contract Details */}
          <CollapsibleSection
            title="Contract details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
            headerButton={
              <CustomButton variant="primary" size="sm">
                Extend Contract
              </CustomButton>
            }
          >
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Total Amount</div>
                <div className="font-bold text-primary text-base">
                  SAR {contract?.total_amount?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Start Date</div>
                <div className="font-bold text-primary text-base">
                  {contract?.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">End Date</div>
                <div className="font-bold text-primary text-base">
                  {contract?.end_date ? new Date(contract.end_date).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Created on</div>
                <div className="font-bold text-primary text-base">
                  {contract?.created_at ? new Date(contract.created_at).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Contract Type</div>
                <div className="font-bold text-primary text-base">{contract?.type || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Tajeer Number</div>
                <div className="font-bold text-primary text-base">{contract?.tajeer_number || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Payment Method</div>
                <div className="font-bold text-primary text-base">
                  {contract?.payment_method ? contract.payment_method.charAt(0).toUpperCase() + contract.payment_method.slice(1) : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Insurance Type</div>
                <div className="font-bold text-primary text-base">{contract?.insurance_type || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Daily Rate</div>
                <div className="font-bold text-primary text-base">
                  SAR {contract?.daily_rental_rate?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Rental Days</div>
                <div className="font-bold text-primary text-base">{contract?.rental_days || '0'}</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Customer Details */}
          <CollapsibleSection
            title="Customer details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Customer Name</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.name || contract?.customer_name || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Nationality</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.nationality || 'Saudi'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">ID Type</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.id_type || 'National ID'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">ID Number</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.id_number || '1234567890'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Classification</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.classification || 'Individual'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Mobile Number</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.mobile_number || '+966501234567'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Date of Birth</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.date_of_birth ?
                    new Date(contract.customer.date_of_birth).toLocaleDateString('en-GB') :
                    '01/01/1990'
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">License Type</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.license_type || 'Private'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Address</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.address || 'Riyadh, Saudi Arabia'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Membership Tier</div>
                <div className="font-bold text-primary text-base">
                  {contract?.customer?.membership_tier || 'Gold'}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Vehicle Details */}
          <CollapsibleSection
            title="Vehicle details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
            headerButton={
              <CustomButton variant="primary" size="sm">
                Update Vehicle
              </CustomButton>
            }
          >
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Serial Number</div>
                <div className="font-bold text-primary text-base">{contract?.vehicle_serial_number || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Plate</div>
                <div className="font-bold text-primary text-base">{contract?.vehicle_plate || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Plate registration type</div>
                <div className="font-bold text-primary text-base">Private</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Year</div>
                <div className="font-bold text-primary text-base">2022</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Model</div>
                <div className="font-bold text-primary text-base">Accent</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Make</div>
                <div className="font-bold text-primary text-base">Hyundai</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Color</div>
                <div className="font-bold text-primary text-base">Black</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Age Range</div>
                <div className="font-bold text-primary text-base">1-3 years</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Year of Manufacture</div>
                <div className="font-bold text-primary text-base">2022</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Mileage (in km)</div>
                <div className="font-bold text-primary text-base">28,914</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Oil Expiry (km)</div>
                <div className="font-bold text-primary text-base">5,901</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Inspection Details */}
          <CollapsibleSection
            title="Inspection details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
              <div>
                <div className="text-sm text-primary font-medium">Inspection ID</div>
                <div className="font-bold text-primary text-base">INSP-1234</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Inspector</div>
                <div className="font-bold text-primary text-base">Omar Al-Farsi</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Date</div>
                <div className="font-bold text-primary text-base">03/14/2022</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Type</div>
                <div className="font-bold text-primary text-base">Check-in</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Total Amount</div>
                <div className="font-bold text-primary text-base">SAR 450.00</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Linked Invoice</div>
                <div className="font-bold text-primary text-base">INV-3782</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Report</div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-primary text-base">Report #2785</span>
                  <button className="text-primary hover:underline text-sm">View</button>
                  <button className="text-primary hover:underline text-sm">Download</button>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}