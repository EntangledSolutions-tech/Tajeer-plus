'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomSelect from '../../reusableComponents/CustomSelect';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import SearchableSelect, { SimpleSearchableSelect } from '../../reusableComponents/SearchableSelect';

// Validation schema for expense form
const ExpenseSchema = Yup.object({
  amount: Yup.string().required('Amount is required'),
  date: Yup.string().required('Date is required'),
  transactionType: Yup.string().required('Transaction type is required'),
  vehicle: Yup.string().required('Vehicle is required'),
  branch: Yup.string().required('Branch is required'),
  employee: Yup.string().required('Employee is required'),
  description: Yup.string().required('Description is required'),
});

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  vehicles: any[];
  branches: any[];
  loading: boolean;
}

interface TransactionType {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  branches,
  loading,
}) => {
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [loadingTransactionTypes, setLoadingTransactionTypes] = useState(false);

  // Fetch transaction types on component mount
  useEffect(() => {
    const fetchTransactionTypes = async () => {
      try {
        setLoadingTransactionTypes(true);
        const response = await fetch('/api/finance/transaction-types?category=expense');
        if (response.ok) {
          const data = await response.json();
          setTransactionTypes(data.transactionTypes || []);
        }
      } catch (error) {
        console.error('Error fetching transaction types:', error);
      } finally {
        setLoadingTransactionTypes(false);
      }
    };

    if (isOpen) {
      fetchTransactionTypes();
    }
  }, [isOpen]);
  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      console.log('Expense form submitting with values:', values);

      // Call the API to create expense transaction
      const response = await fetch('/api/finance/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create expense transaction');
      }

      const result = await response.json();
      console.log('Expense transaction created:', result);

      // Call the parent onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(values);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      // You might want to show an error message to the user here
      alert(`Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add new company expense"
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={{
          amount: 0,
          date: '03/14/2022',
          transactionType: '',
          vehicle: '',
          branch: '',
          employee: '',
          description: 'Lorem Ipsum is simply dummy text'
        }}
        validationSchema={ExpenseSchema}
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
                  type="number"
                  isCurrency
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
                <SearchableSelect
                  name="transactionType"
                  label="Transaction type"
                  required
                  options={transactionTypes.map(type => ({
                    key: type.id,
                    id: type.id,
                    value: type.name,
                    subValue: type.description || type.code
                  }))}
                  placeholder="Select transaction type"
                  className="w-full"
                  disabled={loadingTransactionTypes}
                />

                {/* Vehicle */}
                <SimpleSearchableSelect
                  options={vehicles.map(vehicle => ({
                    key: vehicle.id,
                    id: vehicle.id,
                    value: vehicle.plate_number,
                    subValue: `${vehicle.make.name} ${vehicle.model.name} ${vehicle.make_year}`
                  }))}
                  label="Vehicle"
                  value={values.vehicle}
                  onChange={(value: string | string[]) => setFieldValue('vehicle', value as string)}
                  placeholder="Select vehicle"
                  className="w-full"
                  error={errors.vehicle && touched.vehicle ? errors.vehicle : undefined}
                />

                {/* Branch */}
                <SimpleSearchableSelect
                  options={branches.filter(branch => branch.is_active).map(branch => ({
                    key: branch.id,
                    id: branch.id,
                    value: branch.name,
                    subValue: `${branch.code}${branch.address ? ` - ${branch.address}` : ''}`
                  }))}
                  label="Branch"
                  value={values.branch}
                  onChange={(value: string | string[]) => setFieldValue('branch', value as string)}
                  placeholder="Select branch"
                  className="w-full"
                  error={errors.branch && touched.branch ? errors.branch : undefined}
                />

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
                  onClick={onClose}
                  disabled={loading}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  loading={loading}
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
  );
};
