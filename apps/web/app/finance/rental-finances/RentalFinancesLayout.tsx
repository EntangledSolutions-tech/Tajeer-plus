'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter, FileSpreadsheet, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
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
interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
}

interface Vehicle {
  id: string;
  plate_number: string;
  make: { name: string };
  model: { name: string };
  make_year: string;
}

interface Contract {
  id: string;
  contract_number: string;
  customer_name: string;
  start_date: string;
  end_date: string;
}

interface ExpenseFormValues {
  amount: string;
  date: string;
  transactionType: string;
  vehicle: string;
  branch: string;
  employee: string;
  description: string;
}

interface IncomeFormValues {
  amount: string;
  date: string;
  transactionType: string;
  contract: string;
  branch: string;
  vehicle: string;
  employee: string;
  description: string;
}

// Validation schemas
const ExpenseSchema = Yup.object().shape({
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
  branch: Yup.string()
    .required('Branch is required'),
  employee: Yup.string()
    .required('Employee name is required')
    .min(2, 'Employee name must be at least 2 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
});

const IncomeSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  transactionType: Yup.string()
    .required('Transaction type is required'),
  contract: Yup.string()
    .required('Contract is required'),
  branch: Yup.string()
    .required('Branch is required'),
  vehicle: Yup.string()
    .required('Vehicle is required'),
  employee: Yup.string()
    .required('Employee name is required')
    .min(2, 'Employee name must be at least 2 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
});

