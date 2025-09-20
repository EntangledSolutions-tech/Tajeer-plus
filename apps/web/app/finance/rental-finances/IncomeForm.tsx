'use client';

import { Form, Formik, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useHttpService } from '../../../lib/http-service';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomInput from '../../reusableComponents/CustomInput';
import CustomModal from '../../reusableComponents/CustomModal';
import CustomTextarea from '../../reusableComponents/CustomTextarea';
import SearchableSelect from '../../reusableComponents/SearchableSelect';

// Validation schema for income form
const IncomeSchema = Yup.object({
  amount: Yup.string().required('Amount is required'),
  date: Yup.string().required('Date is required'),
  transactionType: Yup.string().required('Transaction type is required'),
  contract: Yup.string().required('Contract is required'),
  branch: Yup.string().required('Branch is required'),
  vehicle: Yup.string().required('Vehicle is required'),
  employee: Yup.string().required('Employee is required'),
  description: Yup.string().required('Description is required'),
});

interface IncomeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  vehicles: any[];
  branches: any[];
  contracts: any[];
  loading: boolean;
  // Edit mode props
  isEdit?: boolean;
  initialValues?: any;
  transactionId?: string;
}

interface TransactionType {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
}

// Component to handle initial values inside Formik context
const InitialValuesHandler: React.FC<{
  isEdit: boolean;
  initialValues: any;
  transactionTypes: TransactionType[];
  vehicles: any[];
  branches: any[];
  contracts: any[];
}> = ({ isEdit, initialValues, transactionTypes, vehicles, branches, contracts }) => {
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    const handleInitialValues = async () => {
      // Handle transaction type
      if (initialValues?.transactionType && transactionTypes.length > 0) {
        const transactionTypeOption = transactionTypes.find(type => type.id === initialValues.transactionType);
        if (transactionTypeOption && transactionTypeOption.id !== initialValues.transactionType) {
          console.log('Setting transaction type:', transactionTypeOption.id);
          setFieldValue('transactionType', transactionTypeOption.id);
        }
      }

      // Handle vehicle
      if (initialValues?.vehicle && vehicles.length > 0) {
        const vehicleOption = vehicles.find(vehicle => vehicle.id === initialValues.vehicle);
        if (vehicleOption && vehicleOption.id !== initialValues.vehicle) {
          console.log('Setting vehicle:', vehicleOption.id);
          setFieldValue('vehicle', vehicleOption.id);
        }
      }

      // Handle branch
      if (initialValues?.branch && branches.length > 0) {
        const branchOption = branches.find(branch => branch.id === initialValues.branch);
        if (branchOption && branchOption.id !== initialValues.branch) {
          console.log('Setting branch:', branchOption.id);
          setFieldValue('branch', branchOption.id);
        }
      }

      // Handle contract
      if (initialValues?.contract && contracts.length > 0) {
        const contractOption = contracts.find(contract => contract.id === initialValues.contract);
        if (contractOption && contractOption.id !== initialValues.contract) {
          console.log('Setting contract:', contractOption.id);
          setFieldValue('contract', contractOption.id);
        }
      }
    };

    if (isEdit && initialValues) {
      handleInitialValues();
    }
  }, [isEdit, initialValues, transactionTypes, vehicles, branches, contracts, setFieldValue]);

  return null; // This component doesn't render anything
};

