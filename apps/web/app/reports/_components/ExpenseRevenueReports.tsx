'use client';

import CustomCard from '../../reusableComponents/CustomCard';

export default function ExpenseRevenueReports() {
  return (
    <div className="px-6">
      <CustomCard shadow="sm" radius="xl" padding="lg">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Expense/Revenue Reports</h3>
          <p className="text-gray-600">This section will contain expense and revenue reports.</p>
        </div>
      </CustomCard>
    </div>
  );
}
