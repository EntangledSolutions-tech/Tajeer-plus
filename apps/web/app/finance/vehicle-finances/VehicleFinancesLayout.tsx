'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter, FileSpreadsheet, MoreHorizontal, ChevronDown, DollarSign, Wrench, Fuel, TrendingUp } from 'lucide-react';
import { toast } from '@kit/ui/sonner';
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
import { Vehicle, Customer } from './types';

// Import modal components
import AddTransactionModal from './AddTransactionModal';
import SellVehicleModal from './SellVehicleModal';
import ReturnVehicleModal from './ReturnVehicleModal';
import DeprecationModal from './DeprecationModal';
import PenaltyModal from './PenaltyModal';
import InsuranceModal from './InsuranceModal';
import MaintenanceModal from './MaintenanceModal';
import AccidentModal from './AccidentModal';

export default function VehicleFinancesLayout() {
  // HTTP service hook
  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    vehicles: false,
    customers: false,
    transactions: false,
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

  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);

  // API fetching functions
  const fetchTransactions = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      console.log('Fetching vehicle transactions...');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        search: searchTerm,
        vehicle: vehicleFilter,
        status: statusFilter,
        period: periodFilter
      });

      const response = await getRequest(`/api/finance/vehicle-transactions-list?${params}`);
      console.log('Transactions API response:', response);

      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
      } else {
        console.error('Transactions API error:', response.error);
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('An unexpected error occurred while loading transactions');
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(prev => ({ ...prev, vehicles: true }));
      console.log('Fetching vehicles...');
      const response = await getRequest('/api/vehicles?limit=100');
      console.log('Vehicles API response:', response);
      if (response.success && response.data) {
        setVehicles(response.data.vehicles || []);
      } else {
        console.error('Vehicles API error:', response.error);
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
      const response = await getRequest('/api/customers?limit=100');
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      } else {
        console.error('Customers API error:', response.error);
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

      const response = await postRequest('/api/finance/vehicle-transactions', values);

      if (response.success) {
        setIsAddModalOpen(false);
        toast.success('Service transaction created successfully!');
        console.log('Transaction created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating transaction:', response.error);
        toast.error(`Failed to create service transaction: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('An unexpected error occurred while creating the service transaction');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleSellSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/sell-vehicle', values);

      if (response.success) {
        setIsSellModalOpen(false);
        toast.success('Vehicle sale transaction created successfully!');
        console.log('Sell transaction created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating sell transaction:', response.error);
        toast.error(`Failed to create sell transaction: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating sell transaction:', error);
      toast.error('An unexpected error occurred while creating the sell transaction');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleReturnSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/return-vehicle', values);

      if (response.success) {
        setIsReturnModalOpen(false);
        toast.success('Vehicle return transaction created successfully!');
        console.log('Return transaction created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating return transaction:', response.error);
        toast.error(`Failed to create return transaction: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating return transaction:', error);
      toast.error('An unexpected error occurred while creating the return transaction');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleDeprecationSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/deprecation', values);

      if (response.success) {
        setIsDeprecationModalOpen(false);
        toast.success('Vehicle deprecation record created successfully!');
        console.log('Deprecation record created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating deprecation record:', response.error);
        toast.error(`Failed to create deprecation record: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating deprecation record:', error);
      toast.error('An unexpected error occurred while creating the deprecation record');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handlePenaltySubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/penalty', values);

      if (response.success) {
        setIsPenaltyModalOpen(false);
        toast.success('Vehicle penalty record created successfully!');
        console.log('Penalty record created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating penalty record:', response.error);
        toast.error(`Failed to create penalty record: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating penalty record:', error);
      toast.error('An unexpected error occurred while creating the penalty record');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleInsuranceSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/insurance', values);

      if (response.success) {
        setIsInsuranceModalOpen(false);
        toast.success('Vehicle insurance payment created successfully!');
        console.log('Insurance payment created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating insurance payment:', response.error);
        toast.error(`Failed to create insurance payment: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating insurance payment:', error);
      toast.error('An unexpected error occurred while creating the insurance payment');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleMaintenanceSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/maintenance', values);

      if (response.success) {
        setIsMaintenanceModalOpen(false);
        toast.success('Vehicle maintenance record created successfully!');
        console.log('Maintenance log created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating maintenance log:', response.error);
        toast.error(`Failed to create maintenance record: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      toast.error('An unexpected error occurred while creating the maintenance record');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleAccidentSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/accident', values);

      if (response.success) {
        setIsAccidentModalOpen(false);
        toast.success('Vehicle accident record created successfully!');
        console.log('Accident record created successfully');
        // Refresh transactions
        fetchTransactions();
      } else {
        console.error('Error creating accident record:', response.error);
        toast.error(`Failed to create accident record: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating accident record:', error);
      toast.error('An unexpected error occurred while creating the accident record');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
    fetchTransactions();
  }, []);

  // Refetch transactions when filters change
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, currentLimit, searchTerm, vehicleFilter, statusFilter, periodFilter]);

  const vehicleFilterOptions = [
    { value: 'All', label: 'All' },
    ...vehicles.map(vehicle => ({
      value: vehicle.id,
      label: vehicle.plate_number
    }))
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
    const matchesVehicle = vehicleFilter === 'All' || transaction.vehicleId === vehicleFilter;
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
          <CustomCard hover={false} key={index} className="bg-white" padding="default">
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
          loading={loading.transactions}
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
        customers={customers}
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