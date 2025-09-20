'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter, FileSpreadsheet, MoreHorizontal, ChevronDown, DollarSign, Wrench, Fuel, TrendingUp } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { SimpleSelect } from '../../reusableComponents/CustomSelect';
import { SearchBar } from '../../reusableComponents/SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useHttpService } from '../../../lib/http-service';

// Import modal components
import AddTransactionModal from './AddTransactionModal';
import SellVehicleModal from './SellVehicleModal';
import ReturnVehicleModal from './ReturnVehicleModal';
import DeprecationModal from './DeprecationModal';
import PenaltyModal from './PenaltyModal';
import InsuranceModal from './InsuranceModal';
import MaintenanceModal from './MaintenanceModal';
import AccidentModal from './AccidentModal';

// Interfaces
interface Vehicle {
  id: string;
  plate_number: string;
  make: {
    name: string;
  };
  model: {
    name: string;
  };
  make_year?: number;
  year?: number;
  status: {
    name: string;
    color: string;
  };
}

interface Customer {
  id: string;
  name: string;
  mobile: string;
  id_number: string;
  status: string;
}

export default function VehicleFinancesLayout() {
  // State management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDeprecationModalOpen, setIsDeprecationModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState({
    vehicles: false,
    customers: false,
    submit: false
  });

  // Dummy data for demonstration
  const summaryCards = [
    {
      title: 'Total Revenue',
      value: 'SAR 45,678.00',
      icon: <DollarSign className="w-6 h-6 text-primary" />
    },
    {
      title: 'Maintenance Costs',
      value: 'SAR 12,345.00',
      icon: <Wrench className="w-6 h-6 text-primary" />
    },
    {
      title: 'Fuel Expenses',
      value: 'SAR 8,900.00',
      icon: <Fuel className="w-6 h-6 text-primary" />
    },
    {
      title: 'Net Profit',
      value: 'SAR 24,433.00',
      icon: <TrendingUp className="w-6 h-6 text-primary" />
    }
  ];

  const transactions = [
    {
      id: '1',
      date: '03/14/2022',
      transactionType: 'Sell',
      vehiclePlate: 'ABC-1234',
      vehicleInfo: 'Toyota Camry 2020',
      amount: 'SAR 2,500',
      invoiceNumber: 'INV-V001',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '2',
      date: '03/10/2022',
      transactionType: 'Maintenance',
      vehiclePlate: 'XYZ-5678',
      vehicleInfo: 'Honda Accord 2019',
      amount: 'SAR 1,200',
      invoiceNumber: 'INV-V002',
      status: 'Unpaid',
      isPaid: false
    },
    {
      id: '3',
      date: '03/08/2022',
      transactionType: 'Service',
      vehiclePlate: 'DEF-9012',
      vehicleInfo: 'Nissan Altima 2021',
      amount: 'SAR 450',
      invoiceNumber: 'INV-V003',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '4',
      date: '03/05/2022',
      transactionType: 'Insurance',
      vehiclePlate: 'GHI-3456',
      vehicleInfo: 'Hyundai Elantra 2020',
      amount: 'SAR 1,800',
      invoiceNumber: 'INV-V004',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '5',
      date: '03/02/2022',
      transactionType: 'Penalty',
      vehiclePlate: 'JKL-7890',
      vehicleInfo: 'Kia Optima 2019',
      amount: 'SAR 3,200',
      invoiceNumber: 'INV-V005',
      status: 'Unpaid',
      isPaid: false
    },
    {
      id: '6',
      date: '02/28/2022',
      transactionType: 'Accident',
      vehiclePlate: 'MNO-2468',
      vehicleInfo: 'Mazda 6 2021',
      amount: 'SAR 2,200',
      invoiceNumber: 'INV-V006',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '7',
      date: '02/25/2022',
      transactionType: 'Deprecation',
      vehiclePlate: 'PQR-1357',
      vehicleInfo: 'Subaru Legacy 2020',
      amount: 'SAR 850',
      invoiceNumber: 'INV-V007',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '8',
      date: '02/22/2022',
      transactionType: 'Return',
      vehiclePlate: 'STU-9753',
      vehicleInfo: 'Volkswagen Passat 2019',
      amount: 'SAR 1,950',
      invoiceNumber: 'INV-V008',
      status: 'Unpaid',
      isPaid: false
    }
  ];

  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);

  // API fetching functions
  const fetchVehicles = async () => {
    try {
      setLoading(prev => ({ ...prev, vehicles: true }));
      console.log('Fetching vehicles...');
      const response = await fetch('/api/vehicles?limit=100');
      console.log('Vehicles response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Vehicles API response:', data);
        setVehicles(data.vehicles || []);
      } else {
        const errorData = await response.json();
        console.error('Vehicles API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(prev => ({ ...prev, customers: true }));
      const response = await fetch('/api/customers?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  // Form handlers
  const handleSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/vehicle-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      setIsAddModalOpen(false);
      console.log('Transaction created successfully');
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleSellSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/sell-vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create sell transaction');
      }

      setIsSellModalOpen(false);
      console.log('Sell transaction created successfully');
    } catch (error) {
      console.error('Error creating sell transaction:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleReturnSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/return-vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create return transaction');
      }

      setIsReturnModalOpen(false);
      console.log('Return transaction created successfully');
    } catch (error) {
      console.error('Error creating return transaction:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleDeprecationSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/deprecation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create deprecation record');
      }

      setIsDeprecationModalOpen(false);
      console.log('Deprecation record created successfully');
    } catch (error) {
      console.error('Error creating deprecation record:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handlePenaltySubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/penalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create penalty record');
      }

      setIsPenaltyModalOpen(false);
      console.log('Penalty record created successfully');
    } catch (error) {
      console.error('Error creating penalty record:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleInsuranceSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create insurance payment');
      }

      setIsInsuranceModalOpen(false);
      console.log('Insurance payment created successfully');
    } catch (error) {
      console.error('Error creating insurance payment:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleMaintenanceSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create maintenance log');
      }

      setIsMaintenanceModalOpen(false);
      console.log('Maintenance log created successfully');
    } catch (error) {
      console.error('Error creating maintenance log:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleAccidentSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await fetch('/api/finance/accident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create accident record');
      }

      setIsAccidentModalOpen(false);
      console.log('Accident record created successfully');
    } catch (error) {
      console.error('Error creating accident record:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, []);

  const vehicleFilterOptions = [
    { value: 'All', label: 'All' },
    { value: 'ABC-1234', label: 'ABC-1234' },
    { value: 'XYZ-5678', label: 'XYZ-5678' },
    { value: 'DEF-9012', label: 'DEF-9012' },
    { value: 'GHI-3456', label: 'GHI-3456' }
  ];

  const periodFilterOptions = [
    { value: 'All', label: 'All' },
    { value: 'This Month', label: 'This Month' },
    { value: 'Last Month', label: 'Last Month' },
    { value: 'This Year', label: 'This Year' },
    { value: 'Last Year', label: 'Last Year' }
  ];

  const statusFilterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Unpaid', label: 'Unpaid' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesVehicle = vehicleFilter === 'All' || transaction.vehiclePlate === vehicleFilter;
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      transaction.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVehicle && matchesStatus && matchesSearch;
  });

  const columns: TableColumn[] = [
    {
      key: 'date',
      label: 'Date',
      type: 'text'
    },
    {
      key: 'transactionType',
      label: 'Transaction type',
      type: 'text'
    },
    {
      key: 'vehiclePlate',
      label: 'Vehicle',
      type: 'text',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.vehicleInfo}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text'
    },
    {
      key: 'invoiceNumber',
      label: 'Linked Invoice',
      type: 'text',
      render: (value: string) => (
        <span className="text-primary underline cursor-pointer hover:text-primary/80">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'text',
      render: (value: string, row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isPaid
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <span>→</span>,
      variant: 'ghost',
      onClick: (row) => {
        console.log('View details for:', row.id);
      },
      className: 'text-primary underline',
      iconPosition: 'right'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/finance" className="text-white font-medium text-sm hover:text-blue-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Vehicle Finances</h1>
            <p className="text-white/80 mt-2">
              Manage vehicle financial transactions and reporting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CustomButton variant="primary" className="bg-transparent text-white border border-white hover:bg-white hover:text-primary hover:border-white">
                <Plus className="w-4 h-4 mr-2" />
                Add
                <ChevronDown className="w-4 h-4 ml-2" />
              </CustomButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsSellModalOpen(true)}>
                Sell
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsReturnModalOpen(true)}>
                Return
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeprecationModalOpen(true)}>
                Deprecation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPenaltyModalOpen(true)}>
                Penalty
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsMaintenanceModalOpen(true)}>
                Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddModalOpen(true)}>
                Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsInsuranceModalOpen(true)}>
                Insurance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAccidentModalOpen(true)}>
                Accident
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <CustomCard key={index} className="bg-white" padding="default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="text-primary">
                  {card.icon}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-bold text-gray-800">
                  {card.value}
                </div>
                <div className="text-sm text-primary font-medium">
                  {card.title}
                </div>
              </div>
            </div>
          </CustomCard>
        ))}
      </div>

      {/* Transactions Table */}
      <CustomCard shadow="sm" radius="xl" padding="none" className="overflow-hidden">
        {/* Filters and Search */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <SimpleSelect
              value={vehicleFilter}
              onChange={(value: string) => setVehicleFilter(value)}
              options={vehicleFilterOptions}
              className="w-32"
            />
            <SimpleSelect
              value={periodFilter}
              onChange={(value: string) => setPeriodFilter(value)}
              options={periodFilterOptions}
              className="w-32"
            />
            <SimpleSelect
              value={statusFilter}
              onChange={(value: string) => setStatusFilter(value)}
              options={statusFilterOptions}
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search"
              width="w-72"
              variant="white-bg"
            />
            <CustomButton isSecondary size="sm" className="p-2">
              <Filter className="w-5 h-5 text-primary" />
            </CustomButton>
            <CustomButton isSecondary size="sm" className="p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </CustomButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CustomButton isSecondary size="sm" className="p-2">
                  <MoreHorizontal className="w-5 h-5 text-primary" />
                </CustomButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuItem>Print Report</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CustomTable
          data={filteredTransactions}
          columns={columns}
          actions={actions}
          loading={false}
          emptyMessage="No transactions found"
          tableBackground="transparent"
          searchable={false}
          pagination={true}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredTransactions.length / currentLimit)}
          onPageChange={setCurrentPage}
          currentLimit={currentLimit}
          onLimitChange={setCurrentLimit}
        />
      </CustomCard>

      {/* Modal Components */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />

      <SellVehicleModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSubmit={handleSellSubmit}
        vehicles={vehicles}
        customers={customers}
        loading={loading.submit}
      />

      <ReturnVehicleModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleReturnSubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />

      <DeprecationModal
        isOpen={isDeprecationModalOpen}
        onClose={() => setIsDeprecationModalOpen(false)}
        onSubmit={handleDeprecationSubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />

      <PenaltyModal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        onSubmit={handlePenaltySubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />

      <InsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        onSubmit={handleInsuranceSubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />

      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSubmit={handleMaintenanceSubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />

      <AccidentModal
        isOpen={isAccidentModalOpen}
        onClose={() => setIsAccidentModalOpen(false)}
        onSubmit={handleAccidentSubmit}
        vehicles={vehicles}
        loading={loading.submit}
      />
    </div>
  );
}