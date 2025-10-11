'use client';
import React, { useState } from 'react';
import CustomButton from '../../../reusableComponents/CustomButton';
import { CollapsibleSection } from '../../../reusableComponents/CollapsibleSection';
import CustomModal from '../../../reusableComponents/CustomModal';
import { SimpleSelect } from '../../../reusableComponents/CustomSelect';
import { SimpleTextarea } from '../../../reusableComponents/CustomTextarea';

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

  // Hold information
  hold_reason?: string;
  hold_comments?: string;
  hold_date?: string;

  // Customer data from join
  customer?: Customer | null;
}

interface ContractOverviewProps {
  contract: Contract | null;
}

export default function ContractOverview({ contract }: ContractOverviewProps) {
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [holdComments, setHoldComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const holdReasons = [
    { value: 'financial_claims', label: 'Presence of financial claims' },
    { value: 'documentation_issues', label: 'Documentation issues' },
    { value: 'vehicle_maintenance', label: 'Vehicle maintenance required' },
    { value: 'customer_request', label: 'Customer request' },
    { value: 'legal_issues', label: 'Legal issues' },
    { value: 'payment_delays', label: 'Payment delays' },
    { value: 'other', label: 'Other' }
  ];

  const handleHoldContract = async () => {
    if (!holdReason) {
      alert('Please select a reason for hold');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract?.id}/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hold_reason: holdReason,
          hold_comments: holdComments,
          status_id: '7' // On Hold status code
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated contract status
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to hold contract'}`);
      }
    } catch (error) {
      console.error('Error holding contract:', error);
      alert('Failed to hold contract. Please try again.');
    } finally {
      setIsLoading(false);
      setIsHoldModalOpen(false);
      setHoldReason('');
      setHoldComments('');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hold Contract Modal */}
      <CustomModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        title="Hold Contract"
        subtitle="Apply a hold to this contract"
        maxWidth="max-w-lg"
      >
        <div className="p-6 space-y-6">
          {/* Hold Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Hold Information</h3>

            <SimpleSelect
              label="Reason for Hold"
              required
              options={holdReasons}
              value={holdReason}
              onChange={setHoldReason}
              placeholder="Select a reason for hold"
            />

            <SimpleTextarea
              label="Additional Comments"
              value={holdComments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHoldComments(e.target.value)}
              placeholder="Enter any additional details about the hold..."
              rows={4}
            />
          </div>

          {/* Contract Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Contract Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Contract ID:</span>
                  <div className="font-semibold text-primary">#{contract?.contract_number || contract?.id}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Customer:</span>
                  <div className="font-semibold text-primary">{contract?.customer?.name || contract?.customer_name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Vehicle:</span>
                  <div className="font-semibold text-primary">
                    {contract?.vehicle_plate ? `${contract.vehicle_plate} - ${contract.vehicle_serial_number}` : '-'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Status:</span>
                  <div className="font-semibold text-primary">{contract?.status?.name || 'Active'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Monthly Rate:</span>
                  <div className="font-semibold text-primary">
                    SAR {contract?.daily_rental_rate?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <CustomButton
              variant="outline"
              onClick={() => setIsHoldModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleHoldContract}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Hold'}
            </CustomButton>
          </div>
        </div>
      </CustomModal>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-none">
          {/* Hold Reason Section - Show only if contract is on hold */}
          {contract?.status?.name === 'On Hold' && contract?.hold_reason && (
            <CollapsibleSection
              title="Hold Reason"
              defaultOpen={true}
              className="mb-6 mx-0"
              headerClassName="bg-red-50"
            >
              <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Hold Reason</div>
                  <div className="font-bold text-primary text-base">
                    {holdReasons.find(r => r.value === contract.hold_reason)?.label || contract.hold_reason}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Hold Date</div>
                  <div className="font-bold text-primary text-base">
                    {contract.hold_date ? new Date(contract.hold_date).toLocaleDateString('en-GB') : '-'}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-primary font-medium">Additional Comments</div>
                  <div className="font-bold text-primary text-base">
                    {contract.hold_comments || 'No additional comments'}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Contract Details */}
          <CollapsibleSection
            title="Contract details"
            defaultOpen={true}
            className="mb-6 mx-0"
            headerClassName="bg-[#F6F9FF]"
            headerButton={
              <div className="flex gap-2">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHoldModalOpen(true)}
                  disabled={contract?.status?.name === 'On Hold'}
                >
                  Hold Contract
                </CustomButton>
                <CustomButton variant="primary" size="sm">
                  Extend Contract
                </CustomButton>
              </div>
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
                <div className="text-sm text-primary font-medium">Contract Number</div>
                <div className="font-bold text-primary text-base">{contract?.contract_number || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Payment Method</div>
                <div className="font-bold text-primary text-base">
                  {contract?.payment_method ? contract.payment_method.charAt(0).toUpperCase() + contract.payment_method.slice(1) : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Membership Enabled</div>
                <div className="font-bold text-primary text-base">{contract?.membership_enabled ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Hourly Delay Rate</div>
                <div className="font-bold text-primary text-base">
                  SAR {contract?.hourly_delay_rate?.toLocaleString() || '0'}
                </div>
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
                <div className="text-sm text-primary font-medium">Current KM</div>
                <div className="font-bold text-primary text-base">{contract?.current_km || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Permitted Daily KM</div>
                <div className="font-bold text-primary text-base">{contract?.permitted_daily_km || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Excess KM Rate</div>
                <div className="font-bold text-primary text-base">
                  SAR {contract?.excess_km_rate?.toLocaleString() || '0'}
                </div>
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
                <div className="text-sm text-primary font-medium">Inspector ID</div>
                <div className="font-bold text-primary text-base">{contract?.selected_inspector || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Inspector Name</div>
                <div className="font-bold text-primary text-base">{contract?.inspector_name || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Contract Start Date</div>
                <div className="font-bold text-primary text-base">
                  {contract?.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Contract End Date</div>
                <div className="font-bold text-primary text-base">
                  {contract?.end_date ? new Date(contract.end_date).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Total Amount</div>
                <div className="font-bold text-primary text-base">
                  SAR {contract?.total_amount?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}