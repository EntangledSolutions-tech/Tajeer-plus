'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter, FileSpreadsheet, MoreHorizontal, ChevronDown, DollarSign, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect, { SimpleSelect } from '../../reusableComponents/CustomSelect';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import SearchableSelect from '../../reusableComponents/SearchableSelect';
import { SearchBar } from '../../reusableComponents/SearchBar';
import { RadioButtonGroup } from '../../reusableComponents/RadioButtonGroup';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useHttpService } from '../../../lib/http-service';

// Interfaces
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

interface CustomerFinanceFormValues {
  amount: string;
  date: string;
  transactionType: string;
  customer: string;
  description: string;
  invoiceNumber: string;
}

// Validation schema
const CustomerFinanceSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  transactionType: Yup.string()
    .required('Transaction type is required'),
  customer: Yup.string()
    .required('Customer is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  invoiceNumber: Yup.string()
    .required('Invoice number is required')
});

export default function CustomerFinancesLayout() {
  const { getRequest, postRequest } = useHttpService();
  // State management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState({
    customers: false,
    submit: false
  });

  // Dummy data for demonstration
  const summaryCards = [
    {
      title: 'Revenue',
      value: 'SAR 12,450.00',
      icon: <DollarSign className="w-6 h-6 text-primary" />
    },
    {
      title: 'Paid',
      value: 'SAR 10,000.00',
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    },
    {
      title: 'Outstanding',
      value: 'SAR 2,450.00',
      icon: <AlertCircle className="w-6 h-6 text-primary" />
    },
    {
      title: 'Penalties',
      value: '12',
      icon: <AlertTriangle className="w-6 h-6 text-primary" />
    }
  ];

  const transactions = [
    {
      id: '1',
      date: '03/14/2022',
      transactionType: 'Contract Closure',
      customerName: 'Yaser Abdulla',
      amount: 'SAR 34,567',
      invoiceNumber: 'INV-9876',
      status: 'Unpaid',
      isPaid: false
    },
    {
      id: '2',
      date: '11/22/2021',
      transactionType: 'Contract Closure',
      customerName: 'Ahmed Khan',
      amount: 'SAR 9,876',
      invoiceNumber: 'INV-5432',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '3',
      date: '07/30/2020',
      transactionType: 'General spending',
      customerName: 'Jordan Smith',
      amount: 'SAR 34,567',
      invoiceNumber: 'INV-8765',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '4',
      date: '01/05/2023',
      transactionType: 'Tire Change',
      customerName: 'Taylor Brown',
      amount: 'SAR 12,345',
      invoiceNumber: 'INV-1122',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '5',
      date: '09/12/2022',
      transactionType: 'Penalty',
      customerName: 'Rahul Khanna',
      amount: 'SAR 67,890',
      invoiceNumber: 'INV-6789',
      status: 'Paid',
      isPaid: true
    },
    {
      id: '6',
      date: '05/19/2021',
      transactionType: 'Maintenance',
      customerName: 'Casey Wilson',
      amount: 'SAR 45,678',
      invoiceNumber: 'INV-4567',
      status: 'Unpaid',
      isPaid: false
    },
    {
      id: '7',
      date: '02/28/2023',
      transactionType: 'Penalty',
      customerName: 'Riley Martinez',
      amount: 'SAR 78,901',
      invoiceNumber: 'INV-7890',
      status: 'Unpaid',
      isPaid: false
    },
    {
      id: '8',
      date: '12/15/2020',
      transactionType: 'Contract Closure',
      customerName: 'Jamie Garcia',
      amount: 'SAR 32,210',
      invoiceNumber: 'INV-3221',
      status: 'Paid',
      isPaid: true
    }
  ];

  const [customerFilter, setCustomerFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);

  // API fetching functions
  const fetchCustomers = async () => {
    try {
      setLoading(prev => ({ ...prev, customers: true }));
      const response = await getRequest('/api/customers?limit=100');
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  // Form handlers
  const handleSubmit = async (values: CustomerFinanceFormValues) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const response = await postRequest('/api/finance/customer-transactions', values);
      if (response.success) {
        setIsAddModalOpen(false);
        console.log('Transaction created successfully');
      } else {
        throw new Error(response.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const customerFilterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Yaser Abdulla', label: 'Yaser Abdulla' },
    { value: 'Ahmed Khan', label: 'Ahmed Khan' },
    { value: 'Jordan Smith', label: 'Jordan Smith' },
    { value: 'Taylor Brown', label: 'Taylor Brown' }
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
    const matchesCustomer = customerFilter === 'All' || transaction.customerName === customerFilter;
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCustomer && matchesStatus && matchesSearch;
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
      key: 'customerName',
      label: 'Customer Name',
      type: 'text'
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
            <h1 className="text-3xl font-bold text-white">Customer Finances</h1>
            <p className="text-white/80 mt-2">
              Manage customer financial transactions and reporting
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
              <DropdownMenuItem onClick={() => setIsAddModalOpen(true)}>
                Add Transaction
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
              value={customerFilter}
              onChange={(value: string) => setCustomerFilter(value)}
              options={customerFilterOptions}
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
        title="Add new customer transaction"
        maxWidth="max-w-2xl"
      >
        <Formik
          initialValues={{
            amount: 'SAR 120.00',
            date: '03/14/2022',
            transactionType: '',
            customer: '',
            description: 'Lorem Ipsum is simply dummy text',
            invoiceNumber: 'INV-0001'
          }}
          validationSchema={CustomerFinanceSchema}
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
                      { value: 'Contract Closure', label: 'Contract Closure' },
                      { value: 'Penalty', label: 'Penalty' },
                      { value: 'Maintenance', label: 'Maintenance' },
                      { value: 'Tire Change', label: 'Tire Change' },
                      { value: 'General spending', label: 'General spending' }
                    ]}
                    error={errors.transactionType && touched.transactionType ? errors.transactionType : undefined}
                    className="w-full"
                  />

                  {/* Customer */}
                  <SearchableSelect
                    name="customer"
                    label="Customer"
                    required
                    options={customers.filter(customer => customer.is_active).map(customer => ({
                      key: customer.id,
                      id: customer.id,
                      value: customer.name,
                      subValue: `${customer.email} - ${customer.phone}`
                    }))}
                    placeholder="Select customer"
                    className="w-full"
                  />

                  {/* Invoice Number */}
                  <CustomInput
                    name="invoiceNumber"
                    label="Invoice Number"
                    type="text"
                    value={values.invoiceNumber}
                    onChange={(value: string) => setFieldValue('invoiceNumber', value)}
                    placeholder="INV-0001"
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
    </div>
  );
}
