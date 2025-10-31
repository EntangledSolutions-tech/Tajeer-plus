'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Car, MapPin, Download } from 'lucide-react';
import Image from 'next/image';
import CustomButton from '../reusableComponents/CustomButton';
import CustomTabs from '../reusableComponents/CustomTabs';
import { CollapsibleSection } from '../reusableComponents/CollapsibleSection';

interface DamageDetail {
  id: string;
  damage_number: number;
  damage_level: string;
  area: string;
  description: string;
  cost: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface GroupedDamages {
  exterior: Record<string, DamageDetail[]>;
  interior: Record<string, DamageDetail[]>;
}

interface Inspection {
  id: string;
  inspection_id: string;
  inspection_date: string;
  inspection_type?: string;
  status: string;
  inspector: string;
  vehicle: {
    id: string;
    plate_number: string;
    serial_number: string;
    make: string;
    model: string;
    color: string;
    color_hex?: string;
    status: string;
    status_color?: string;
    branch: string;
  };
  created_at: string;
  updated_at: string;
  total_damages?: number;
  exterior_damages?: number;
  interior_damages?: number;
}

export default function InspectionDetails() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params?.id as string;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [damages, setDamages] = useState<GroupedDamages>({ exterior: {}, interior: {} });
  const [damagesLoading, setDamagesLoading] = useState(false);

  // Define tabs - only show when status is not "In Progress"
  const tabs = [
    { label: 'Overview', key: 'overview' },
    { label: 'Inspection Report', key: 'report' },
  ];

