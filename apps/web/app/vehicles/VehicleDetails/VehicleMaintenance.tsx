import React, { useState } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, Eye, ArrowRight } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';

// Mock data
const serviceLogs = [
  { id: 1, date: '11/22/2021', type: 'Return from Service', notes: 'Car return after fixing gearbox' },
  { id: 2, date: '01/05/2023', type: 'Out for service', notes: 'Due to gearbox damage' },
];

const penaltiesData = [
  {
    id: 1,
    date: '14/03/2022',
    amount: 'SAR 23,456',
    status: 'Unpaid',
    reason: 'Late Return',
    method: '-',
    contract: '123',
    notes: 'Lorem Ipsum is simply dummy text'
  },
  {
    id: 2,
    date: '22/11/2021',
    amount: 'SAR 9,876',
    status: 'Paid',
    reason: 'Damage',
    method: 'Cash',
    contract: '241',
    notes: 'Lorem Ipsum is simply dummy text'
  },
];

const maintenanceLogs = [
  {
    id: 1,
    date: '03/14/2022',
    type: 'Brake Pad Replacement',
    amount: 'SAR 123',
    invoice: 'INV-2428',
    supplier: 'SpecR Garage',
    notes: 'Brakes were not working properly'
  },
  {
    id: 2,
    date: '11/22/2021',
    type: 'Interior decoration',
    amount: 'SAR 345',
    invoice: 'INV-2452',
    supplier: 'Al Hilal Garage',
    notes: 'Interior had to be deep cleaned'
  },
];

const notesData = [
  {
    id: 1,
    date: '03/14/2022',
    notes: 'Lorem ipsum dolor sit amet consectetur. Sollicitudin ornare lorem mauris ornare sit.'
  },
  {
    id: 2,
    date: '11/22/2021',
    notes: 'Lorem ipsum dolor sit amet consectetur. Adipiscing magna sit orci semper morbi dui non.'
  },
];

const inspectionData = [
  {
    id: 1,
    date: '03/14/2022',
    inspectionId: 'INSP-1234',
    type: 'Check-out',
    status: 'Pending',
    inspector: 'Omar Al-Farsi'
  },
  {
    id: 2,
    date: '01/05/2023',
    inspectionId: 'INSP-1121',
    type: 'Check-in',
    status: 'Done',
    inspector: 'Bilal Al-Hakim'
  },
  {
    id: 3,
    date: '08/12/2022',
    inspectionId: 'INSP-3141',
    type: 'Check-out',
    status: 'Done',
    inspector: 'Yusuf Al-Sayed'
  },
  {
    id: 4,
    date: '05/19/2021',
    inspectionId: 'INSP-5161',
    type: 'Check-in',
    status: 'Done',
    inspector: 'Khalid Al-Rashid'
  },
  {
    id: 5,
    date: '02/28/2023',
    inspectionId: 'INSP-7181',
    type: 'Check-out',
    status: 'Done',
    inspector: 'Samir Al-Nasr'
  },
  {
    id: 6,
    date: '12/15/2020',
    inspectionId: 'INSP-9202',
    type: 'Check-in',
    status: 'Done',
    inspector: 'Tariq Al-Zahra'
  },
];

