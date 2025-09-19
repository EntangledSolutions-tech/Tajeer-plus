'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter, FileSpreadsheet, MoreHorizontal, ChevronDown, DollarSign, Wrench, Fuel, TrendingUp } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect, { SimpleSelect } from '../../reusableComponents/CustomSelect';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import { SimpleSearchableSelect } from '../../reusableComponents/SearchableSelect';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

// Interfaces
interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  is_active: boolean;
}

interface VehicleFinanceFormValues {
  amount: string;
  date: string;
  transactionType: string;
  vehicle: string;
  description: string;
  invoiceNumber: string;
}

interface SellVehicleFormValues {
  vehicle: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentType: string;
  vatIncluded: boolean;
  customerName: string;
  totalAmount: string;
  statementType: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface ReturnVehicleFormValues {
  vehicle: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentType: string;
  vatIncluded: boolean;
  customerName: string;
  totalAmount: string;
  statementType: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface DeprecationFormValues {
  vehicle: string;
  expectedSalePrice: string;
  leaseAmountIncrease: string;
}

interface PenaltyFormValues {
  vehicle: string;
  reason: string;
  date: string;
  notes: string;
  totalAmount: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface InsuranceFormValues {
  vehicle: string;
  company: string;
  policyNumber: string;
  totalAmount: string;
  totalDiscount: string;
  vat: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

interface MaintenanceFormValues {
  vehicle: string;
  maintenanceType: string;
  date: string;
  supplier: string;
  notes: string;
  totalAmount: string;
  vatIncluded: boolean;
  statementType: string;
  totalDiscount: string;
  netInvoice: string;
  totalPaid: string;
  remaining: string;
}

// Validation schema
const VehicleFinanceSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  transactionType: Yup.string()
    .required('Transaction type is required'),
  vehicle: Yup.string()
    .required('Vehicle is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required')
});

// Validation schema for sell vehicle
const SellVehicleSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required'),
  invoiceDate: Yup.date()
    .required('Invoice date is required')
    .max(new Date(), 'Date cannot be in the future'),
  paymentType: Yup.string()
    .required('Payment type is required'),
  customerName: Yup.string()
    .required('Customer name is required'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  statementType: Yup.string()
    .required('Statement type is required'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

// Validation schema for return vehicle
const ReturnVehicleSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required'),
  invoiceDate: Yup.date()
    .required('Invoice date is required')
    .max(new Date(), 'Date cannot be in the future'),
  paymentType: Yup.string()
    .required('Payment type is required'),
  customerName: Yup.string()
    .required('Customer name is required'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  statementType: Yup.string()
    .required('Statement type is required'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

// Validation schema for deprecation
const DeprecationSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  expectedSalePrice: Yup.string()
    .required('Expected sale price is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  leaseAmountIncrease: Yup.string()
    .required('Lease amount increase is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

// Validation schema for penalty
const PenaltySchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  reason: Yup.string()
    .required('Penalty reason is required'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  notes: Yup.string(),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

// Validation schema for insurance
const InsuranceSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  company: Yup.string()
    .required('Insurance company is required'),
  policyNumber: Yup.string()
    .required('Policy number is required'),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  vat: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

// Validation schema for maintenance
const MaintenanceSchema = Yup.object().shape({
  vehicle: Yup.string()
    .required('Vehicle is required'),
  maintenanceType: Yup.string()
    .required('Maintenance type is required'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  supplier: Yup.string()
    .required('Supplier is required'),
  notes: Yup.string(),
  totalAmount: Yup.string()
    .required('Total amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  statementType: Yup.string()
    .required('Statement type is required'),
  totalDiscount: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  netInvoice: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  totalPaid: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  remaining: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
});

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
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
      const response = await fetch('/api/vehicles?limit=100');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
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
  const handleSubmit = async (values: VehicleFinanceFormValues) => {
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

  const handleSellSubmit = async (values: SellVehicleFormValues) => {
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

  const handleReturnSubmit = async (values: ReturnVehicleFormValues) => {
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

  const handleDeprecationSubmit = async (values: DeprecationFormValues) => {
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

  const handlePenaltySubmit = async (values: PenaltyFormValues) => {
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

  const handleInsuranceSubmit = async (values: InsuranceFormValues) => {
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

  const handleMaintenanceSubmit = async (values: MaintenanceFormValues) => {
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
              <DropdownMenuItem onClick={() => setIsAddModalOpen(true)}>
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

      {/* Add Transaction Modal */}
      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add new vehicle transaction"
        maxWidth="max-w-2xl"
      >
        <Formik
          initialValues={{
            amount: 'SAR 1,200.00',
            date: '03/10/2022',
            transactionType: '',
            vehicle: '',
            description: 'Vehicle maintenance and repair services',
            invoiceNumber: 'INV-V001'
          }}
          validationSchema={VehicleFinanceSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <CustomInput
                    name="amount"
                    label="Amount"
                    type="text"
                    value={values.amount}
                    onChange={(value: string) => setFieldValue('amount', value)}
                    error={errors.amount && touched.amount ? errors.amount : undefined}
                    className="w-full"
                  />

                  {/* Date */}
                  <CustomInput
                    name="date"
                    label="Date"
                    type="date"
                    value={values.date}
                    onChange={(value: string) => setFieldValue('date', value)}
                    error={errors.date && touched.date ? errors.date : undefined}
                    className="w-full"
                  />

                  {/* Transaction Type */}
                  <CustomSelect
                    name="transactionType"
                    label="Transaction type"
                    value={values.transactionType}
                    onChange={(value: string) => setFieldValue('transactionType', value)}
                    options={[
                      { value: '', label: 'Select type' },
                      { value: 'Sale', label: 'Sale' },
                      { value: 'Return', label: 'Return' },
                      { value: 'Deprecation', label: 'Deprecation' },
                      { value: 'Penalty', label: 'Penalty' },
                      { value: 'Maintenance', label: 'Maintenance' },
                      { value: 'Service', label: 'Service' },
                      { value: 'Insurance', label: 'Insurance' },
                      { value: 'Accident', label: 'Accident' }
                    ]}
                    error={errors.transactionType && touched.transactionType ? errors.transactionType : undefined}
                    className="w-full"
                  />

                  {/* Vehicle */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                    <SimpleSearchableSelect
                      options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                        key: vehicle.id,
                        id: vehicle.id,
                        value: vehicle.plate_number,
                        subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                      }))}
                      value={values.vehicle}
                      onChange={(value) => setFieldValue('vehicle', value)}
                      placeholder="Select vehicle"
                      className="w-full"
                      error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                    />
                  </div>

                  {/* Invoice Number */}
                  <CustomInput
                    name="invoiceNumber"
                    label="Invoice Number"
                    type="text"
                    value={values.invoiceNumber}
                    onChange={(value: string) => setFieldValue('invoiceNumber', value)}
                    placeholder="INV-V001"
                    error={errors.invoiceNumber && touched.invoiceNumber ? errors.invoiceNumber : undefined}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="mt-6">
                  <CustomTextarea
                    name="description"
                    label="Description"
                    value={values.description}
                    onChange={(value: string) => setFieldValue('description', value)}
                    placeholder="Vehicle maintenance and repair services"
                    rows={4}
                    error={errors.description && touched.description ? errors.description : undefined}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Adding Transaction..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Transaction
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Sell Vehicle Modal */}
      <CustomModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        title="Add details to sell vehicle"
        maxWidth="max-w-4xl"
      >
        <Formik
          initialValues={{
            vehicle: '',
            invoiceNumber: 'INV-9876',
            invoiceDate: '06/04/2022',
            paymentType: 'Cash',
            vatIncluded: true,
            customerName: '',
            totalAmount: 'SAR 1.00',
            statementType: 'Sale',
            totalDiscount: 'SAR 0.00',
            vat: 'SAR 15%',
            netInvoice: 'SAR 1.15',
            totalPaid: 'SAR 0.00',
            remaining: 'SAR 0.00'
          }}
          validationSchema={SellVehicleSchema}
          onSubmit={handleSellSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                      <SimpleSearchableSelect
                        options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                          key: vehicle.id,
                          id: vehicle.id,
                          value: vehicle.plate_number,
                          subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                        }))}
                        value={values.vehicle}
                        onChange={(value) => setFieldValue('vehicle', value)}
                        placeholder="Select vehicle"
                        className="w-full"
                        error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                      />
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInput
                        name="invoiceNumber"
                        label="Invoice Number"
                        type="text"
                        value={values.invoiceNumber}
                        onChange={(value: string) => setFieldValue('invoiceNumber', value)}
                        error={errors.invoiceNumber && touched.invoiceNumber ? errors.invoiceNumber : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="invoiceDate"
                        label="Invoice Date"
                        type="date"
                        value={values.invoiceDate}
                        onChange={(value: string) => setFieldValue('invoiceDate', value)}
                        error={errors.invoiceDate && touched.invoiceDate ? errors.invoiceDate : undefined}
                        className="w-full"
                      />
                      <CustomSelect
                        name="paymentType"
                        label="Payment type"
                        value={values.paymentType}
                        onChange={(value: string) => setFieldValue('paymentType', value)}
                        options={[
                          { value: 'Cash', label: 'Cash' },
                          { value: 'Credit Card', label: 'Credit Card' },
                          { value: 'Bank Transfer', label: 'Bank Transfer' },
                          { value: 'Check', label: 'Check' }
                        ]}
                        error={errors.paymentType && touched.paymentType ? errors.paymentType : undefined}
                        className="w-full"
                      />
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">VAT</label>
                        <RadioButtonGroup
                          name="vatIncluded"
                          value={values.vatIncluded ? 'included' : 'notIncluded'}
                          onChange={(value) => setFieldValue('vatIncluded', value === 'included')}
                          options={[
                            { value: 'included', label: 'VAT included' },
                            { value: 'notIncluded', label: 'VAT not included' }
                          ]}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Customer Name</label>
                        <SimpleSearchableSelect
                          options={customers.filter(customer => customer.is_active).map(customer => ({
                            key: customer.id,
                            id: customer.id,
                            value: customer.name,
                            subValue: `${customer.email} - ${customer.phone}`
                          }))}
                          value={values.customerName}
                          onChange={(value) => setFieldValue('customerName', value)}
                          placeholder="Select Customer"
                          className="w-full"
                          error={errors.customerName && touched.customerName ? errors.customerName : undefined}
                        />
                      </div>
                      <div className="flex items-end">
                        <CustomButton variant="outline" className="border-primary text-primary hover:bg-primary/5">
                          + Add New
                        </CustomButton>
                      </div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <CustomInput
                        name="totalAmount"
                        label="Total Amount"
                        type="text"
                        value={values.totalAmount}
                        onChange={(value: string) => setFieldValue('totalAmount', value)}
                        error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                        className="w-full"
                      />
                      <CustomSelect
                        name="statementType"
                        label="Statement type"
                        value={values.statementType}
                        onChange={(value: string) => setFieldValue('statementType', value)}
                        options={[
                          { value: 'Sale', label: 'Sale' },
                          { value: 'Return', label: 'Return' },
                          { value: 'Deprecation', label: 'Deprecation' }
                        ]}
                        error={errors.statementType && touched.statementType ? errors.statementType : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalDiscount"
                        label="Total Discount"
                        type="text"
                        value={values.totalDiscount}
                        onChange={(value: string) => setFieldValue('totalDiscount', value)}
                        error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="vat"
                        label="VAT"
                        type="text"
                        value={values.vat}
                        onChange={(value: string) => setFieldValue('vat', value)}
                        error={errors.vat && touched.vat ? errors.vat : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="netInvoice"
                        label="Net Invoice"
                        type="text"
                        value={values.netInvoice}
                        onChange={(value: string) => setFieldValue('netInvoice', value)}
                        error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalPaid"
                        label="Total Paid"
                        type="text"
                        value={values.totalPaid}
                        onChange={(value: string) => setFieldValue('totalPaid', value)}
                        error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="remaining"
                        label="Remaining"
                        type="text"
                        value={values.remaining}
                        onChange={(value: string) => setFieldValue('remaining', value)}
                        error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsSellModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Adding Sales Invoice..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Sales Invoice
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Return Vehicle Modal */}
      <CustomModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Add details to return vehicle"
        maxWidth="max-w-4xl"
      >
        <Formik
          initialValues={{
            vehicle: '',
            invoiceNumber: 'INV-4876',
            invoiceDate: '06/04/2022',
            paymentType: 'Cash',
            vatIncluded: true,
            customerName: 'Alex Perrera',
            totalAmount: 'SAR 1.00',
            statementType: 'Sale',
            totalDiscount: 'SAR 0.00',
            vat: 'SAR 15%',
            netInvoice: 'SAR 1.15',
            totalPaid: 'SAR 0.00',
            remaining: 'SAR 0.00'
          }}
          validationSchema={ReturnVehicleSchema}
          onSubmit={handleReturnSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                      <SimpleSearchableSelect
                        options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                          key: vehicle.id,
                          id: vehicle.id,
                          value: vehicle.plate_number,
                          subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                        }))}
                        value={values.vehicle}
                        onChange={(value) => setFieldValue('vehicle', value)}
                        placeholder="Select vehicle"
                        className="w-full"
                        error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                      />
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInput
                        name="invoiceNumber"
                        label="Invoice Number"
                        type="text"
                        value={values.invoiceNumber}
                        onChange={(value: string) => setFieldValue('invoiceNumber', value)}
                        error={errors.invoiceNumber && touched.invoiceNumber ? errors.invoiceNumber : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="invoiceDate"
                        label="Invoice Date"
                        type="date"
                        value={values.invoiceDate}
                        onChange={(value: string) => setFieldValue('invoiceDate', value)}
                        error={errors.invoiceDate && touched.invoiceDate ? errors.invoiceDate : undefined}
                        className="w-full"
                      />
                      <CustomSelect
                        name="paymentType"
                        label="Payment type"
                        value={values.paymentType}
                        onChange={(value: string) => setFieldValue('paymentType', value)}
                        options={[
                          { value: 'Cash', label: 'Cash' },
                          { value: 'Credit Card', label: 'Credit Card' },
                          { value: 'Bank Transfer', label: 'Bank Transfer' },
                          { value: 'Check', label: 'Check' }
                        ]}
                        error={errors.paymentType && touched.paymentType ? errors.paymentType : undefined}
                        className="w-full"
                      />
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">VAT</label>
                        <RadioButtonGroup
                          name="vatIncluded"
                          value={values.vatIncluded ? 'included' : 'notIncluded'}
                          onChange={(value) => setFieldValue('vatIncluded', value === 'included')}
                          options={[
                            { value: 'included', label: 'VAT included' },
                            { value: 'notIncluded', label: 'VAT not included' }
                          ]}
                          className="mt-2"
                        />
                      </div>
                      <CustomInput
                        name="customerName"
                        label="Customer Name"
                        type="text"
                        value={values.customerName}
                        onChange={(value: string) => setFieldValue('customerName', value)}
                        error={errors.customerName && touched.customerName ? errors.customerName : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <CustomInput
                        name="totalAmount"
                        label="Total Amount"
                        type="text"
                        value={values.totalAmount}
                        onChange={(value: string) => setFieldValue('totalAmount', value)}
                        error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                        className="w-full"
                      />
                      <CustomSelect
                        name="statementType"
                        label="Statement type"
                        value={values.statementType}
                        onChange={(value: string) => setFieldValue('statementType', value)}
                        options={[
                          { value: 'Sale', label: 'Sale' },
                          { value: 'Return', label: 'Return' },
                          { value: 'Deprecation', label: 'Deprecation' }
                        ]}
                        error={errors.statementType && touched.statementType ? errors.statementType : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalDiscount"
                        label="Total Discount"
                        type="text"
                        value={values.totalDiscount}
                        onChange={(value: string) => setFieldValue('totalDiscount', value)}
                        error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="vat"
                        label="VAT"
                        type="text"
                        value={values.vat}
                        onChange={(value: string) => setFieldValue('vat', value)}
                        error={errors.vat && touched.vat ? errors.vat : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="netInvoice"
                        label="Net Invoice"
                        type="text"
                        value={values.netInvoice}
                        onChange={(value: string) => setFieldValue('netInvoice', value)}
                        error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalPaid"
                        label="Total Paid"
                        type="text"
                        value={values.totalPaid}
                        onChange={(value: string) => setFieldValue('totalPaid', value)}
                        error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="remaining"
                        label="Remaining"
                        type="text"
                        value={values.remaining}
                        onChange={(value: string) => setFieldValue('remaining', value)}
                        error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsReturnModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Adding Sales Invoice..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Sales Invoice
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Deprecation Modal */}
      <CustomModal
        isOpen={isDeprecationModalOpen}
        onClose={() => setIsDeprecationModalOpen(false)}
        title="Add Vehicle Pricing & Depreciation"
        maxWidth="max-w-2xl"
      >
        <Formik
          initialValues={{
            vehicle: '',
            expectedSalePrice: '',
            leaseAmountIncrease: ''
          }}
          validationSchema={DeprecationSchema}
          onSubmit={handleDeprecationSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-6">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                      <SimpleSearchableSelect
                        options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                          key: vehicle.id,
                          id: vehicle.id,
                          value: vehicle.plate_number,
                          subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                        }))}
                        value={values.vehicle}
                        onChange={(value) => setFieldValue('vehicle', value)}
                        placeholder="Select vehicle"
                        className="w-full"
                        error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                      />
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInput
                        name="expectedSalePrice"
                        label="Expected Sale Price"
                        type="text"
                        value={values.expectedSalePrice}
                        onChange={(value: string) => setFieldValue('expectedSalePrice', value)}
                        placeholder="Amount"
                        error={errors.expectedSalePrice && touched.expectedSalePrice ? errors.expectedSalePrice : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="leaseAmountIncrease"
                        label="Lease Amount increase in case of insurance"
                        type="text"
                        value={values.leaseAmountIncrease}
                        onChange={(value: string) => setFieldValue('leaseAmountIncrease', value)}
                        placeholder="Amount"
                        error={errors.leaseAmountIncrease && touched.leaseAmountIncrease ? errors.leaseAmountIncrease : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeprecationModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Updating Pricing..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Update Pricing
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Maintenance Modal */}
      <CustomModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Add Maintenance Log"
        maxWidth="max-w-4xl"
      >
        <Formik
          initialValues={{
            vehicle: '',
            maintenanceType: '',
            date: '',
            supplier: '',
            notes: '',
            totalAmount: 'SAR 1.00',
            vatIncluded: true,
            statementType: 'Sale',
            totalDiscount: 'SAR 0.00',
            netInvoice: 'SAR 1.15',
            totalPaid: 'SAR 0.00',
            remaining: 'SAR 0.00'
          }}
          validationSchema={MaintenanceSchema}
          onSubmit={handleMaintenanceSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                        <SimpleSearchableSelect
                          options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                            key: vehicle.id,
                            id: vehicle.id,
                            value: vehicle.plate_number,
                            subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                          }))}
                          value={values.vehicle}
                          onChange={(value) => setFieldValue('vehicle', value)}
                          placeholder="Select vehicle"
                          className="w-full"
                          error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                        />
                      </div>
                      <CustomSelect
                        name="maintenanceType"
                        label="Maintenance type"
                        value={values.maintenanceType}
                        onChange={(value: string) => setFieldValue('maintenanceType', value)}
                        options={[
                          { value: '', label: 'Select type' },
                          { value: 'Oil Change', label: 'Oil Change' },
                          { value: 'Brake Service', label: 'Brake Service' },
                          { value: 'Engine Repair', label: 'Engine Repair' },
                          { value: 'Transmission Service', label: 'Transmission Service' },
                          { value: 'Tire Replacement', label: 'Tire Replacement' },
                          { value: 'General Maintenance', label: 'General Maintenance' }
                        ]}
                        error={errors.maintenanceType && touched.maintenanceType ? errors.maintenanceType : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="date"
                        label="Date"
                        type="date"
                        value={values.date}
                        onChange={(value: string) => setFieldValue('date', value)}
                        error={errors.date && touched.date ? errors.date : undefined}
                        className="w-full"
                      />
                      <CustomSelect
                        name="supplier"
                        label="Supplier"
                        value={values.supplier}
                        onChange={(value: string) => setFieldValue('supplier', value)}
                        options={[
                          { value: '', label: 'Select supplier' },
                          { value: 'Auto Parts Co.', label: 'Auto Parts Co.' },
                          { value: 'Service Center', label: 'Service Center' },
                          { value: 'Dealership', label: 'Dealership' },
                          { value: 'Independent Mechanic', label: 'Independent Mechanic' }
                        ]}
                        error={errors.supplier && touched.supplier ? errors.supplier : undefined}
                        className="w-full"
                      />
                      <div className="md:col-span-2">
                        <CustomTextarea
                          name="notes"
                          label="Notes"
                          value={values.notes}
                          onChange={(value: string) => setFieldValue('notes', value)}
                          placeholder="Enter note"
                          rows={3}
                          error={errors.notes && touched.notes ? errors.notes : undefined}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <CustomInput
                        name="totalAmount"
                        label="Total Amount"
                        type="text"
                        value={values.totalAmount}
                        onChange={(value: string) => setFieldValue('totalAmount', value)}
                        error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                        className="w-full"
                      />
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">VAT</label>
                        <RadioButtonGroup
                          name="vatIncluded"
                          value={values.vatIncluded ? 'included' : 'notIncluded'}
                          onChange={(value) => setFieldValue('vatIncluded', value === 'included')}
                          options={[
                            { value: 'included', label: 'VAT included' },
                            { value: 'notIncluded', label: 'VAT not included' }
                          ]}
                          className="mt-2"
                        />
                      </div>
                      <CustomSelect
                        name="statementType"
                        label="Statement type"
                        value={values.statementType}
                        onChange={(value: string) => setFieldValue('statementType', value)}
                        options={[
                          { value: 'Sale', label: 'Sale' },
                          { value: 'Return', label: 'Return' },
                          { value: 'Deprecation', label: 'Deprecation' }
                        ]}
                        error={errors.statementType && touched.statementType ? errors.statementType : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalDiscount"
                        label="Total Discount"
                        type="text"
                        value={values.totalDiscount}
                        onChange={(value: string) => setFieldValue('totalDiscount', value)}
                        error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="netInvoice"
                        label="Net Invoice"
                        type="text"
                        value={values.netInvoice}
                        onChange={(value: string) => setFieldValue('netInvoice', value)}
                        error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalPaid"
                        label="Total Paid"
                        type="text"
                        value={values.totalPaid}
                        onChange={(value: string) => setFieldValue('totalPaid', value)}
                        error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="remaining"
                        label="Remaining"
                        type="text"
                        value={values.remaining}
                        onChange={(value: string) => setFieldValue('remaining', value)}
                        error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Adding Maintenance Log..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Maintenance Log
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Penalty Modal */}
      <CustomModal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        title="Add penalty"
        maxWidth="max-w-4xl"
      >
        <Formik
          initialValues={{
            vehicle: '',
            reason: '',
            date: '',
            notes: '',
            totalAmount: 'SAR 1.00',
            totalDiscount: 'SAR 0.00',
            vat: 'SAR 15%',
            netInvoice: 'SAR 1.15',
            totalPaid: 'SAR 0.00',
            remaining: 'SAR 0.00'
          }}
          validationSchema={PenaltySchema}
          onSubmit={handlePenaltySubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                      <SimpleSearchableSelect
                        options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                          key: vehicle.id,
                          id: vehicle.id,
                          value: vehicle.plate_number,
                          subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                        }))}
                        value={values.vehicle}
                        onChange={(value) => setFieldValue('vehicle', value)}
                        placeholder="Select vehicle"
                        className="w-full"
                        error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                      />
                    </div>
                  </div>

                  {/* Penalty Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Penalty details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect
                        name="reason"
                        label="Reason"
                        value={values.reason}
                        onChange={(value: string) => setFieldValue('reason', value)}
                        options={[
                          { value: '', label: 'Select penalty reason' },
                          { value: 'Late Return', label: 'Late Return' },
                          { value: 'Damage', label: 'Damage' },
                          { value: 'Traffic Violation', label: 'Traffic Violation' },
                          { value: 'Overdue Payment', label: 'Overdue Payment' },
                          { value: 'Contract Violation', label: 'Contract Violation' }
                        ]}
                        error={errors.reason && touched.reason ? errors.reason : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="date"
                        label="Date"
                        type="date"
                        value={values.date}
                        onChange={(value: string) => setFieldValue('date', value)}
                        error={errors.date && touched.date ? errors.date : undefined}
                        className="w-full"
                      />
                      <div className="md:col-span-2">
                        <CustomTextarea
                          name="notes"
                          label="Notes (optional)"
                          value={values.notes}
                          onChange={(value: string) => setFieldValue('notes', value)}
                          placeholder="Enter notes"
                          rows={3}
                          error={errors.notes && touched.notes ? errors.notes : undefined}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <CustomInput
                        name="totalAmount"
                        label="Total Amount"
                        type="text"
                        value={values.totalAmount}
                        onChange={(value: string) => setFieldValue('totalAmount', value)}
                        error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalDiscount"
                        label="Total Discount"
                        type="text"
                        value={values.totalDiscount}
                        onChange={(value: string) => setFieldValue('totalDiscount', value)}
                        error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="vat"
                        label="VAT"
                        type="text"
                        value={values.vat}
                        onChange={(value: string) => setFieldValue('vat', value)}
                        error={errors.vat && touched.vat ? errors.vat : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="netInvoice"
                        label="Net Invoice"
                        type="text"
                        value={values.netInvoice}
                        onChange={(value: string) => setFieldValue('netInvoice', value)}
                        error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalPaid"
                        label="Total Paid"
                        type="text"
                        value={values.totalPaid}
                        onChange={(value: string) => setFieldValue('totalPaid', value)}
                        error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="remaining"
                        label="Remaining"
                        type="text"
                        value={values.remaining}
                        onChange={(value: string) => setFieldValue('remaining', value)}
                        error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsPenaltyModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Adding Penalty..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Penalty
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Insurance Modal */}
      <CustomModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        title="Add insurance payment"
        maxWidth="max-w-4xl"
      >
        <Formik
          initialValues={{
            vehicle: '',
            company: '',
            policyNumber: '',
            totalAmount: 'SAR 1.00',
            totalDiscount: 'SAR 0.00',
            vat: 'SAR 15%',
            netInvoice: 'SAR 1.15',
            totalPaid: 'SAR 0.00',
            remaining: 'SAR 0.00'
          }}
          validationSchema={InsuranceSchema}
          onSubmit={handleInsuranceSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="px-8 py-6">
                <div className="space-y-8">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle details</h3>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                      <SimpleSearchableSelect
                        options={vehicles.filter(vehicle => vehicle.is_active).map(vehicle => ({
                          key: vehicle.id,
                          id: vehicle.id,
                          value: vehicle.plate_number,
                          subValue: `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                        }))}
                        value={values.vehicle}
                        onChange={(value) => setFieldValue('vehicle', value)}
                        placeholder="Select vehicle"
                        className="w-full"
                        error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                      />
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <CustomInput
                        name="totalAmount"
                        label="Total Amount"
                        type="text"
                        value={values.totalAmount}
                        onChange={(value: string) => setFieldValue('totalAmount', value)}
                        error={errors.totalAmount && touched.totalAmount ? errors.totalAmount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalDiscount"
                        label="Total Discount"
                        type="text"
                        value={values.totalDiscount}
                        onChange={(value: string) => setFieldValue('totalDiscount', value)}
                        error={errors.totalDiscount && touched.totalDiscount ? errors.totalDiscount : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="vat"
                        label="VAT"
                        type="text"
                        value={values.vat}
                        onChange={(value: string) => setFieldValue('vat', value)}
                        error={errors.vat && touched.vat ? errors.vat : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="netInvoice"
                        label="Net Invoice"
                        type="text"
                        value={values.netInvoice}
                        onChange={(value: string) => setFieldValue('netInvoice', value)}
                        error={errors.netInvoice && touched.netInvoice ? errors.netInvoice : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="totalPaid"
                        label="Total Paid"
                        type="text"
                        value={values.totalPaid}
                        onChange={(value: string) => setFieldValue('totalPaid', value)}
                        error={errors.totalPaid && touched.totalPaid ? errors.totalPaid : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="remaining"
                        label="Remaining"
                        type="text"
                        value={values.remaining}
                        onChange={(value: string) => setFieldValue('remaining', value)}
                        error={errors.remaining && touched.remaining ? errors.remaining : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Insurance Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect
                        name="company"
                        label="Company"
                        value={values.company}
                        onChange={(value: string) => setFieldValue('company', value)}
                        options={[
                          { value: '', label: 'Select company' },
                          { value: 'Tawuniya', label: 'Tawuniya' },
                          { value: 'SABB Takaful', label: 'SABB Takaful' },
                          { value: 'Malath Insurance', label: 'Malath Insurance' },
                          { value: 'AXA Cooperative', label: 'AXA Cooperative' },
                          { value: 'Allianz', label: 'Allianz' }
                        ]}
                        error={errors.company && touched.company ? errors.company : undefined}
                        className="w-full"
                      />
                      <CustomInput
                        name="policyNumber"
                        label="Policy Number"
                        type="text"
                        value={values.policyNumber}
                        onChange={(value: string) => setFieldValue('policyNumber', value)}
                        placeholder="Enter number"
                        error={errors.policyNumber && touched.policyNumber ? errors.policyNumber : undefined}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white px-8 py-6 border-t border-primary/20 flex-shrink-0">
                <div className="flex justify-end gap-4">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsInsuranceModalOpen(false)}
                    disabled={loading.submit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.submit}
                    loading={loading.submit}
                    submittingText="Adding Insurance Payment..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Insurance Payment
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>
    </div>
  );
}