export default function RentalFinancesLayout() {
  // State management
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState({
    branches: false,
    vehicles: false,
    contracts: false,
    expenseSubmit: false,
    incomeSubmit: false
  });

  // Dummy data for demonstration
  const summaryCards = [
    {
      title: 'Revenue',
      value: 'SAR 12,450.00',
      icon: <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">$</span>
      </div>
    },
    {
      title: 'Expenses',
      value: 'SAR 10,000.00',
      icon: <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">↗</span>
      </div>
    },
    {
      title: 'Net Balance',
      value: 'SAR 2,450.00',
      icon: <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">~</span>
      </div>
    }
  ];

  const transactions = [
    {
      id: '1',
      date: '03/14/2022',
      transaction: 'Income',
      type: 'Contract Closure',
      description: 'Lorem Ipsum text',
      amount: 'SAR 23,456',
      isIncome: true
    },
    {
      id: '2',
      date: '11/22/2021',
      transaction: 'Income',
      type: 'Contract Closure',
      description: 'Lorem Ipsum text',
      amount: 'SAR 9,876',
      isIncome: true
    },
    {
      id: '3',
      date: '07/30/2020',
      transaction: 'Expense',
      type: 'General spending',
      description: 'Lorem Ipsum text',
      amount: 'SAR 34,567',
      isIncome: false
    },
    {
      id: '4',
      date: '01/05/2023',
      transaction: 'Expense',
      type: 'Tire Change',
      description: 'Lorem Ipsum text',
      amount: 'SAR 12,345',
      isIncome: false
    },
    {
      id: '5',
      date: '09/12/2022',
      transaction: 'Expense',
      type: 'Maintenance',
      description: 'Lorem Ipsum text',
      amount: 'SAR 67,890',
      isIncome: false
    }
  ];

  const [transactionFilter, setTransactionFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentLimit, setCurrentLimit] = React.useState(10);

  // API fetching functions
  const fetchBranches = async () => {
    try {
      setLoading(prev => ({ ...prev, branches: true }));
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(prev => ({ ...prev, branches: false }));
    }
  };

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

  const fetchContracts = async () => {
    try {
      setLoading(prev => ({ ...prev, contracts: true }));
      const response = await fetch('/api/contracts?limit=100');
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(prev => ({ ...prev, contracts: false }));
    }
  };

  // Form handlers
  const handleExpenseSubmit = async (values: ExpenseFormValues) => {
    try {
      setLoading(prev => ({ ...prev, expenseSubmit: true }));

      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      setIsExpenseModalOpen(false);
      // Refresh data or show success message
      console.log('Expense created successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setLoading(prev => ({ ...prev, expenseSubmit: false }));
    }
  };

  const handleIncomeSubmit = async (values: IncomeFormValues) => {
    try {
      setLoading(prev => ({ ...prev, incomeSubmit: true }));

      const response = await fetch('/api/finance/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create income');
      }

      setIsIncomeModalOpen(false);
      // Refresh data or show success message
      console.log('Income created successfully');
    } catch (error) {
      console.error('Error creating income:', error);
    } finally {
      setLoading(prev => ({ ...prev, incomeSubmit: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBranches();
    fetchVehicles();
    fetchContracts();
  }, []);

  const filterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = transactionFilter === 'All' || transaction.transaction === transactionFilter;
    const matchesSearch = searchTerm === '' ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns: TableColumn[] = [
    {
      key: 'date',
      label: 'Date',
      type: 'text'
    },
    {
      key: 'transaction',
      label: 'Transaction',
      type: 'text',
      render: (value: string, row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isIncome
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Transaction type',
      type: 'text'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text'
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text',
      render: (value: string, row: any) => (
        <span className={row.isIncome ? 'text-green-600' : 'text-red-600'}>
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
      className: 'text-primary',
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
            <h1 className="text-3xl font-bold text-white">Rental Company Finances</h1>
            <p className="text-white/80 mt-2">
              Manage rental company financial transactions and reporting
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
              <DropdownMenuItem onClick={() => setIsExpenseModalOpen(true)}>
                Expense
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsIncomeModalOpen(true)}>
                Income
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <RadioButtonGroup
            options={filterOptions}
            value={transactionFilter}
            onChange={setTransactionFilter}
            name="transactionFilter"
            className="flex gap-4"
          />
          <div className="flex items-center gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Q Search"
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

      {/* Expense Modal */}
      <CustomModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Add new company expense"
        maxWidth="max-w-2xl"
      >
        <Formik
          initialValues={{
            amount: 'SAR 120.00',
            date: '03/14/2022',
            transactionType: '',
            vehicle: '',
            branch: '',
            employee: '',
            description: 'Lorem Ipsum is simply dummy text'
          }}
          validationSchema={ExpenseSchema}
          onSubmit={handleExpenseSubmit}
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
                      { value: 'Maintenance', label: 'Maintenance' },
                      { value: 'Fuel', label: 'Fuel' },
                      { value: 'Insurance', label: 'Insurance' },
                      { value: 'Repair', label: 'Repair' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    error={errors.transactionType && touched.transactionType ? errors.transactionType : undefined}
                    className="w-full"
                  />

                  {/* Vehicle */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                    <SimpleSearchableSelect
                      options={vehicles.map(vehicle => ({
                        key: vehicle.id,
                        id: vehicle.id,
                        value: vehicle.plate_number,
                        subValue: `${vehicle.make.name} ${vehicle.model.name} ${vehicle.make_year}`
                      }))}
                      value={values.vehicle}
                      onChange={(value) => setFieldValue('vehicle', value)}
                      placeholder="Select vehicle"
                      className="w-full"
                      error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Branch</label>
                    <SimpleSearchableSelect
                      options={branches.filter(branch => branch.is_active).map(branch => ({
                        key: branch.id,
                        id: branch.id,
                        value: branch.name,
                        subValue: `${branch.code}${branch.address ? ` - ${branch.address}` : ''}`
                      }))}
                      value={values.branch}
                      onChange={(value) => setFieldValue('branch', value)}
                      placeholder="Select branch"
                      className="w-full"
                      error={errors.branch && touched.branch ? errors.branch : undefined}
                    />
                  </div>

                  {/* Employee */}
                  <CustomInput
                    name="employee"
                    label="Employee"
                    type="text"
                    value={values.employee}
                    onChange={(value: string) => setFieldValue('employee', value)}
                    placeholder="Enter employee name"
                    error={errors.employee && touched.employee ? errors.employee : undefined}
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
                    placeholder="Lorem Ipsum is simply dummy text"
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
                    onClick={() => setIsExpenseModalOpen(false)}
                    disabled={loading.expenseSubmit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.expenseSubmit}
                    loading={loading.expenseSubmit}
                    submittingText="Adding Expense..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Expense
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Income Modal */}
      <CustomModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Add new company income"
        maxWidth="max-w-2xl"
      >
        <Formik
          initialValues={{
            amount: 'SAR 120.00',
            date: '03/14/2022',
            transactionType: '',
            contract: '',
            branch: '',
            vehicle: '',
            employee: '',
            description: 'Lorem Ipsum is simply dummy text'
          }}
          validationSchema={IncomeSchema}
          onSubmit={handleIncomeSubmit}
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
                      { value: 'Contract Closure', label: 'Contract Closure' },
                      { value: 'Rental Payment', label: 'Rental Payment' },
                      { value: 'Late Fee', label: 'Late Fee' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    error={errors.transactionType && touched.transactionType ? errors.transactionType : undefined}
                    className="w-full"
                  />

                  {/* Contract */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Contract</label>
                    <SimpleSearchableSelect
                      options={contracts.map(contract => ({
                        key: contract.id,
                        id: contract.id,
                        value: contract.contract_number,
                        subValue: `${contract.customer_name} - ${contract.start_date} to ${contract.end_date}`
                      }))}
                      value={values.contract}
                      onChange={(value) => setFieldValue('contract', value)}
                      placeholder="Select contract"
                      className="w-full"
                      error={errors.contract && touched.contract ? errors.contract : undefined}
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Branch</label>
                    <SimpleSearchableSelect
                      options={branches.filter(branch => branch.is_active).map(branch => ({
                        key: branch.id,
                        id: branch.id,
                        value: branch.name,
                        subValue: `${branch.code}${branch.address ? ` - ${branch.address}` : ''}`
                      }))}
                      value={values.branch}
                      onChange={(value) => setFieldValue('branch', value)}
                      placeholder="Select branch"
                      className="w-full"
                      error={errors.branch && touched.branch ? errors.branch : undefined}
                    />
                  </div>

                  {/* Vehicle */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Vehicle</label>
                    <SimpleSearchableSelect
                      options={vehicles.map(vehicle => ({
                        key: vehicle.id,
                        id: vehicle.id,
                        value: vehicle.plate_number,
                        subValue: `${vehicle.make.name} ${vehicle.model.name} ${vehicle.make_year}`
                      }))}
                      value={values.vehicle}
                      onChange={(value) => setFieldValue('vehicle', value)}
                      placeholder="Select vehicle"
                      className="w-full"
                      error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                    />
                  </div>

                  {/* Employee */}
                  <CustomInput
                    name="employee"
                    label="Employee"
                    type="text"
                    value={values.employee}
                    onChange={(value: string) => setFieldValue('employee', value)}
                    placeholder="Enter employee name"
                    error={errors.employee && touched.employee ? errors.employee : undefined}
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
                    placeholder="Lorem Ipsum is simply dummy text"
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
                    onClick={() => setIsIncomeModalOpen(false)}
                    disabled={loading.incomeSubmit}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    disabled={loading.incomeSubmit}
                    loading={loading.incomeSubmit}
                    submittingText="Adding Income..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Income
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