export default function VehicleMaintenance() {
  const [penaltiesFilter, setPenaltiesFilter] = useState('All');
  const [inspectionFilter, setInspectionFilter] = useState('All');

  // Define table columns for Service Logs
  const serviceLogsColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' }
  ];

  // Define actions for Service Logs
  const serviceLogsActions: TableAction[] = [
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: any) => console.log('Edit service log:', row),
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5'
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: any) => console.log('Delete service log:', row),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700'
    }
  ];

  // Define table columns for Penalties & Violations
  const penaltiesColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'text' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      render: (value) => {
        const statusColor = value === 'Paid' ? 'green' : value === 'Unpaid' ? 'red' : 'orange';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColor === 'green' ? 'bg-green-100 text-green-800' :
            statusColor === 'red' ? 'bg-red-100 text-red-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {value}
          </span>
        );
      }
    },
    { key: 'reason', label: 'Reason', type: 'text' },
    { key: 'method', label: 'Method', type: 'text' },
    {
      key: 'contract',
      label: 'Contract',
      type: 'link',
      render: (value) => (
        <CustomButton isText className="text-primary hover:underline">
          {value}
        </CustomButton>
      )
    },
    { key: 'notes', label: 'Notes', type: 'text' }
  ];

  // Define actions for Penalties & Violations
  const penaltiesActions: TableAction[] = [
    {
      key: 'view',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4 ml-2" />,
      iconPosition: 'right',
      onClick: (row: any) => console.log('View penalty details:', row),
      variant: 'ghost',
      className: 'text-primary flex items-center'
    }
  ];

  // Define table columns for General Maintenance Logs
  const maintenanceLogsColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'text' },
    {
      key: 'invoice',
      label: 'Invoice',
      type: 'link',
      render: (value) => (
        <CustomButton isText className="text-primary hover:underline">
          {value}
        </CustomButton>
      )
    },
    { key: 'supplier', label: 'Supplier', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' }
  ];

  // Define actions for General Maintenance Logs
  const maintenanceLogsActions: TableAction[] = [
    {
      key: 'view',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4 ml-2" />,
      iconPosition: 'right',
      onClick: (row: any) => console.log('View maintenance log details:', row),
      variant: 'ghost',
      className: 'text-primary flex items-center'
    }
  ];

  // Define table columns for Notes
  const notesColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' }
  ];

  // Define actions for Notes
  const notesActions: TableAction[] = [
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: any) => console.log('Edit note:', row),
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5'
    },
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: any) => console.log('Delete note:', row),
      variant: 'ghost',
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700'
    }
  ];

  // Define table columns for Vehicle Inspection
  const inspectionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'inspectionId', label: 'Inspection ID', type: 'text' },
    { key: 'type', label: 'Type', type: 'text' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      render: (value) => {
        const statusColor = value === 'Done' ? 'green' : value === 'Pending' ? 'orange' : 'gray';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColor === 'green' ? 'bg-green-100 text-green-800' :
            statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        );
      }
    },
    { key: 'inspector', label: 'Inspector', type: 'text' }
  ];

  // Define actions for Vehicle Inspection
  const inspectionActions: TableAction[] = [
    {
      key: 'view',
      label: 'Details',
      icon: <ArrowRight className="w-4 h-4 ml-2" />,
      iconPosition: 'right',
      onClick: (row: any) => console.log('View inspection details:', row),
      variant: 'ghost',
      className: 'text-primary flex items-center'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Oil Change */}
      <CollapsibleSection
        title="Oil Change"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
      >
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Oil expiry (km)</div>
            <div className="text-base text-primary font-bold">48,239</div>
          </div>
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Last Change Date</div>
            <div className="text-base text-primary font-bold">12/05/2023</div>
          </div>
          <div>
            <div className="text-xs text-primary/60 font-medium mb-1">Next Due</div>
            <div className="text-base text-primary font-bold">12/05/2024</div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Service Logs */}
      <CollapsibleSection
        title="Service Logs"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
        headerButton={
          <CustomButton
            isSecondary
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Out For Service
          </CustomButton>
        }
      >
        <CustomTable
          data={serviceLogs}
          columns={serviceLogsColumns}
          actions={serviceLogsActions}
          tableBackground="transparent"
          emptyMessage="No service logs found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>

      {/* Warranty & Expirations */}
      <CollapsibleSection
        title="Warranty & Expirations"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
      >
        <div className="space-y-6">
          {/* Warranty Sub-section */}
          <div className="border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-primary/60 font-medium mb-1">Coverage until</div>
                <div className="text-base text-primary font-bold">122.45km</div>
              </div>
              <CustomButton variant="primary">
                Update Warranty
              </CustomButton>
            </div>
          </div>

          {/* Expirations Sub-section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-primary">Expirations</h4>
              <CustomButton isSecondary className="flex items-center gap-1">
                <Pencil className="w-3 h-3" />
                Edit
              </CustomButton>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-primary">Form/license expiration date</span>
                <span className="text-primary font-medium">12/05/2026 (01/01/1448)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary">Periodic inspection end date</span>
                <span className="text-primary font-medium">11/22/2026 (15/03/1448)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary">Insurance policy expiration date</span>
                <span className="text-primary font-medium">10/14/2026 (10/06/1448)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary">Operating card expiration date</span>
                <span className="text-primary font-medium">01/09/2020 (20/05/1448)</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Penalties & Violations */}
      <CollapsibleSection
        title="Penalties & Violations"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
        headerButton={
          <CustomButton
            isSecondary
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Penalty
          </CustomButton>
        }
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <RadioButtonGroup
            options={[
              { value: 'All', label: 'All' },
              { value: 'Unpaid', label: 'Unpaid' },
              { value: 'Paid', label: 'Paid' }
            ]}
            value={penaltiesFilter}
            onChange={setPenaltiesFilter}
            name="penaltiesFilter"
          />
        </div>
        <CustomTable
          data={penaltiesData.filter(item => penaltiesFilter === 'All' || item.status === penaltiesFilter)}
          columns={penaltiesColumns}
          actions={penaltiesActions}
          tableBackground="transparent"
          emptyMessage="No penalties found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>

      {/* General Maintenance Logs */}
      <CollapsibleSection
        title="General Maintenance Logs"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
        headerButton={
          <CustomButton
            isSecondary
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Maintenance Log
          </CustomButton>
        }
      >
        <CustomTable
          data={maintenanceLogs}
          columns={maintenanceLogsColumns}
          actions={maintenanceLogsActions}
          tableBackground="transparent"
          emptyMessage="No maintenance logs found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>

      {/* Notes */}
      <CollapsibleSection
        title="Notes"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
        headerButton={
          <CustomButton
            isSecondary
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </CustomButton>
        }
      >
        <CustomTable
          data={notesData}
          columns={notesColumns}
          actions={notesActions}
          tableBackground="transparent"
          emptyMessage="No notes found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>

      {/* Vehicle Inspection */}
      <CollapsibleSection
        title="Vehicle Inspection"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <RadioButtonGroup
            options={[
              { value: 'All', label: 'All' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Done', label: 'Done' }
            ]}
            value={inspectionFilter}
            onChange={setInspectionFilter}
            name="inspectionFilter"
          />
          <div className="flex items-center gap-4">
            <SearchBar
              value=""
              onChange={() => {}}
              placeholder="Search"
              width="w-40"
              variant="white-bg"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-4 h-4" />
            </CustomButton>
          </div>
        </div>
        <CustomTable
          data={inspectionData.filter(item => inspectionFilter === 'All' || item.status === inspectionFilter)}
          columns={inspectionColumns}
          actions={inspectionActions}
          tableBackground="transparent"
          emptyMessage="No inspections found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>
    </div>
  );
}