import React, { useState } from 'react';
import { Search, Filter, FileSpreadsheet, Pencil } from 'lucide-react';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';
import CustomButton from '../../reusableComponents/CustomButton';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';

const radioOptions = [
  { label: 'This month', value: 'this_month' },
  { label: 'Previous month', value: 'previous_month' },
  { label: 'This year', value: 'this_year' },
];

const tableRows = [
  { id: 1, code: '4823', date: '03/14/2022', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { id: 2, code: '7591', date: '11/22/2021', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { id: 3, code: '3147', date: '07/30/2020', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { id: 4, code: '9265', date: '01/05/2023', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { id: 5, code: '5830', date: '09/12/2022', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
];

export default function VehicleRegistrationKey() {
  const [selected, setSelected] = useState('this_month');

  // Define table columns
  const columns: TableColumn[] = [
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'key', label: 'Key', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' }
  ];

  // Define actions
  const actions: TableAction[] = [
    {
      key: 'edit',
      label: '',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: any) => console.log('Edit registration key:', row),
      variant: 'ghost',
      className: 'text-primary hover:bg-primary/5'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <CollapsibleSection
        title="Registration & Key"
        defaultOpen={true}
        className="mx-0"
        headerClassName="bg-primary/5"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <RadioButtonGroup
            options={radioOptions}
            value={selected}
            onChange={setSelected}
            name="periodFilter"
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
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            </CustomButton>
          </div>
        </div>
        <CustomTable
          data={tableRows}
          columns={columns}
          actions={actions}
          tableBackground="transparent"
          emptyMessage="No registration & key data found"
          searchable={false}
          pagination={false}
        />
      </CollapsibleSection>
    </div>
  );
}