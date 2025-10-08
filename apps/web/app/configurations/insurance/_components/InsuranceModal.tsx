'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import SearchableSelect from '../../../reusableComponents/SearchableSelect';
import CustomButton from '../../../reusableComponents/CustomButton';
import { CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';
import CustomModal from '../../../reusableComponents/CustomModal';
import { useHttpService } from '../../../../lib/http-service';

interface InsurancePolicy {
  id?: string;
  name: string;
  policy_number: string;
  policy_amount: number;
  deductible_premium: number;
  policy_type: string;
  policy_company: string;
  expiry_date: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface InsurancePolicyForm {
  name: string;
  policyNumber: string;
  policyAmount: number;
  deductiblePremium: number;
  policyType: string;
  policyCompany: string;
  expiryDate: string;
}

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: InsurancePolicyForm) => void;
  editingPolicy?: InsurancePolicy | null;
  isLoading?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  policyNumber: Yup.string()
    .min(3, 'Policy number must be at least 3 characters')
    .max(50, 'Policy number must be less than 50 characters')
    .required('Policy number is required'),
  policyAmount: Yup.number()
    .min(0, 'Policy amount must be positive')
    .max(999999999, 'Policy amount is too large')
    .required('Policy amount is required'),
  deductiblePremium: Yup.number()
    .min(0, 'Deductible premium must be positive')
    .max(999999999, 'Deductible premium is too large')
    .required('Deductible premium is required'),
  policyType: Yup.string()
    .required('Policy type is required'),
  policyCompany: Yup.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .required('Policy company is required'),
  expiryDate: Yup.string()
    .required('Expiry date is required')
});

interface InsuranceOption {
  id: string;
  name: string;
  code: number;
}

export default function InsuranceModal({
  isOpen,
  onClose,
  onSubmit,
  editingPolicy = null,
  isLoading = false
}: InsuranceModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const { getRequest } = useHttpService();

  // Fetch insurance options for the dropdown
  const fetchInsuranceOptions = async () => {
    try {
      setLoadingOptions(true);
      const response = await getRequest('/api/insurance-options');

      if (response.success && response.data) {
        setInsuranceOptions(response.data.insuranceOptions || []);
      } else {
        throw new Error(response.error || 'Failed to fetch insurance options');
      }
    } catch (error) {
      console.error('Error fetching insurance options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsuranceOptions();
    }
  }, [isOpen]);

  const initialValues: InsurancePolicyForm = {
    name: editingPolicy?.name || '',
    policyNumber: editingPolicy?.policy_number || '',
    policyAmount: editingPolicy?.policy_amount || 0,
    deductiblePremium: editingPolicy?.deductible_premium || 0,
    policyType: editingPolicy?.policy_type || '',
    policyCompany: editingPolicy?.policy_company || '',
    expiryDate: editingPolicy?.expiry_date || '',
  };

  const handleSubmit = (values: InsurancePolicyForm) => {
    onSubmit(values);
  };

  const handleClose = () => {
    setIsCalendarOpen(false);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingPolicy ? 'Edit Insurance Policy' : 'Add New Insurance Policy'}
      subtitle={editingPolicy
        ? 'Update the insurance policy information below.'
        : 'Fill in the details to add a new insurance policy.'
      }
      maxWidth="sm:max-w-[600px]"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-4 mt-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <CustomInput
                name="name"
                label="Name"
                placeholder="Enter policy name"
                required
              />

              {/* Policy Number */}
              <CustomInput
                name="policyNumber"
                label="Policy Number"
                placeholder="Enter policy number"
                required
              />

              {/* Policy Amount */}
              <CustomInput
                name="policyAmount"
                label="Policy Amount"
                type="number"
                placeholder="Enter amount"
                required
              />

              {/* Deductible Premium */}
              <CustomInput
                name="deductiblePremium"
                label="Deductible Premium"
                type="number"
                placeholder="Enter amount"
                required
              />

              {/* Policy Type */}
              <SearchableSelect
                name="policyType"
                label="Policy Type"
                options={insuranceOptions.map(option => ({
                  key: option.id,
                  id: option.id,
                  value: option.name
                }))}
                placeholder="Search for policy type..."
                required
              />

              {/* Policy Company */}
              <CustomInput
                name="policyCompany"
                label="Policy Company"
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Expiry Date - Full Width */}
            <div className="w-full md:w-1/2">
              <label className="block text-primary font-medium mb-1">
                Expiry Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-left bg-white text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors flex items-center justify-between",
                      !values.expiryDate && "text-primary/60",
                      touched.expiryDate && errors.expiryDate && "border-red-500"
                    )}
                  >
                    {values.expiryDate ? (
                      format(new Date(values.expiryDate), "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values.expiryDate ? new Date(values.expiryDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFieldValue('expiryDate', format(date, 'yyyy-MM-dd'));
                        setIsCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {touched.expiryDate && errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="bg-white px-6 py-4 border-t border-primary/20 flex-shrink-0 mt-6 -mx-6">
              <div className="flex gap-3 justify-end">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Add Policy'}
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
}
