import React, { useMemo } from 'react';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomDateTime from '../../../reusableComponents/CustomDateTime';
import CustomButton from '../../../reusableComponents/CustomButton';
import { useFormikContext } from 'formik';

type PricingField = {
  label: string;
  name: string;
  type: string;
  isRequired: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  isCurrency?: boolean;
};

type FormValues = {
  paymentType?: 'cash' | 'LeaseToOwn';
  [key: string]: unknown;
};

const depreciationYearsOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

const vehiclePricingFields: PricingField[] = [
  { label: 'Car Pricing', name: 'carPricing', type: 'number', isRequired: true, min: 1, placeholder: 'Enter current car pricing (SAR)', isCurrency: true },
  { label: 'Acquisition Date', name: 'acquisitionDate', type: 'date', isRequired: true },
  { label: 'Operation Date', name: 'operationDate', type: 'date', isRequired: true },
  { label: 'Depreciation Rate (%)', name: 'depreciationRate', type: 'number', isRequired: true, min: 0, max: 100, placeholder: 'Enter depreciation rate (0-100)' },
  { label: 'Number of depreciation years', name: 'depreciationYears', type: 'select', isRequired: true, options: depreciationYearsOptions.map(year => ({ value: year, label: year })) },
];

export default function VehiclePricingStep() {
  const { values, setFieldValue } = useFormikContext<any>();

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

  const paymentType = values.paymentType || 'cash';

  const handlePaymentTypeChange = (type: 'cash' | 'LeaseToOwn') => {
    setFieldValue('paymentType', type);
  };

  // Clear fields when switching payment types
  React.useEffect(() => {
    if (paymentType === 'cash') {
      // Clear lease-to-own fields
      setFieldValue('installmentValue', '');
      setFieldValue('interestValue', '');
      setFieldValue('totalPrice', '');
      setFieldValue('numberOfInstallments', '');
      setFieldValue('carPrice', '');
    } else if (paymentType === 'LeaseToOwn') {
      // Clear cash payment fields
      setFieldValue('carPricing', '');
      setFieldValue('acquisitionDate', '');
      setFieldValue('operationDate', '');
      setFieldValue('depreciationRate', '');
      setFieldValue('depreciationYears', '');
    }
  }, [paymentType, setFieldValue]);

  // Auto-calculate Total Price and Installment Value
  React.useEffect(() => {
    if (paymentType === 'LeaseToOwn') {
      const carPrice = parseFloat(values.carPrice) || 0;
      let interestValue = parseFloat(values.interestValue) || 0;
      let numberOfInstallments = parseInt(values.numberOfInstallments) || 0;

      // Ensure values are not negative
      if (interestValue < 0) {
        interestValue = 0;
        setFieldValue('interestValue', 0);
      }
      if (numberOfInstallments < 0) {
        numberOfInstallments = 0;
        setFieldValue('numberOfInstallments', 0);
      }

      // Calculate Total Price
      const totalPrice = carPrice + interestValue;

      // Calculate Installment Value
      const installmentValue = numberOfInstallments > 0 ? totalPrice / numberOfInstallments : 0;

      // Only update if values changed to avoid infinite loops
      if (values.totalPrice !== totalPrice.toFixed(2)) {
        setFieldValue('totalPrice', totalPrice.toFixed(2));
      }
      if (values.installmentValue !== installmentValue.toFixed(2)) {
        setFieldValue('installmentValue', installmentValue.toFixed(2));
      }
    }
  }, [values.carPrice, values.interestValue, values.numberOfInstallments, paymentType, setFieldValue, values.totalPrice, values.installmentValue]);

  // Generate payment schedule
  const paymentSchedule = useMemo(() => {
    if (paymentType !== 'LeaseToOwn') return [];

    const numberOfInstallments = parseInt(values.numberOfInstallments) || 0;
    const installmentValue = parseFloat(values.installmentValue) || 0;

    if (numberOfInstallments === 0 || installmentValue === 0) return [];

    const schedule = [];
    const startDate = new Date();

    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNumber: i + 1,
        amount: installmentValue,
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }

    return schedule;
  }, [values.numberOfInstallments, values.installmentValue, paymentType]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Vehicle Pricing & Depreciation</h2>

      {/* Age Range and Expected Sale Price */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <CustomSelect
          label="Age Range"
          name="ageRange"
          required={true}
          options={[
            { value: '0-1', label: '0-1 years' },
            { value: '2-3', label: '2-3 years' },
            { value: '4-5', label: '4-5 years' },
            { value: '6-7', label: '6-7 years' },
            { value: '8+', label: '8+ years' }
          ]}
        />
        <CustomInput
          label="Expected Sale Price"
          name="expectedSalePrice"
          required={true}
          type="number"
          placeholder="Enter expected sale price"
          min={0}
          isCurrency={true}
          iconPosition="left"
        />
      </div>

      {/* Payment Type Toggle */}
      <div className="mb-8">
        <div className="font-semibold text-primary mb-4">Payment Type</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="cash"
              checked={paymentType === 'cash'}
              onChange={() => handlePaymentTypeChange('cash')}
              className="w-4 h-4 text-primary border-primary focus:ring-primary accent-primary"
            />
            <span className="text-gray-700">Cash Payment</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="LeaseToOwn"
              checked={paymentType === 'LeaseToOwn'}
              onChange={() => handlePaymentTypeChange('LeaseToOwn')}
              className="w-4 h-4 text-primary border-primary focus:ring-primary accent-primary"
            />
            <span className="text-gray-700">Lease-to-own</span>
          </label>
        </div>
      </div>

      {/* Cash Payment Fields */}
      {paymentType === 'cash' && (
        <div className="flex flex-col gap-6">
          {vehiclePricingFields.map(field =>
            field.type === 'select' ? (
              <CustomSelect
                key={field.name}
                label={field.label}
                name={field.name}
                required={field.isRequired}
                options={field.options || []}
                placeholder="Select depreciation years"
              />
            ) : field.type === 'date' ? (
              <CustomDateTime
                key={field.name}
                label={field.label}
                name={field.name}
                required={field.isRequired}
                type="date"
                max={field.name === 'acquisitionDate' || field.name === 'operationDate' ? today : field.max}
              />
            ) : (
              <CustomInput
                key={field.name}
                label={field.label}
                name={field.name}
                required={field.isRequired}
                type={field.type}
                min={field.min}
                max={field.max}
                placeholder={field.placeholder}
                isCurrency={field.isCurrency}
                iconPosition="left"
              />
            )
          )}
        </div>
      )}

      {/* Lease-to-own Payment Fields */}
      {paymentType === 'LeaseToOwn' && (
        <>
          <div className="mb-8">
            <div className="font-semibold text-primary mb-4">Lease-to-own Configuration</div>
            <div className="grid grid-cols-2 gap-6">
              <CustomInput
                label="Car Price"
                name="carPrice"
                type="number"
                required={true}
                isCurrency={true}
                iconPosition="left"
                min={0}
                step={0.01}
                placeholder="Enter car price"
              />
              <CustomInput
                label="Interest Value (SAR)"
                name="interestValue"
                type="number"
                required={true}
                isCurrency={true}
                iconPosition="left"
                min={0}
                step={0.01}
                placeholder="Enter interest value"
              />
              <CustomInput
                label="Total Price"
                name="totalPrice"
                type="number"
                required={true}
                isCurrency={true}
                iconPosition="left"
                min={0}
                step={0.01}
                placeholder="Auto-calculated"
                disabled={true}
                readOnly={true}
              />
              <CustomInput
                label="Number of Installments"
                name="numberOfInstallments"
                type="number"
                required={true}
                iconPosition="left"
                min={1}
                max={120}
                placeholder="Enter number of installments"
              />
              <CustomInput
                label="Installment Value"
                name="installmentValue"
                type="number"
                required={true}
                isCurrency={true}
                iconPosition="left"
                min={0}
                step={0.01}
                placeholder="Auto-calculated"
                disabled={true}
                readOnly={true}
              />
              <div></div>
            </div>
          </div>

          {/* Payment Schedule Table */}
          {paymentSchedule.length > 0 && (
            <div className="mb-8">
              <div className="font-semibold text-primary mb-4">Payment Schedule</div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                <table className="w-full bg-white table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                        #
                      </th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                        Installment Amount (SAR)
                      </th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentSchedule.map((item) => (
                      <tr key={item.installmentNumber} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300">
                          {item.installmentNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm border-b border-gray-300">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300">
                          {item.dueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}