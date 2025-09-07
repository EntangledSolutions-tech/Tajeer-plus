import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import { SearchBar } from '../../reusableComponents/SearchBar';

const summaryCards = [
  { label: 'Net profit (SAR)', value: '39,248.72' },
  { label: 'Net Revenue (SAR)', value: '29,348.98' },
  { label: 'Total Spending (SAR)', value: '7846.84' },
  { label: 'Total Receivable (SAR)', value: '47095.89' },
];

const vehiclePricing = {
  purchaseDate: '06/04/2022',
  depreciationYears: 5,
  purchasePrice: 'SAR 24,252',
  leaseAmountIncrease: 'SAR 26,252',
};

const revenueRows = [
  { date: '03/14/2022', type: 'Contract Closure', desc: 'Lorem Ipsum text', transaction: 'Income', method: 'Cash', amount: 'SAR 23,456', invoice: 'INV-9876' },
  { date: '11/22/2021', type: 'Contract Closure', desc: 'Lorem Ipsum text', transaction: 'Income', method: 'Cash', amount: 'SAR 9,876', invoice: 'INV-5432' },
  { date: '07/30/2020', type: 'General spending', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 34,567', invoice: 'INV-8765' },
  { date: '01/05/2023', type: 'Tire Change', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 12,345', invoice: 'INV-2341' },
  { date: '09/12/2022', type: 'Maintenance', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 67,890', invoice: 'INV-6789' },
  { date: '05/19/2021', type: 'Maintenance', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 45,678', invoice: 'INV-3456' },
  { date: '02/28/2023', type: 'General spending', desc: 'Lorem Ipsum text', transaction: 'Expense', method: 'Cash', amount: 'SAR 28,901', invoice: 'INV-7890' },
  { date: '12/15/2020', type: 'Contract Closure', desc: 'Lorem Ipsum text', transaction: 'Income', method: 'Cash', amount: 'SAR 32,210', invoice: 'INV-1122' },
];

const salesRows = [
  { date: '11/22/2021', type: 'Car Return', customer: 'Jordan Taylor', price: '1.00', invoice: 'View Invoice' },
  { date: '07/30/2020', type: 'Car Sale', customer: 'Ahmed Khan', price: 'SAR 1.00', invoice: 'View Invoice' },
];

export default function VehicleFinance() {
  const [revenueTab, setRevenueTab] = useState('All');
  const [salesTab, setSalesTab] = useState('All');
  const [showRevenue, setShowRevenue] = useState(true);
  const [showSales, setShowSales] = useState(true);
  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="flex gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="flex-1 rounded-xl border border-[#CDE2FF] bg-white flex flex-col items-center py-5">
            <span className="text-2xl font-bold text-[#0065F2]">{card.value}</span>
            <span className="text-base text-[#A0B6D9] font-medium">{card.label}</span>
          </div>
        ))}
      </div>
      {/* Vehicle Pricing & Depreciation */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-6 py-4">
        <div className="font-bold text-[#0065F2] text-lg mb-4">Vehicle Pricing & Depreciation</div>
        <div className="flex gap-8">
          <div>
            <div className="text-xs text-[#A0B6D9] font-medium mb-1">Purchase Date</div>
            <div className="text-base text-[#0065F2] font-bold">{vehiclePricing.purchaseDate}</div>
          </div>
          <div>
            <div className="text-xs text-[#A0B6D9] font-medium mb-1">Number of depreciation years</div>
            <div className="text-base text-[#0065F2] font-bold">{vehiclePricing.depreciationYears}</div>
          </div>
          <div>
            <div className="text-xs text-[#A0B6D9] font-medium mb-1">Purchase Price</div>
            <div className="text-base text-[#0065F2] font-bold">{vehiclePricing.purchasePrice}</div>
          </div>
          <div>
            <div className="text-xs text-[#A0B6D9] font-medium mb-1">Lease Amount increase in case of insurance</div>
            <div className="text-base text-[#0065F2] font-bold">{vehiclePricing.leaseAmountIncrease}</div>
          </div>
        </div>
      </div>
      {/* Revenue Table Collapsible */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0">
          <button
            onClick={() => setShowRevenue(v => !v)}
            className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] bg-[#F6F9FF] py-2 px-2 w-full text-left"
          >
            <span className="text-[18px]">{showRevenue ? '▼' : '▶'}</span> Revenue
          </button>
        </div>
        {showRevenue && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2 gap-4">
              <RadioButtonGroup
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'Income', label: 'Income' },
                  { value: 'Expenses', label: 'Expenses' }
                ]}
                value={revenueTab}
                onChange={setRevenueTab}
                name="revenueFilter"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16M4 4l8 8m0 0l8-8" /></svg>
                </CustomButton>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F6F9FF]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Transaction type</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Transaction</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
                  </tr>
                </thead>
                <tbody>
                  {revenueRows
                    .filter(row => revenueTab === 'All' || row.transaction === revenueTab.slice(0, -1))
                    .map((row, i) => (
                      <tr key={i} className="border-t border-[#CDE2FF]">
                        <td className="px-4 py-3 font-medium text-[#0065F2]">{row.date}</td>
                        <td className="px-4 py-3 font-medium text-[#0065F2] cursor-pointer hover:underline">{row.type}</td>
                        <td className="px-4 py-3 text-[#0065F2]">{row.desc}</td>
                        <td className="px-4 py-3 text-[#0065F2]">{row.transaction}</td>
                        <td className="px-4 py-3 text-[#0065F2]">{row.method}</td>
                        <td className="px-4 py-3 text-[#0065F2]">{row.amount}</td>
                        <td className="px-4 py-3 font-medium text-[#0065F2] cursor-pointer hover:underline">{row.invoice}</td>
                        <td className="px-4 py-3">
                        <CustomButton isText>View Details</CustomButton>
                      </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Sales & Return Table Collapsible */}
      <div className="rounded-xl border border-[#CDE2FF] bg-white px-0 py-0 overflow-hidden">
        <div className="-mx-0">
          <button
            onClick={() => setShowSales(v => !v)}
            className="flex items-center gap-2 text-[#0065F2] font-bold text-[18px] bg-[#F6F9FF] py-2 px-2 w-full text-left"
          >
            <span className="text-[18px]">{showSales ? '▼' : '▶'}</span> Sales & Return
          </button>
        </div>
        {showSales && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2 gap-4">
              <RadioButtonGroup
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'Sale', label: 'Sale' },
                  { value: 'Return', label: 'Return' }
                ]}
                value={salesTab}
                onChange={setSalesTab}
                name="salesFilter"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16M4 4l8 8m0 0l8-8" /></svg>
                </CustomButton>
                <CustomButton variant="primary" className="ml-2">
                  Sell Car
                </CustomButton>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F6F9FF]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0065F2]"></th>
                  </tr>
                </thead>
                <tbody>
                  {salesRows
                    .filter(row => salesTab === 'All' || row.type === salesTab)
                    .map((row, i) => (
                      <tr key={i} className="border-t border-[#CDE2FF]">
                        <td className="px-4 py-3 font-medium text-[#0065F2]">{row.date}</td>
                        <td className="px-4 py-3 font-medium text-[#0065F2] cursor-pointer hover:underline">{row.type}</td>
                        <td className="px-4 py-3 text-[#0065F2]">{row.customer}</td>
                        <td className="px-4 py-3 text-[#0065F2]">{row.price}</td>
                        <td className="px-4 py-3 font-semibold text-[#0065F2] cursor-pointer hover:underline">{row.invoice}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}