import React, { useState } from 'react';
import { Search, Filter, FileSpreadsheet } from 'lucide-react';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';
import CustomButton from '../../reusableComponents/CustomButton';

const radioOptions = [
  { label: 'This month', value: 'this_month' },
  { label: 'Previous month', value: 'previous_month' },
  { label: 'This year', value: 'this_year' },
];

const tableRows = [
  { code: '4823', date: '03/14/2022', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { code: '7591', date: '11/22/2021', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { code: '3147', date: '07/30/2020', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { code: '9265', date: '01/05/2023', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
  { code: '5830', date: '09/12/2022', key: '#TransactionKey', notes: 'Lorem Ipsum is simply dummy text' },
];

export default function VehicleRegistrationKey() {
  const [selected, setSelected] = useState('this_month');
  return (
    <div className="rounded-2xl border border-[#CDE2FF] bg-white p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <RadioButtonGroup
          options={radioOptions}
          value={selected}
          onChange={setSelected}
          name="periodFilter"
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search"
            width="w-full md:w-72"
            variant="blue-bg"
          />
          <CustomButton isSecondary size="sm" className="p-2">
            <Filter className="w-4 h-4" />
          </CustomButton>
          <CustomButton isSecondary size="sm" className="p-2">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
          </CustomButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#CDE2FF]">
              <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Key</th>
              <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Notes</th>
              <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i} className="border-b border-[#F6F9FF]">
                <td className="px-4 py-3 font-medium text-[#0065F2]">{row.code}</td>
                <td className="px-4 py-3 font-medium text-[#0065F2]">{row.date}</td>
                <td className="px-4 py-3 font-medium text-[#0065F2]">{row.key}</td>
                <td className="px-4 py-3 text-[#0065F2]">{row.notes}</td>
                <td className="px-4 py-3 font-semibold text-[#0065F2] cursor-pointer underline">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}