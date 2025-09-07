import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2 } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { useParams } from 'next/navigation';

interface OilChange {
  id: string;
  oil_change_km: number | null;
  last_change_date: string | null;
  next_change_date: string | null;
}

interface ServiceLog {
  id: string;
  service_date: string | null;
  service_type: string | null;
  notes: string | null;
}

interface Warranty {
  id: string;
  coverage_until_km: number | null;
}

interface Penalty {
  id: string;
  penalty_date: string | null;
  amount: number | null;
  status: string | null;
  reason: string | null;
  payment_method: string | null;
  contract_number: string | null;
  notes: string | null;
}

interface MaintenanceLog {
  id: string;
  maintenance_date: string | null;
  maintenance_type: string | null;
  amount: number | null;
  invoice_number: string | null;
  supplier: string | null;
  notes: string | null;
}

interface Note {
  id: string;
  note_date: string | null;
  note_text: string | null;
}

interface Inspection {
  id: string;
  inspection_date: string | null;
  inspection_id: string | null;
  inspection_type: string | null;
  status: string | null;
  inspector: string | null;
}

interface MaintenanceData {
  oilChanges: OilChange[];
  serviceLogs: ServiceLog[];
  warranties: Warranty[];
  penalties: Penalty[];
  maintenanceLogs: MaintenanceLog[];
  notes: Note[];
  inspections: Inspection[];
}

