'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, AlertTriangle, User, Car, MapPin, Edit, Trash2, Download } from 'lucide-react';
import CustomButton from '../reusableComponents/CustomButton';
import CustomCard from '../reusableComponents/CustomCard';
import CustomTabs from '../reusableComponents/CustomTabs';
import { CollapsibleSection } from '../reusableComponents/CollapsibleSection';

interface Inspection {
  id: string;
  inspection_id: string;
  inspection_date: string;
  inspection_type: string;
  status: string;
  inspector: string;
  vehicle: {
    id: string;
    plate_number: string;
    serial_number: string;
    make_year: string;
    make: string;
    model: string;
    color: string;
    color_hex: string;
    status: string;
    status_color: string;
    branch: string;
    branch_code: string;
    branch_address: string;
  };
  created_at: string;
  updated_at: string;
}

export default function InspectionDetails() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params?.id as string;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Define tabs - only show when status is not "Pending"
  const tabs = [
    { label: 'Overview', key: 'overview' },
    { label: 'Inspection Report', key: 'report' },
  ];

  // Mock inspection data - Change status to test different scenarios
  const mockInspection: Inspection = {
    id: inspectionId || '1',
    inspection_id: 'INSP-1234',
    inspection_date: '2024-01-15',
    inspection_type: 'Check-out',
    status: 'Done', // Change this to 'Pending' to test no-tabs scenario
    inspector: 'Omar Al-Farsi',
    vehicle: {
      id: 'v1',
      plate_number: 'Z27846',
      serial_number: 'SN123456789',
      make_year: '2022',
      make: 'Toyota',
      model: 'Camry',
      color: 'White',
      color_hex: '#FFFFFF',
      status: 'Available',
      status_color: '#10B981',
      branch: 'Branch #1',
      branch_code: 'BR001',
      branch_address: '123 Main Street, Riyadh'
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      // Set status based on inspection ID for testing
      const testInspection = { ...mockInspection };
      if (inspectionId === '1') {
        testInspection.status = 'Pending';
      } else if (inspectionId === '2') {
        testInspection.status = 'Done';
      }
      setInspection(testInspection);
      setLoading(false);
    }, 500);
  }, [inspectionId]);

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Pending': '#F59E0B',
      'Done': '#10B981',
      'With Damages': '#EF4444',
      'Failed': '#DC2626'
    };
    return statusColors[status] || '#6B7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-5 h-5" />;
      case 'With Damages':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
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
         if (inspection!.status === 'Pending') {
           return renderPendingInspection();
         } else {
           return renderCompletedInspection();
         }

  // Render pending inspection component
  function renderPendingInspection() {
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
                    {inspection!.vehicle.plate_number} | {inspection!.vehicle.make} {inspection!.vehicle.model} {inspection!.vehicle.make_year}
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

        {/* Pending Content - No tabs */}
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
                    {inspection!.vehicle.plate_number} | {inspection!.vehicle.make} {inspection!.vehicle.model} {inspection!.vehicle.make_year}
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

        {/* Tabs - Only show when status is not "Pending" */}
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
            <div>
              <div className="text-sm text-muted-foreground mb-1">Type</div>
              <div className="font-semibold text-primary">{inspection!.inspection_type}</div>
            </div>
            {inspection!.status !== 'Pending' && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                <div className="font-semibold text-primary">SAR 450.00</div>
              </div>
            )}
          </div>
          {inspection!.status !== 'Pending' && (
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
              <div className="text-sm text-muted-foreground mb-1">Year</div>
              <div className="font-semibold text-primary">{inspection!.vehicle.make_year}</div>
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
                style={{ color: inspection!.vehicle.status_color }}
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
            <div>
              <div className="text-sm text-muted-foreground mb-1">Branch Address</div>
              <div className="font-semibold text-primary">{inspection!.vehicle.branch_address}</div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Inspection Notes */}
        <CollapsibleSection
          title="Inspection Notes"
          defaultOpen={true}
          className="mx-0"
          headerClassName="bg-[#F6F9FF]"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">General Notes</div>
              <div className="text-primary">
                Vehicle inspection completed. All systems checked and functioning properly.
                Minor cosmetic wear noted on front bumper.
              </div>
            </div>

            {inspection!.status === 'With Damages' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="text-sm text-red-700 mb-2 font-medium">Damage Report</div>
                <div className="text-red-800">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Scratch on driver side door (5cm length)</li>
                    <li>Minor dent on rear bumper</li>
                    <li>Worn brake pads (front)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

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
    // Helper to render damage entry
    const renderDamageEntry = (
      damageNumber: number,
      description: string,
      cost: number,
      images: string[],
      totalDamagesInSection: number = 1
    ) => (
      <div className="border-b border-gray-200 last:border-b-0 py-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-primary">Damage {damageNumber}</h4>
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">SAR {cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {totalDamagesInSection > 0 && (
              <span className="px-3 py-1 text-xs font-medium rounded-full text-pink-700 bg-pink-100">
                {totalDamagesInSection} Damage{totalDamagesInSection > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex gap-2">
          {images.map((imgSrc, index) => (
            <img
              key={index}
              src={imgSrc}
              alt={`Damage ${damageNumber} image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-md border border-gray-200"
            />
          ))}
        </div>
      </div>
    );

    // Helper to render "No Damages" entry
    const renderNoDamageEntry = () => (
      <div className="flex justify-end py-4">
        <span className="px-3 py-1 text-xs font-medium rounded-full text-gray-700 bg-gray-100">
          No Damages
        </span>
      </div>
    );

    return (
      <div className="px-6">
        {/* Exterior Damage Section */}
        <CollapsibleSection
          title="Exterior Damage (3)"
          defaultOpen={true}
          className="mx-0"
          headerClassName="bg-[#F6F9FF]"
        >
          <div className="space-y-4">
            {/* Body Panels */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Body Panels</h3>
              {renderDamageEntry(
                1,
                "Lorem ipsum dolor sit amet consectetur. Aenean elit ac tincidunt quisque laoreet curabitur enim habitasse. Ac mi aliquam risus pretium enim imperdiet augue fermentum.",
                100.00,
                ['/images/Icons/Placeholder.svg', '/images/Icons/Placeholder.svg'],
                1
              )}
            </div>

            {/* Windows/Mirrors */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Windows/Mirrors</h3>
              {renderDamageEntry(
                1,
                "Lorem ipsum dolor sit amet consectetur. Aenean elit ac tincidunt quisque laoreet curabitur enim habitasse. Ac mi aliquam risus pretium enim imperdiet augue fermentum.",
                150.00,
                ['/images/Icons/Placeholder.svg', '/images/Icons/Placeholder.svg', '/images/Icons/Placeholder.svg'],
                2
              )}
              {renderDamageEntry(
                2,
                "Lorem ipsum dolor sit amet consectetur. Aenean elit ac tincidunt quisque laoreet curabitur enim",
                500.00,
                ['/images/Icons/Placeholder.svg', '/images/Icons/Placeholder.svg'],
                0
              )}
            </div>

            {/* Lights */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Lights</h3>
              {renderNoDamageEntry()}
            </div>

            {/* Tires/Wheels */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Tires/Wheels</h3>
              {renderNoDamageEntry()}
            </div>

            {/* Undercarriage */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Undercarriage</h3>
              {renderNoDamageEntry()}
            </div>
          </div>
        </CollapsibleSection>

        {/* Interior Damage Section */}
        <CollapsibleSection
          title="Interior Damage (2)"
          defaultOpen={true}
          className="mx-0 mt-6"
          headerClassName="bg-[#F6F9FF]"
        >
          <div className="space-y-4">
            {/* Upholstery */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Upholstery</h3>
              {renderDamageEntry(
                1,
                "Lorem ipsum dolor sit amet consectetur. Aenean elit ac tincidunt quisque laoreet curabitur enim habitasse. Ac mi aliquam etium enim imperdiet augue fermentum.",
                90.00,
                ['/images/Icons/Placeholder.svg', '/images/Icons/Placeholder.svg'],
                2
              )}
              {renderDamageEntry(
                2,
                "Lorem ipsum dolor sit amet consectetur. Aenean elit ac tincidunt quisque aliquam imperdiet augue fermentum.",
                60.00,
                ['/images/mock-car-seat-light.jpg', '/images/mock-car-door-handle.jpg', '/images/mock-car-seat-fabric.jpg'],
                0
              )}
            </div>

            {/* Dashboard */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Dashboard</h3>
              {renderNoDamageEntry()}
            </div>

            {/* Controls */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Controls</h3>
              {renderNoDamageEntry()}
            </div>

            {/* Emergency Items */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Emergency Items</h3>
              {renderNoDamageEntry()}
            </div>

            {/* OBD-II Port */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">OBD-II Port</h3>
              {renderNoDamageEntry()}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    );
  }
}