export const IncomeForm: React.FC<IncomeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  branches,
  contracts,
  loading,
  isEdit = false,
  initialValues,
  transactionId,
}) => {
  console.log('IncomeForm props:', { isOpen, isEdit, initialValues, transactionId });
  console.log('IncomeForm initialValues details:', {
    transactionType: initialValues?.transactionType,
    contract: initialValues?.contract,
    branch: initialValues?.branch,
    vehicle: initialValues?.vehicle,
    employee: initialValues?.employee,
  });
  console.log('IncomeForm isOpen:', isOpen, 'isEdit:', isEdit);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [loadingTransactionTypes, setLoadingTransactionTypes] = useState(false);
  const { getRequest, postRequest, putRequest } = useHttpService();

  // Fetch transaction types on component mount
  useEffect(() => {
    const fetchTransactionTypes = async () => {
      try {
        setLoadingTransactionTypes(true);
        const response = await getRequest('/api/finance/transaction-types?category=income');

        if (response.success && response.data) {
          setTransactionTypes(response.data.transactionTypes || []);
        } else {
          console.error('Error fetching transaction types:', response.error);
          if (response.error) {
            alert(`Error loading transaction types: ${response.error}`);
          }
        }
      } catch (error) {
        console.error('Error fetching transaction types:', error);
        alert('Failed to load transaction types');
      } finally {
        setLoadingTransactionTypes(false);
      }
    };

    if (isOpen) {
      fetchTransactionTypes();
    }
  }, [isOpen, getRequest]);

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      console.log('Income form submitting with values:', values);

      // Determine API endpoint and method based on edit mode
      const url = isEdit && transactionId
        ? `/api/finance/income/${transactionId}`
        : '/api/finance/income';
      const method = isEdit ? 'PUT' : 'POST';

      // Call the API to create or update income transaction
      let response;
      if (isEdit) {
        response = await putRequest(url, values);
      } else {
        response = await postRequest(url, values);
      }

      if (response.success) {
        console.log(`Income transaction ${isEdit ? 'updated' : 'created'}:`, response.data);

        // Call the parent onSubmit callback if provided
        if (onSubmit) {
          await onSubmit(values);
        }

        resetForm();
        onClose();
      } else {
        throw new Error(response.error || `Failed to ${isEdit ? 'update' : 'create'} income transaction`);
      }
    } catch (error) {
      console.error('Error submitting income:', error);
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
      title={isEdit ? "Edit Income" : "Add new company income"}
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={isEdit && initialValues ? initialValues : {
          amount: 0,
          date: '03/14/2022',
          transactionType: '',
          contract: '',
          branch: '',
          vehicle: '',
          employee: '',
          description: 'Lorem Ipsum is simply dummy text'
        }}
        validationSchema={IncomeSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => {
          console.log('Formik values:', values);
          return (
          <Form>
            <InitialValuesHandler
              isEdit={isEdit}
              initialValues={initialValues}
              transactionTypes={transactionTypes}
              vehicles={vehicles}
              branches={branches}
              contracts={contracts}
            />
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

                {/* Contract */}
                <SearchableSelect
                  name="contract"
                  label="Contract"
                  required
                  options={contracts.map(contract => ({
                    key: contract.id,
                    id: contract.id,
                    value: contract.contract_number,
                    subValue: `${contract.customer_name} - ${contract.start_date} to ${contract.end_date}`
                  }))}
                  placeholder="Select contract"
                  className="w-full"
                />

                {/* Branch */}
                <SearchableSelect
                  name="branch"
                  label="Branch"
                  required
                  options={branches.filter(branch => branch.is_active).map(branch => ({
                    key: branch.id,
                    id: branch.id,
                    value: branch.name,
                    subValue: `${branch.code}${branch.address ? ` - ${branch.address}` : ''}`
                  }))}
                  placeholder="Select branch"
                  className="w-full"
                />

                {/* Vehicle */}
                <SearchableSelect
                  name="vehicle"
                  label="Vehicle"
                  required
                  options={vehicles.map(vehicle => ({
                    key: vehicle.id,
                    id: vehicle.id,
                    value: vehicle.plate_number,
                    subValue: `${vehicle.make?.name || 'N/A'} ${vehicle.model?.name || 'N/A'} ${vehicle.make_year || 'N/A'}`
                  }))}
                  placeholder="Select vehicle"
                  className="w-full"
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
                  submittingText={isEdit ? "Updating Income..." : "Adding Income..."}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isEdit ? "Update Income" : "Add Income"}
                </CustomButton>
              </div>
            </div>
          </Form>
          );
        }}
      </Formik>
    </CustomModal>
  );
};