export default function VehicleMaintenance() {
  const params = useParams();
  const vehicleId = params?.id as string;

  // Collapsible state for each section
  const [showOil, setShowOil] = useState(true);
  const [showService, setShowService] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showPenalties, setShowPenalties] = useState(true);
  const [showGeneral, setShowGeneral] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showInspection, setShowInspection] = useState(true);
  const [inspectionTab, setInspectionTab] = useState('All');

  // Data and loading states
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!vehicleId) {
          throw new Error('Vehicle ID not found');
        }

        // Check if vehicleId is a UUID (vehicle ID) or plate number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicleId);

        let actualVehicleId = vehicleId;

        if (!isUUID) {
          // If it's not a UUID, treat it as a plate number and fetch the vehicle ID
          const vehicleResponse = await fetch(`/api/vehicles?plate_number=${vehicleId}`);

          if (!vehicleResponse.ok) {
            const errorText = await vehicleResponse.text();
            throw new Error(`Failed to fetch vehicle data: ${vehicleResponse.status} ${vehicleResponse.statusText}`);
          }

          const vehicleResponseData = await vehicleResponse.json();

          // Handle the API response format - check if it's an object with vehicles array or direct array
          let vehicleData;
          if (vehicleResponseData && typeof vehicleResponseData === 'object') {
            if (Array.isArray(vehicleResponseData)) {
              vehicleData = vehicleResponseData;
            } else if (vehicleResponseData.vehicles && Array.isArray(vehicleResponseData.vehicles)) {
              vehicleData = vehicleResponseData.vehicles;
            } else {
              throw new Error('Unexpected vehicle response format');
            }
          } else {
            throw new Error('Invalid vehicle response data');
          }

          if (!vehicleData || !Array.isArray(vehicleData) || vehicleData.length === 0) {
            throw new Error(`Vehicle not found for plate number: ${vehicleId}`);
          }

          const foundVehicleId = vehicleData[0]?.id;
          if (!foundVehicleId) {
            throw new Error('Vehicle ID not found in response');
          }

          actualVehicleId = foundVehicleId;
        }

        // Then fetch maintenance data using the actual vehicle ID
        const response = await fetch(`/api/vehicles/${actualVehicleId}/maintenance`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch maintenance data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setMaintenanceData(data);
      } catch (err) {
        console.error('Error fetching maintenance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch maintenance data');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchMaintenanceData();
    }
  }, [vehicleId]);

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Helper function to format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return `SAR ${amount.toLocaleString()}`;
  };

  // Helper function to format number
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0065F2]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  const latestOilChange = maintenanceData?.oilChanges?.[0];
  const serviceLogs = maintenanceData?.serviceLogs || [];
  const latestWarranty = maintenanceData?.warranties?.[0];
  const penalties = maintenanceData?.penalties || [];
  const maintenanceLogs = maintenanceData?.maintenanceLogs || [];
  const notes = maintenanceData?.notes || [];
  const inspections = maintenanceData?.inspections || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Oil Change */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0">
          <button onClick={() => setShowOil(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] bg-[#F6F9FF] py-2 px-2 w-full text-left">
            <span className="text-[18px]">{showOil ? '▼' : '▶'}</span> Oil Change
          </button>
        </div>
        {showOil && (
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#A0B6D9] font-medium">Oil Change (km)</span>
              <span className="text-base text-[#0065F2] font-bold">{formatNumber(latestOilChange?.oil_change_km)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#A0B6D9] font-medium">Last Change Date</span>
              <span className="text-base text-[#0065F2] font-bold">{formatDate(latestOilChange?.last_change_date)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#A0B6D9] font-medium">Next Date</span>
              <span className="text-base text-[#0065F2] font-bold">{formatDate(latestOilChange?.next_change_date)}</span>
            </div>
          </div>
        )}
      </div>
      {/* Service Logs */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0 flex items-center bg-[#F6F9FF] py-2 px-4">
          <button onClick={() => setShowService(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] w-full text-left">
            <span className="text-[18px]">{showService ? '▼' : '▶'}</span> Service Logs
          </button>
          <CustomButton isSecondary icon={<Plus className="w-4 h-4" />} iconSide="left" className="ml-auto" onClick={() => {}}>
            Out for Service
          </CustomButton>
        </div>
        {showService && (
          <div className="px-6 py-4">
            {serviceLogs.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F6F9FF]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Notes</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
                  </tr>
                </thead>
                <tbody>
                  {serviceLogs.map((log) => (
                    <tr key={log.id} className="border-b border-[#F6F9FF]">
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{formatDate(log.service_date)}</td>
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{log.service_type || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{log.notes || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-[#0065F2] cursor-pointer underline">Edit Delete</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#A0B6D9]">No service logs found</div>
            )}
          </div>
        )}
      </div>
      {/* Warranty & Expirations */}
      <div className="rounded-2xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0">
          <button onClick={() => setShowWarranty(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] bg-[#F6F9FF] py-2 px-4 w-full text-left">
            <span className="text-[18px]">{showWarranty ? '▼' : '▶'}</span> Warranty & Expirations
            <div className="flex-1" />
            <CustomButton isSecondary icon={<Edit2 className="w-4 h-4" />} iconSide="left" className="ml-auto" onClick={() => {}}>
              Update Warranty
            </CustomButton>
          </button>
        </div>
        {showWarranty && (
          <div className="px-8 py-6">
            {/* Warranty */}
            <div className="mb-6">
              <div className="text-[#0065F2] font-bold text-lg mb-2">Warranty</div>
              <div className="text-[#0065F2] text-sm mb-1">Coverage until</div>
              <div className="text-[#0065F2] font-bold text-base mb-2">{formatNumber(latestWarranty?.coverage_until_km)}km</div>
              <hr className="border-t border-[#CDE2FF] my-6" />
            </div>
            {/* Expirations */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[#0065F2] font-bold text-lg mb-4">Expirations</div>
                <div className="grid grid-cols-2 gap-x-16 gap-y-4">
                  <div>
                    <div className="text-[#0065F2] text-sm mb-1">Form/license expiration date</div>
                    <div className="text-[#0065F2] font-bold text-base">12/05/2026 <span className="font-normal">(01/01/1448)</span></div>
                  </div>
                  <div>
                    <div className="text-[#0065F2] text-sm mb-1">Insurance policy expiration date</div>
                    <div className="text-[#0065F2] font-bold text-base">10/14/2026 <span className="font-normal">(10/08/1448)</span></div>
                  </div>
                  <div>
                    <div className="text-[#0065F2] text-sm mb-1">Periodic inspection end date</div>
                    <div className="text-[#0065F2] font-bold text-base">11/22/2026 <span className="font-normal">(15/03/1448)</span></div>
                  </div>
                  <div>
                    <div className="text-[#0065F2] text-sm mb-1">Operating card expiration date</div>
                    <div className="text-[#0065F2] font-bold text-base">01/09/2026 <span className="font-normal">(20/05/1448)</span></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-end flex-1">
                <CustomButton isSecondary icon={<Edit2 className="w-4 h-4" />} iconSide="left" className="ml-auto mt-2" onClick={() => {}}>
                  Edit
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Penalties & Violations */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0 flex items-center bg-[#F6F9FF] py-2 px-4">
          <button onClick={() => setShowPenalties(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] w-full text-left">
            <span className="text-[18px]">{showPenalties ? '▼' : '▶'}</span> Penalties & Violations
          </button>
          <CustomButton isSecondary icon={<Plus className="w-4 h-4" />} iconSide="left" className="ml-auto" onClick={() => {}}>
            Add Penalty
          </CustomButton>
        </div>
        {showPenalties && (
          <div className="px-6 py-4">
            <div className="mb-2">
              <RadioButtonGroup
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'unpaid', label: 'Unpaid' },
                  { value: 'paid', label: 'Paid' }
                ]}
                value="all"
                onChange={() => {}}
                name="penaltiesFilter"
              />
            </div>
            {penalties.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F6F9FF]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Reason</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Contract</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Notes</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
                  </tr>
                </thead>
                <tbody>
                  {penalties.map((penalty) => (
                    <tr key={penalty.id} className="border-b border-[#F6F9FF]">
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{formatDate(penalty.penalty_date)}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{formatCurrency(penalty.amount)}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{penalty.status || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{penalty.reason || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{penalty.payment_method || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{penalty.contract_number || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{penalty.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <CustomButton isText>View Details</CustomButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#A0B6D9]">No penalties found</div>
            )}
          </div>
        )}
      </div>
      {/* General Maintenance Logs */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0 flex items-center bg-[#F6F9FF] py-2 px-4">
          <button onClick={() => setShowGeneral(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] w-full text-left">
            <span className="text-[18px]">{showGeneral ? '▼' : '▶'}</span> General Maintenance Logs
          </button>
          <CustomButton isSecondary icon={<Plus className="w-4 h-4" />} iconSide="left" className="ml-auto" onClick={() => {}}>
            Add Maintenance Log
          </CustomButton>
        </div>
        {showGeneral && (
          <div className="px-6 py-4">
            {maintenanceLogs.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F6F9FF]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Supplier</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Notes</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceLogs.map((log) => (
                    <tr key={log.id} className="border-b border-[#F6F9FF]">
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{formatDate(log.maintenance_date)}</td>
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{log.maintenance_type || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{formatCurrency(log.amount)}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{log.invoice_number || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{log.supplier || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{log.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <CustomButton isText>View Details</CustomButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#A0B6D9]">No maintenance logs found</div>
            )}
          </div>
        )}
      </div>
      {/* Notes */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0 flex items-center bg-[#F6F9FF] py-2 px-4">
          <button onClick={() => setShowNotes(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] w-full text-left">
            <span className="text-[18px]">{showNotes ? '▼' : '▶'}</span> Notes
          </button>
          <CustomButton isSecondary icon={<Plus className="w-4 h-4" />} iconSide="left" className="ml-auto" onClick={() => {}}>
            Add Note
          </CustomButton>
        </div>
        {showNotes && (
          <div className="px-6 py-4">
            {notes.length > 0 ? (
              <table className="min-w-full text-sm">
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id} className="border-b border-[#F6F9FF]">
                      <td className="px-4 py-3 text-[#0065F2]">{formatDate(note.note_date)}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{note.note_text || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-[#0065F2] cursor-pointer underline">Edit Delete</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#A0B6D9]">No notes found</div>
            )}
          </div>
        )}
      </div>
      {/* Vehicle Inspection */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0 flex items-center bg-[#F6F9FF] py-2 px-4">
          <button onClick={() => setShowInspection(v => !v)} className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] w-full text-left">
            <span className="text-[18px]">{showInspection ? '▼' : '▶'}</span> Vehicle Inspection
          </button>
        </div>
        {showInspection && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <RadioButtonGroup
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Done', label: 'Done' }
                ]}
                value={inspectionTab}
                onChange={setInspectionTab}
                name="inspectionFilter"
              />
              <SearchBar
                value=""
                onChange={() => {}}
                placeholder="Search"
                width="w-40"
                variant="white-bg"
              />
            </div>
            {inspections.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F6F9FF]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Inspection ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Inspector</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="border-b border-[#F6F9FF]">
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{formatDate(inspection.inspection_date)}</td>
                      <td className="px-4 py-3 font-medium text-[#0065F2]">{inspection.inspection_id || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{inspection.inspection_type || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{inspection.status || '-'}</td>
                      <td className="px-4 py-3 text-[#0065F2]">{inspection.inspector || '-'}</td>
                      <td className="px-4 py-3">
                        <CustomButton isText>View Details</CustomButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#A0B6D9]">No inspections found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}