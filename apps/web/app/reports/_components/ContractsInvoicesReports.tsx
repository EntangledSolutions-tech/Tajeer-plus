'use client';

import CustomCard from '../../reusableComponents/CustomCard';

export default function ContractsInvoicesReports() {
  return (
    <div className="px-6">
      <CustomCard shadow="sm" radius="xl" padding="lg">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Contracts/Invoices Reports</h3>
          <p className="text-gray-600">This section will contain contracts and invoices reports.</p>
        </div>
      </CustomCard>
    </div>
  );
}