  // Fetch inspection from API
  const fetchInspection = useCallback(async () => {
    if (!inspectionId) {
      setError('No inspection ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/inspections/${inspectionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch inspection');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setInspection(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching inspection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inspection';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  // Fetch damages for the inspection
  const fetchDamages = useCallback(async () => {
    if (!inspectionId) return;

    try {
      setDamagesLoading(true);

      const response = await fetch(`/api/inspections/${inspectionId}/damages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch damages`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setDamages(result.data.damages);
      } else {
        console.warn('Unexpected response format:', result);
        setDamages({ exterior: {}, interior: {} });
      }
    } catch (err) {
      console.error('Error fetching damages:', err);
      // Set empty damages on error to prevent undefined access
      setDamages({ exterior: {}, interior: {} });
    } finally {
      setDamagesLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  // Fetch damages when switching to report tab and inspection is completed
  useEffect(() => {
    if (activeTab === 'report' && inspection?.status === 'Completed') {
      fetchDamages();
    }
  }, [activeTab, inspection?.status, fetchDamages, inspectionId]);

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'In Progress': '#F59E0B',
      'Completed': '#10B981'
    };
    return statusColors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mx-4 mt-4">
          No inspection data found
        </div>
      </div>
    );
  }

  // Render based on inspection status
  if (inspection!.status === 'In Progress') {
    return renderInProgressInspection();
  } else {
    return renderCompletedInspection();
  }

  // Render in-progress inspection component
  function renderInProgressInspection() {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-transparent">
          <div className="px-6 pb-2">
            <CustomButton
              variant="ghost"
              onClick={() => router.back()}
              className="text-white font-medium text-sm hover:text-blue-100 transition-colors"
            >
              &lt; Back
            </CustomButton>
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-white">{inspection!.inspection_id}</div>
                  <div className="text-lg text-blue-100 font-medium">
                    {inspection!.vehicle.plate_number} | {inspection!.vehicle.make} {inspection!.vehicle.model}
                  </div>
                </div>
                <div className="ml-4">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity bg-white border"
                    style={{
                      color: getStatusColor(inspection!.status),
                      borderColor: getStatusColor(inspection!.status)
                    }}
                  >
                    <span>{inspection!.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CustomButton
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white"
                >
                  More Actions
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress Content - No tabs */}
        <div className="flex-1">
          <div className="py-6">
            <div className="flex flex-col gap-6">
              {renderOverviewContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render completed inspection component
  function renderCompletedInspection() {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-transparent">
          <div className="px-6 pb-2">
            <CustomButton
              variant="ghost"
              onClick={() => router.back()}
              className="text-white font-medium text-sm hover:text-blue-100 transition-colors"
            >
              &lt; Back
            </CustomButton>
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-white">{inspection!.inspection_id}</div>
                  <div className="text-lg text-blue-100 font-medium">
                    {inspection!.vehicle.plate_number} | {inspection!.vehicle.make} {inspection!.vehicle.model}
                  </div>
                </div>
                <div className="ml-4">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity bg-white border"
                    style={{
                      color: getStatusColor(inspection!.status),
                      borderColor: getStatusColor(inspection!.status)
                    }}
                  >
                    <span>{inspection!.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CustomButton
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Report
                </CustomButton>
                <CustomButton
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white"
                >
                  More Actions
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Only show when status is not "In Progress" */}
        <div className="bg-white mt-10 align-center">
          <div className="px-6 py-4 align-center">
            <CustomTabs
              className='justify-center'
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="py-6">
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                {renderOverviewContent()}
              </div>
            )}
            {activeTab === 'report' && (
              <div className="flex flex-col gap-6">
                {renderInspectionReport()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render overview content
  function renderOverviewContent() {
    return (
      <>
        {/* Inspection Details */}
        <CollapsibleSection
          title="Inspection details"
          defaultOpen={true}
          className="mx-0"
          headerClassName="bg-[#F6F9FF]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Inspector</div>
              <div className="font-semibold text-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                {inspection!.inspector}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Date</div>
              <div className="font-semibold text-primary">
                {new Date(inspection!.inspection_date).toLocaleDateString()}
              </div>
            </div>
            {inspection!.inspection_type && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <div className="font-semibold text-primary">{inspection!.inspection_type}</div>
              </div>
            )}
            {inspection!.status !== 'In Progress' && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Damages</div>
                <div className="font-semibold text-primary">{inspection!.total_damages || 0}</div>
              </div>
            )}
          </div>
          {inspection!.status !== 'In Progress' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Linked Invoice</div>
                  <div className="font-semibold text-primary">
                    <a href="#" className="text-blue-600 hover:underline">INV-3782</a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Report</div>
                  <div className="font-semibold text-primary">
                    Report #2785
                    <div className="flex gap-2 mt-1">
                      <a href="#" className="text-blue-600 hover:underline text-sm">View</a>
                      <a href="#" className="text-blue-600 hover:underline text-sm">Download</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* Vehicle Information */}
        <CollapsibleSection
          title="Vehicle Information"
          defaultOpen={true}
          className="mx-0"
          headerClassName="bg-[#F6F9FF]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Plate Number</div>
              <div className="font-semibold text-primary flex items-center gap-2">
                <Car className="w-4 h-4" />
                {inspection!.vehicle.plate_number}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Serial Number</div>
              <div className="font-semibold text-primary">{inspection!.vehicle.serial_number}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Make & Model</div>
              <div className="font-semibold text-primary">
                {inspection!.vehicle.make} {inspection!.vehicle.model}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Color</div>
              <div className="font-semibold text-primary flex items-center gap-2">
                {inspection!.vehicle.color_hex && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: inspection!.vehicle.color_hex }}
                  />
                )}
                {inspection!.vehicle.color}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div
                className="font-semibold text-sm"
                style={{ color: inspection!.vehicle.status_color || '#10B981' }}
              >
                {inspection!.vehicle.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Branch</div>
              <div className="font-semibold text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {inspection!.vehicle.branch}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Inspection Summary */}
        {inspection!.status === 'Completed' && (inspection!.total_damages ?? 0) > 0 && (
          <CollapsibleSection
            title="Damage Summary"
            defaultOpen={true}
            className="mx-0"
            headerClassName="bg-[#F6F9FF]"
          >
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="text-sm text-red-700 mb-2 font-medium">Damages Detected</div>
                <div className="text-red-800">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Damages</div>
                      <div className="text-lg font-semibold">{inspection!.total_damages || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Exterior Damages</div>
                      <div className="text-lg font-semibold">{inspection!.exterior_damages || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Interior Damages</div>
                      <div className="text-lg font-semibold">{inspection!.interior_damages || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Inspection Checklist */}
        <CollapsibleSection
          title="Inspection Checklist"
          defaultOpen={true}
          className="mx-0"
          headerClassName="bg-[#F6F9FF]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Exterior</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Body condition</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lights</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tires</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Windows</span>
                  <span className="text-green-600">✓</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Interior</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Seats</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dashboard</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Controls</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cleanliness</span>
                  <span className="text-green-600">✓</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </>
    );
  }

  // Render inspection report content
  function renderInspectionReport() {
    if (!inspection) {
      return (
        <div className="px-6">
          <div className="text-center py-8 text-gray-500">
            No inspection data available
          </div>
        </div>
      );
    }

    // Helper to get damage level color
    const getDamageLevelColor = (level: string) => {
      switch (level) {
        case 'Minor': return 'bg-blue-100 text-blue-800';
        case 'Moderate': return 'bg-yellow-100 text-yellow-800';
        case 'Severe': return 'bg-orange-100 text-orange-800';
        case 'Critical': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    // Helper to render damage entry
    const renderDamageEntry = (damage: DamageDetail) => (
      <div className="border-b border-gray-200 last:border-b-0 py-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-primary">Damage {damage.damage_number}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDamageLevelColor(damage.damage_level)}`}>
              {damage.damage_level}
            </span>
            {damage.area && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {damage.area}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">SAR {damage.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{damage.description}</p>
        {damage.images && damage.images.length > 0 && (
          <div className="flex gap-2">
            {damage.images.map((imgSrc, index) => (
              <Image
                key={index}
                src={imgSrc}
                alt={`Damage ${damage.damage_number} image ${index + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-md border border-gray-200"
                onError={(e) => {
                  console.error('Image failed to load:', imgSrc);
                  // Fallback to a placeholder or hide the image
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}
      </div>
    );

    // Helper to render category damages
    const renderCategoryDamages = (damages: DamageDetail[]) => {
      if (!damages || damages.length === 0) {
        return (
          <div className="flex justify-end py-4">
            <span className="px-3 py-1 text-xs font-medium rounded-full text-gray-700 bg-gray-100">
              No Damages
            </span>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {damages.map((damage) => renderDamageEntry(damage))}
        </div>
      );
    };

    const exteriorDamages = inspection!.exterior_damages || 0;
    const interiorDamages = inspection!.interior_damages || 0;

    // Get exterior and interior categories
    const exteriorCategories = Object.keys(damages.exterior).sort();
    const interiorCategories = Object.keys(damages.interior).sort();

    return (
      <div className="px-6">
        {damagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Exterior Damage Section */}
            <CollapsibleSection
              title={`Exterior Damage (${exteriorDamages})`}
              defaultOpen={true}
              className="mx-0"
              headerClassName="bg-[#F6F9FF]"
            >
              <div className="space-y-4">
                {exteriorCategories.length > 0 ? (
                  exteriorCategories.map((category) => (
                    <div key={category} className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-primary mb-2">{category}</h3>
                      {renderCategoryDamages(damages.exterior[category] || [])}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No exterior damages recorded
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Interior Damage Section */}
            <CollapsibleSection
              title={`Interior Damage (${interiorDamages})`}
              defaultOpen={true}
              className="mx-0 mt-6"
              headerClassName="bg-[#F6F9FF]"
            >
              <div className="space-y-4">
                {interiorCategories.length > 0 ? (
                  interiorCategories.map((category) => (
                    <div key={category} className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-primary mb-2">{category}</h3>
                      {renderCategoryDamages(damages.interior[category] || [])}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No interior damages recorded
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Show message if no damages at all */}
            {exteriorCategories.length === 0 && interiorCategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No damages recorded for this inspection
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}