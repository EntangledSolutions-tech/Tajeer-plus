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

interface Vehicle {
  id: string;
  serial_number: string;
  plate_number: string;
  plate_registration_type: string;
  make_year: string;
  mileage: number;
  make: string;
  model: string;
  color: string;
  status: string;
  daily_rental_rate?: number;
  daily_hourly_delay_rate?: number;
  daily_permitted_km?: number;
  daily_excess_km_rate?: number;
}

interface Contract {
  id: string;
  contract_number?: string;
  tajeer_number?: string;
  customer_name?: string;
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
  selected_inspector?: string;
  inspector_name?: string;

  // Hold information
  hold_reason?: string;
  hold_comments?: string;
  hold_date?: string;

  // Close information
  close_reason?: string;
  close_comments?: string;
  close_date?: string;

  // Cancel information
  cancel_reason?: string;
  cancel_comments?: string;
  cancel_date?: string;

  // Joined data from database
  customer?: Customer | null;
  vehicle?: Vehicle | null;

  // Backward compatibility fields (deprecated)
  vehicle_plate?: string;
  vehicle_serial_number?: string;
}

interface ContractOverviewProps {
  contract: Contract | null;
}

export default function ContractOverview({ contract }: ContractOverviewProps) {
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);

  // Get status colors for buttons - use actual backend colors
  const getStatusColor = (statusName: string) => {
    // Try to get color from contract status first, then fallback to defaults
    if (contract?.status?.name === statusName && contract?.status?.color) {
      return contract.status.color;
    }

    const statusColors: { [key: string]: string } = {
      'On Hold': '#F59E0B',
      'Closed': '#10B981',
      'Cancelled': '#EF4444',
      'Active': '#10B981',
      'Draft': '#6B7280',
      'Completed': '#3B82F6'
    };
    return statusColors[statusName] || '#6B7280';
  };
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [holdComments, setHoldComments] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [closeComments, setCloseComments] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComments, setCancelComments] = useState('');
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

  const closeReasons = [
    { value: 'contract_completed', label: 'Contract completed successfully' },
    { value: 'customer_request', label: 'Customer request' },
    { value: 'vehicle_returned', label: 'Vehicle returned' },
    { value: 'early_termination', label: 'Early termination' },
    { value: 'mutual_agreement', label: 'Mutual agreement' },
    { value: 'other', label: 'Other' }
  ];

  const cancelReasons = [
    { value: 'customer_request', label: 'Customer cancellation request' },
    { value: 'payment_failure', label: 'Payment failure or non-payment' },
    { value: 'breach_of_contract', label: 'Breach of contract terms' },
    { value: 'vehicle_unavailable', label: 'Vehicle no longer available' },
    { value: 'customer_no_show', label: 'Customer did not show up' },
    { value: 'fraud_suspected', label: 'Fraud or suspicious activity' },
    { value: 'duplicate_booking', label: 'Duplicate booking' },
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

  const handleCloseContract = async () => {
    if (!closeReason) {
      alert('Please select a reason for closing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract?.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          close_reason: closeReason,
          close_comments: closeComments
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated contract status
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to close contract'}`);
      }
    } catch (error) {
      console.error('Error closing contract:', error);
      alert('Failed to close contract. Please try again.');
    } finally {
      setIsLoading(false);
      setIsCloseModalOpen(false);
      setCloseReason('');
      setCloseComments('');
    }
  };

  const handleCancelContract = async () => {
    if (!cancelReason) {
      alert('Please select a reason for cancellation');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract?.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_reason: cancelReason,
          cancel_comments: cancelComments
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated contract status
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to cancel contract'}`);
      }
    } catch (error) {
      console.error('Error cancelling contract:', error);
      alert('Failed to cancel contract. Please try again.');
    } finally {
      setIsLoading(false);
      setIsCancelModalOpen(false);
      setCancelReason('');
      setCancelComments('');
    }
  };

  const handlePrintContract = async () => {
    console.log('Print contract clicked, starting PDF generation...');
    try {
      setIsLoading(true);

      // Dynamically import jsPDF and html2canvas to avoid SSR issues
      console.log('Loading PDF libraries...');
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      console.log('PDF libraries loaded successfully');

      // Use primary color from theme
      const primaryColor = '#005F8E';

      // Helper function to create header for each page
      const createHeader = () => {
        const header = document.createElement('div');
        header.style.cssText = `
          margin-bottom: 15px;
          border-bottom: 2px solid ${primaryColor};
          padding-bottom: 8px;
          background-color: #ffffff;
          color: #000000;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `;

        // Left side - Logo
        const logoContainer = document.createElement('div');
        logoContainer.style.cssText = `
          flex: 0 0 auto;
          background-color: #ffffff;
        `;
        const logoImg = document.createElement('img');
        logoImg.src = '/images/Logo/logo-color.png';
        logoImg.style.cssText = `
          height: 40px;
          width: auto;
          display: block;
        `;
        logoContainer.appendChild(logoImg);

        // Center - Contract details
        const centerContainer = document.createElement('div');
        centerContainer.style.cssText = `
          flex: 1;
          text-align: center;
          background-color: #ffffff;
          color: #000000;
          padding: 0 20px;
        `;
        centerContainer.innerHTML = `
          <h1 style="color: ${primaryColor}; font-size: 22px; margin: 0 0 3px 0; font-weight: bold; font-family: Arial, sans-serif; background-color: transparent;">Contract Details</h1>
          <p style="color: #666666; font-size: 14px; margin: 0; font-family: Arial, sans-serif; background-color: transparent;">
            ${contract?.contract_number || contract?.tajeer_number || `Contract #${contract?.id?.slice(0, 8)}` || 'Contract'}
          </p>
        `;

        // Right side - Date/Time
        const dateContainer = document.createElement('div');
        dateContainer.style.cssText = `
          flex: 0 0 auto;
          text-align: right;
          background-color: #ffffff;
          color: #000000;
        `;
        const currentDate = new Date();
        dateContainer.innerHTML = `
          <div style="color: #666666; font-size: 11px; font-family: Arial, sans-serif; background-color: transparent; line-height: 1.3;">
            <div style="font-weight: 600; color: ${primaryColor}; margin-bottom: 2px;">Generated On</div>
            <div>${currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div>${currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `;

        header.appendChild(logoContainer);
        header.appendChild(centerContainer);
        header.appendChild(dateContainer);
        return header;
      };

      // Helper function to create section for individual pages

      // Helper function to create section for individual pages
      const createSection = (title: string, data: { label: string; value: string; color?: string }[]) => {
        const section = document.createElement('div');
        section.style.cssText = `
          margin-bottom: 10px;
          background-color: #ffffff;
          color: #000000;
          height: auto;
          display: block;
        `;

        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = title;
        sectionTitle.style.cssText = `
          color: ${primaryColor};
          font-size: 18px;
          margin-bottom: 8px;
          font-weight: bold;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 4px;
          font-family: Arial, sans-serif;
          background-color: transparent;
        `;
        section.appendChild(sectionTitle);

        const grid = document.createElement('div');
        grid.style.cssText = `
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          font-size: 13px;
          background-color: #ffffff;
          color: #000000;
          padding: 5px 0;
        `;

        data.forEach(item => {
          const field = document.createElement('div');
          field.style.cssText = `
            background-color: #ffffff;
            color: #000000;
            margin-bottom: 8px;
            padding: 4px 0;
          `;
          const valueColor = item.color || primaryColor;
          field.innerHTML = `
            <div style="color: #6B7280; font-weight: 500; margin-bottom: 2px; font-family: Arial, sans-serif; background-color: transparent;">${item.label}</div>
            <div style="color: ${valueColor}; font-weight: bold; font-family: Arial, sans-serif; background-color: transparent;">${item.value}</div>
          `;
          grid.appendChild(field);
        });

        section.appendChild(grid);
        return section;
      };

      // Create PDF content container
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 794px;
        background-color: #ffffff;
        padding: 40px;
        font-family: Arial, sans-serif;
        color: #000000;
        box-sizing: border-box;
      `;
      document.body.appendChild(pdfContent);

      // Add header
      pdfContent.appendChild(createHeader());

      // Contract Details
      const contractData = [
        { label: 'Contract Number', value: contract?.contract_number || '-' },
        {
          label: 'Status',
          value: contract?.status?.name || 'Draft',
          color: contract?.status?.color || '#6B7280'
        },
        { label: 'Total Amount', value: `SAR ${contract?.total_amount?.toLocaleString() || '0'}` },
        { label: 'Start Date', value: contract?.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : '-' },
        { label: 'End Date', value: contract?.end_date ? new Date(contract.end_date).toLocaleDateString('en-GB') : '-' },
        { label: 'Created On', value: contract?.created_at ? new Date(contract.created_at).toLocaleDateString('en-GB') : '-' },
        { label: 'Payment Method', value: contract?.payment_method ? contract.payment_method.charAt(0).toUpperCase() + contract.payment_method.slice(1) : '-' },
        { label: 'Membership Enabled', value: contract?.membership_enabled ? 'Yes' : 'No' },
        { label: 'Hourly Delay Rate', value: `SAR ${contract?.hourly_delay_rate?.toLocaleString() || '0'}` },
        { label: 'Daily Rate', value: `SAR ${contract?.daily_rental_rate?.toLocaleString() || '0'}` },
        { label: 'Rental Days', value: contract?.rental_days?.toString() || '0' },
      ];
      pdfContent.appendChild(createSection('Contract Details', contractData));

      // Customer Details
      const customerData = [
        { label: 'Customer Name', value: contract?.customer?.name || contract?.customer_name || '-' },
        { label: 'Nationality', value: contract?.customer?.nationality || 'Saudi' },
        { label: 'ID Type', value: contract?.customer?.id_type || 'National ID' },
        { label: 'ID Number', value: contract?.customer?.id_number || '-' },
        { label: 'Classification', value: contract?.customer?.classification || 'Individual' },
        { label: 'Mobile Number', value: contract?.customer?.mobile_number || '-' },
        { label: 'Date of Birth', value: contract?.customer?.date_of_birth ? new Date(contract.customer.date_of_birth).toLocaleDateString('en-GB') : '-' },
        { label: 'License Type', value: contract?.customer?.license_type || 'Private' },
        { label: 'Address', value: contract?.customer?.address || '-' },
        { label: 'Membership Tier', value: contract?.customer?.membership_tier || '-' },
      ];
      pdfContent.appendChild(createSection('Customer Details', customerData));

      // Vehicle Details
      const vehicleData = [
        { label: 'Serial Number', value: contract?.vehicle?.serial_number || contract?.vehicle_serial_number || '-' },
        { label: 'Plate', value: contract?.vehicle?.plate_number || contract?.vehicle_plate || '-' },
        { label: 'Make', value: contract?.vehicle?.make || '-' },
        { label: 'Model', value: contract?.vehicle?.model || '-' },
        { label: 'Year', value: contract?.vehicle?.make_year || '-' },
        { label: 'Color', value: contract?.vehicle?.color || '-' },
        { label: 'Current KM', value: contract?.current_km || '-' },
        { label: 'Permitted Daily KM', value: contract?.permitted_daily_km?.toString() || '-' },
        { label: 'Excess KM Rate', value: `SAR ${contract?.excess_km_rate?.toLocaleString() || '0'}` },
      ];
      pdfContent.appendChild(createSection('Vehicle Details', vehicleData));

      // Inspection Details
      const inspectionData = [
        { label: 'Inspector ID', value: contract?.selected_inspector || '-' },
        { label: 'Inspector Name', value: contract?.inspector_name || '-' },
        { label: 'Contract Start Date', value: contract?.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : '-' },
        { label: 'Contract End Date', value: contract?.end_date ? new Date(contract.end_date).toLocaleDateString('en-GB') : '-' },
        { label: 'Total Amount', value: `SAR ${contract?.total_amount?.toLocaleString() || '0'}` },
      ];
      pdfContent.appendChild(createSection('Inspection Details', inspectionData));

      // Add Hold/Close information if applicable
      if (contract?.status?.name === 'On Hold' && contract?.hold_reason) {
        const holdData = [
          { label: 'Hold Reason', value: holdReasons.find(r => r.value === contract.hold_reason)?.label || contract.hold_reason },
          { label: 'Hold Date', value: contract.hold_date ? new Date(contract.hold_date).toLocaleDateString('en-GB') : '-' },
          { label: 'Additional Comments', value: contract.hold_comments || 'No additional comments' },
        ];
        pdfContent.appendChild(createSection('Hold Information', holdData));
      }

      if (contract?.status?.name === 'Closed' && contract?.close_reason) {
        const closeData = [
          { label: 'Close Reason', value: closeReasons.find(r => r.value === contract.close_reason)?.label || contract.close_reason },
          { label: 'Close Date', value: contract.close_date ? new Date(contract.close_date).toLocaleDateString('en-GB') : '-' },
          { label: 'Additional Comments', value: contract.close_comments || 'No additional comments' },
        ];
        pdfContent.appendChild(createSection('Closed Details', closeData));
      }

      if (contract?.status?.name === 'Cancelled' && contract?.cancel_reason) {
        const cancelData = [
          { label: 'Cancellation Reason', value: cancelReasons.find(r => r.value === contract.cancel_reason)?.label || contract.cancel_reason },
          { label: 'Cancellation Date', value: contract.cancel_date ? new Date(contract.cancel_date).toLocaleDateString('en-GB') : '-' },
          { label: 'Additional Comments', value: contract.cancel_comments || 'No additional comments' },
        ];
        pdfContent.appendChild(createSection('Cancellation Details', cancelData));
      }

      // Generate PDF
      console.log('Starting html2canvas conversion...');
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: false,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        windowWidth: 794,
        onclone: (clonedDoc: Document) => {
          console.log('Cloning document for html2canvas...');
          // Remove all elements with oklch colors from the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const element = el as HTMLElement;
            const computedStyle = window.getComputedStyle(element);

            // Override any oklch colors with fallback colors
            if (computedStyle.color && computedStyle.color.includes('oklch')) {
              element.style.color = '#000000';
            }
            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
              element.style.backgroundColor = '#ffffff';
            }
            if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
              element.style.borderColor = '#E5E7EB';
            }
          });
          console.log('Cloned document cleaned');
        }
      });
      console.log('html2canvas conversion completed');

      const imgData = canvas.toDataURL('image/png');
      console.log('Creating jsPDF instance...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      console.log('jsPDF instance created');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Save PDF
      const fileName = `Contract_${contract?.contract_number || contract?.id?.slice(0, 8) || 'Document'}_${new Date().getTime()}.pdf`;
      console.log('Saving PDF as:', fileName);
      pdf.save(fileName);
      console.log('PDF saved successfully');

      // Cleanup
      document.body.removeChild(pdfContent);
      console.log('Cleanup completed');

    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate PDF: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract?.id}/refresh-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert('Payment information refreshed successfully');
        // Refresh the page to show updated payment data
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to refresh payment'}`);
      }
    } catch (error) {
      console.error('Error refreshing payment:', error);
      alert('Failed to refresh payment. Please try again.');
    } finally {
      setIsLoading(false);
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
                    {contract?.vehicle?.plate_number ? `${contract.vehicle.plate_number} - ${contract.vehicle.serial_number}` :
                     contract?.vehicle_plate ? `${contract.vehicle_plate} - ${contract.vehicle_serial_number}` : '-'}
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

      {/* Close Contract Modal */}
      <CustomModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Contract"
        subtitle="Close this contract and update vehicle status"
        maxWidth="max-w-lg"
      >
        <div className="p-6 space-y-6">
          {/* Close Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Close Information</h3>

            <SimpleSelect
              label="Reason for Closing"
              required
              options={closeReasons}
              value={closeReason}
              onChange={setCloseReason}
              placeholder="Select a reason for closing"
            />

            <SimpleTextarea
              label="Additional Comments"
              value={closeComments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCloseComments(e.target.value)}
              placeholder="Enter any additional details about closing the contract..."
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
                    {contract?.vehicle?.plate_number ? `${contract.vehicle.plate_number} - ${contract.vehicle.serial_number}` :
                     contract?.vehicle_plate ? `${contract.vehicle_plate} - ${contract.vehicle_serial_number}` : '-'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Status:</span>
                  <div className="font-semibold text-primary">{contract?.status?.name || 'Active'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Amount:</span>
                  <div className="font-semibold text-primary">
                    SAR {contract?.total_amount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <CustomButton
              variant="outline"
              onClick={() => setIsCloseModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleCloseContract}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Close'}
            </CustomButton>
          </div>
        </div>
      </CustomModal>

      {/* Cancel Contract Modal */}
      <CustomModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Contract"
        subtitle="Cancel this contract and update vehicle status"
        maxWidth="max-w-lg"
      >
        <div className="p-6 space-y-6">
          {/* Cancel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Cancellation Information</h3>

            <SimpleSelect
              label="Reason for Cancellation"
              required
              options={cancelReasons}
              value={cancelReason}
              onChange={setCancelReason}
              placeholder="Select a reason for cancellation"
            />

            <SimpleTextarea
              label="Additional Comments"
              value={cancelComments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelComments(e.target.value)}
              placeholder="Enter any additional details about the cancellation..."
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
                    {contract?.vehicle?.plate_number ? `${contract.vehicle.plate_number} - ${contract.vehicle.serial_number}` :
                     contract?.vehicle_plate ? `${contract.vehicle_plate} - ${contract.vehicle_serial_number}` : '-'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Status:</span>
                  <div className="font-semibold text-primary">{contract?.status?.name || 'Active'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Amount:</span>
                  <div className="font-semibold text-primary">
                    SAR {contract?.total_amount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <CustomButton
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleCancelContract}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Cancellation'}
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

          {/* Close Reason Section - Show only if contract is closed */}
          {contract?.status?.name === 'Closed' && contract?.close_reason && (
            <CollapsibleSection
              title="Closed Details"
              defaultOpen={true}
              className="mb-6 mx-0"
              headerClassName="bg-gray-100"
            >
              <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Close Reason</div>
                  <div className="font-bold text-primary text-base">
                    {closeReasons.find(r => r.value === contract.close_reason)?.label || contract.close_reason}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Close Date</div>
                  <div className="font-bold text-primary text-base">
                    {contract.close_date ? new Date(contract.close_date).toLocaleDateString('en-GB') : '-'}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-primary font-medium">Additional Comments</div>
                  <div className="font-bold text-primary text-base">
                    {contract.close_comments || 'No additional comments'}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Cancelled Reason Section - Show only if contract is cancelled */}
          {contract?.status?.name === 'Cancelled' && contract?.cancel_reason && (
            <CollapsibleSection
              title="Cancellation Details"
              defaultOpen={true}
              className="mb-6 mx-0"
              headerClassName="bg-red-50"
            >
              <div className="grid grid-cols-5 gap-y-2 gap-x-6 text-base">
                <div>
                  <div className="text-sm text-primary font-medium">Cancellation Reason</div>
                  <div className="font-bold text-primary text-base">
                    {cancelReasons.find(r => r.value === contract.cancel_reason)?.label || contract.cancel_reason}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Cancellation Date</div>
                  <div className="font-bold text-primary text-base">
                    {contract.cancel_date ? new Date(contract.cancel_date).toLocaleDateString('en-GB') : '-'}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-primary font-medium">Additional Comments</div>
                  <div className="font-bold text-primary text-base">
                    {contract.cancel_comments || 'No additional comments'}
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
                  disabled={contract?.status?.name === 'On Hold' || contract?.status?.name === 'Closed' || contract?.status?.name === 'Cancelled'}
                  style={{
                    color: getStatusColor('On Hold'),
                    borderColor: getStatusColor('On Hold'),
                    backgroundColor: '#ffffff'
                  }}
                >
                  Hold Contract
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCloseModalOpen(true)}
                  disabled={contract?.status?.name === 'Closed' || contract?.status?.name === 'Cancelled'}
                  style={{
                    color: getStatusColor('Closed'),
                    borderColor: getStatusColor('Closed'),
                    backgroundColor: '#ffffff'
                  }}
                >
                  Close Contract
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={contract?.status?.name === 'Cancelled'}
                  style={{
                    color: getStatusColor('Cancelled'),
                    borderColor: getStatusColor('Cancelled'),
                    backgroundColor: '#ffffff'
                  }}
                >
                  Cancel Contract
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={handlePrintContract}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating PDF...' : 'Print Contract'}
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPayment}
                  disabled={isLoading}
                >
                  Refresh Payment
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
                <div className="font-bold text-primary text-base">
                  {contract?.vehicle?.serial_number || contract?.vehicle_serial_number || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Plate</div>
                <div className="font-bold text-primary text-base">
                  {contract?.vehicle?.plate_number || contract?.vehicle_plate || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Make</div>
                <div className="font-bold text-primary text-base">{contract?.vehicle?.make || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Model</div>
                <div className="font-bold text-primary text-base">{contract?.vehicle?.model || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Year</div>
                <div className="font-bold text-primary text-base">{contract?.vehicle?.make_year || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Color</div>
                <div className="font-bold text-primary text-base">{contract?.vehicle?.color || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-primary font-medium">Mileage</div>
                <div className="font-bold text-primary text-base">
                  {contract?.vehicle?.mileage?.toLocaleString() || '-'} KM
                </div>
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