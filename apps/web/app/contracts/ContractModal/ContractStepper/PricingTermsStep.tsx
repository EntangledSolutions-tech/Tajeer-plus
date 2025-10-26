import React, { useState, useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import CustomButton from '../../../reusableComponents/CustomButton';
import CustomSwitch from '../../../reusableComponents/CustomSwitch';
import { useHttpService } from '../../../../lib/http-service';
import { Database } from '../../../../lib/database.types';

type ContractAddOn = Database['public']['Tables']['contract_add_ons']['Row'];

interface AddOn {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

export default function PricingTermsStep() {
  const formik = useFormikContext<any>();
  const { getRequest } = useHttpService();

  // State for form fields - will be populated from vehicle data
  const [dailyRentalRate, setDailyRentalRate] = useState('0');
  const [hourlyDelayRate, setHourlyDelayRate] = useState('0');
  const [currentKm, setCurrentKm] = useState('0');
  const [rentalDays, setRentalDays] = useState('1'); // Calculated from dates
  const [permittedDailyKm, setPermittedDailyKm] = useState('0');
  const [excessKmRate, setExcessKmRate] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [depositAmount, setDepositAmount] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isLoadingAddOns, setIsLoadingAddOns] = useState(true);
  const [canEditRentalDays, setCanEditRentalDays] = useState(false);

  // Display validation errors from formik
  const depositError = formik.errors.depositAmount && formik.touched.depositAmount
    ? String(formik.errors.depositAmount)
    : '';

  // Add-ons state - will be populated from database
  const [addOns, setAddOns] = useState<AddOn[]>([]);

  // Pricing state - calculated values
  const [baseRent, setBaseRent] = useState(0);
  const [addOnTotal, setAddOnTotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Populate pricing fields from selected vehicle data
  const populateVehicleData = () => {
    // Get vehicle data from formik values (stored individually in VehicleDetailsStep)
    const vehicleDailyRate = formik.values.vehicleDailyRentRate;
    const vehicleHourlyDelayRate = formik.values.vehicleHourlyDelayRate;
    const vehicleMileage = formik.values.vehicleMileage;
    const vehiclePermittedDailyKm = formik.values.vehiclePermittedDailyKm;
    const vehicleExcessKmRate = formik.values.vehicleExcessKmRate;

    if (vehicleDailyRate) {
      setDailyRentalRate(vehicleDailyRate.toString());
    }

    if (vehicleHourlyDelayRate) {
      setHourlyDelayRate(vehicleHourlyDelayRate.toString());
    }

    if (vehicleMileage) {
      setCurrentKm(vehicleMileage.toString());
    }

    if (vehiclePermittedDailyKm) {
      setPermittedDailyKm(vehiclePermittedDailyKm.toString());
    }

    if (vehicleExcessKmRate) {
      setExcessKmRate(vehicleExcessKmRate.toString());
    }

    // Calculate rental days from start and end dates
    const startDate = formik.values.startDate;
    const endDate = formik.values.endDate;
    let calculatedDays = 1;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (calculatedDays < 1) calculatedDays = 1;
    }

    setRentalDays(calculatedDays.toString());

    console.log('Vehicle data populated:', {
      vehicleDailyRate,
      vehicleHourlyDelayRate,
      vehicleMileage,
      vehiclePermittedDailyKm,
      vehicleExcessKmRate,
      rentalDays: calculatedDays
    });

    console.log('Formik values:', {
      vehicleHourlyDelayRate: formik.values.vehicleHourlyDelayRate,
      vehicleDailyRentRate: formik.values.vehicleDailyRentRate,
      vehiclePermittedDailyKm: formik.values.vehiclePermittedDailyKm,
      vehicleExcessKmRate: formik.values.vehicleExcessKmRate
    });
  };

  // Fetch add-ons from database
  const fetchAddOns = async () => {
    try {
      setIsLoadingAddOns(true);
      const response = await getRequest('/api/contract-configuration/add-ons?limit=100');

      if (response.success && response.data?.add_ons) {
        const dbAddOns: AddOn[] = response.data.add_ons
          .filter((addon: ContractAddOn) => addon.is_active) // Only show active add-ons
          .map((addon: ContractAddOn) => ({
            id: addon.id,
            name: addon.name,
            price: addon.amount,
            enabled: false // All disabled by default
          }));
        setAddOns(dbAddOns);
      } else {
        console.error('Error fetching add-ons:', response.error);
        // Fallback to empty array if API fails
        setAddOns([]);
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      setAddOns([]);
    } finally {
      setIsLoadingAddOns(false);
    }
  };

  // Populate vehicle data and fetch add-ons on component mount
  useEffect(() => {
    populateVehicleData();
    fetchAddOns();

    // Initialize deposit from formik if available
    if (formik.values.depositAmount) {
      setDepositAmount(formik.values.depositAmount);
    }
  }, []);

  // Also populate when formik values change (in case vehicle is selected later or dates change)
  useEffect(() => {
    if (formik.values.vehicleDailyRentRate || formik.values.vehicleMileage || formik.values.vehicleHourlyDelayRate || formik.values.vehiclePermittedDailyKm || formik.values.vehicleExcessKmRate || formik.values.startDate || formik.values.endDate) {
      populateVehicleData();
    }
  }, [formik.values.vehicleDailyRentRate, formik.values.vehicleMileage, formik.values.vehicleHourlyDelayRate, formik.values.vehiclePermittedDailyKm, formik.values.vehicleExcessKmRate, formik.values.startDate, formik.values.endDate]);

  // Calculate and update all pricing
  const calculatePricing = () => {
    const rentalDaysNum = Math.max(1, parseInt(rentalDays) || 1); // Ensure minimum 1 day
    const dailyRate = parseFloat(dailyRentalRate) || 0;

    const newBaseRent = dailyRate * rentalDaysNum;
    const newAddOnTotal = addOns.filter(addon => addon.enabled).reduce((sum, addon) => sum + addon.price, 0);
    const newTotal = newBaseRent + newAddOnTotal;

    setBaseRent(newBaseRent);
    setAddOnTotal(newAddOnTotal);
    setTotal(newTotal);

    console.log('Pricing calculations:', {
      dailyRentalRate,
      rentalDays: rentalDaysNum,
      baseRent: newBaseRent,
      addOns: addOns.filter(addon => addon.enabled),
      addOnTotal: newAddOnTotal,
      total: newTotal
    });
  };




  // Trigger validation when depositAmount or total changes
  useEffect(() => {
    if (formik.touched.depositAmount) {
      formik.validateField('depositAmount');
    }
  }, [depositAmount, total]);

  // Calculate pricing whenever relevant state changes
  useEffect(() => {
    calculatePricing();
  }, [dailyRentalRate, rentalDays, JSON.stringify(addOns)]);

  // Auto-fill deposit amount when total changes
  useEffect(() => {
    if (total > 0 && !depositAmount) {
      setDepositAmount(total.toString());
    } else if (total > 0 && parseFloat(depositAmount.replace(/,/g, '')) !== total) {
      setDepositAmount(total.toString());
    }
  }, [total]);

  // Update Formik values whenever state changes
  useEffect(() => {
    formik.setFieldValue('dailyRentalRate', dailyRentalRate);
    formik.setFieldValue('hourlyDelayRate', hourlyDelayRate);
    formik.setFieldValue('currentKm', currentKm);
    formik.setFieldValue('rentalDays', Math.max(1, parseInt(rentalDays) || 1)); // Ensure it's a number and minimum 1
    formik.setFieldValue('permittedDailyKm', permittedDailyKm);
    formik.setFieldValue('excessKmRate', excessKmRate);
    formik.setFieldValue('paymentMethod', paymentMethod);
    formik.setFieldValue('depositAmount', depositAmount);
    formik.setFieldValue('addOns', addOns);
    formik.setFieldValue('totalAmount', total);

    // Trigger validation to enable next button
    setTimeout(() => {
      formik.validateForm();
    }, 100);

    // Force re-render to update UI
    console.log('Formik values updated, total:', total);
  }, [dailyRentalRate, hourlyDelayRate, currentKm, rentalDays, permittedDailyKm, excessKmRate, paymentMethod, depositAmount, addOns, total]);

  const handleAddOnToggle = (addOnId: string) => {
    console.log('Toggling add-on:', addOnId);
    setAddOns(prev => {
      const updated = prev.map(addon =>
        addon.id === addOnId ? { ...addon, enabled: !addon.enabled } : addon
      );
      console.log('Updated add-ons:', updated);
      return updated;
    });
  };

  const formatPrice = (price: number) => {
    return `SAR ${price.toFixed(2)}`;
  };

  const formatNumber = (num: string) => {
    // Remove commas and format
    const cleanNum = num.replace(/,/g, '');
    return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Pricing & Terms
      </h2>
      <p className="text-primary/70 mb-4">
        Pricing details are automatically loaded from the selected vehicle. You can adjust rental days, select add-ons, and enable membership discounts.
      </p>
      {formik.values.vehiclePlate && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Vehicle:</strong> {formik.values.vehicleMakeYear} {formik.values.vehicleMake} {formik.values.vehicleModel}
            {formik.values.vehiclePlate && ` (${formik.values.vehiclePlate})`}
          </p>
 </div>
      )}

      {/* Daily rent Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Daily rent</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <CustomInput
              label="Daily rental rate (From vehicle)"
              name="dailyRentalRate"
              type="text"
              value={dailyRentalRate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                const minDailyRate = parseFloat(formik.values.vehicleDailyRentRate) || 0;
                const enteredValue = parseFloat(value.replace(/,/g, '')) || 0;
                if (enteredValue >= minDailyRate) {
                  setDailyRentalRate(value);
                }
              }}
              placeholder="0.00"
              isCurrency={true}
            />
            <p className="text-xs text-primary/60 mt-1">
              Minimum: {formik.values.vehicleDailyRentRate || 0} SAR
            </p>
          </div>
          <CustomInput
            label="Hourly delay rate (From vehicle)"
            name="hourlyDelayRate"
            type="text"
            value={hourlyDelayRate}
            readOnly
            disabled
            className="bg-gray-50 cursor-not-allowed"
            placeholder="0.00"
            isCurrency={true}
          />
        </div>
      </div>

      {/* Distance Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Distance</h3>
        <div className="grid grid-cols-2 gap-6">
          <CustomInput
            label="Current km"
            name="currentKm"
            type="text"
            value={formatNumber(currentKm)}
            readOnly
            disabled
            className="bg-gray-50 cursor-not-allowed"
            placeholder="0"
          />
          <div>
            <CustomInput
              label="Rental days (Auto-calculated)"
              name="rentalDays"
              type="text"
              value={rentalDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (canEditRentalDays) {
                  const value = e.target.value;
                  // Only allow numeric values
                  if (/^\d+$/.test(value) || value === '') {
                    setRentalDays(value);
                  }
                }
              }}
              readOnly={!canEditRentalDays}
              disabled={!canEditRentalDays}
              className={!canEditRentalDays ? "bg-gray-50 cursor-not-allowed" : ""}
              placeholder="Auto-calculated from dates"
            />
            {canEditRentalDays && (
              <p className="text-xs text-primary/60 mt-1">
                Editable when deposit is less than total price
              </p>
            )}
          </div>
          <CustomInput
            label="Permitted daily km"
            name="permittedDailyKm"
            type="text"
            value={permittedDailyKm}
            readOnly
            disabled
            className="bg-gray-50 cursor-not-allowed"
            placeholder="0"
          />
          <CustomInput
            label="Excess km rate"
            name="excessKmRate"
            type="text"
            value={excessKmRate}
            readOnly
            disabled
            className="bg-gray-50 cursor-not-allowed"
            placeholder="0.00"
            isCurrency={true}
          />
        </div>
      </div>

      {/* Add-ons Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Add-ons</h3>

        {isLoadingAddOns ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-primary">Loading add-ons...</span>
          </div>
        ) : addOns.length === 0 ? (
          <div className="text-center py-8 text-primary/70">
            <p>No add-ons available</p>
            <p className="text-sm mt-1">Add-ons can be configured in the Contract Configurations section</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addOns.map((addon) => (
              <div key={addon.id} className="flex items-center gap-3">
                <CustomSwitch
                  name={`addon_${addon.id}`}
                  checked={addon.enabled}
                  onChange={() => handleAddOnToggle(addon.id)}
                />
                <span className="text-primary">
                  {addon.name} - <span className="font-semibold">{formatPrice(addon.price)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment method & Deposit Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Payment & Deposit</h3>
        <div className="grid grid-cols-2 gap-6">
          <CustomSelect
            label="Payment Method"
            name="paymentMethod"
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' }
            ]}
            value={paymentMethod}
            disabled
          />
          <div>
            <CustomInput
              label="Deposit amount"
              name="depositAmount"
              type="text"
              value={depositAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDepositAmount(e.target.value);
                formik.setFieldTouched('depositAmount', true);
              }}
              placeholder="0.00"
              isCurrency={true}
              required
                             error={depositError}
             />
             {total > 0 && !depositError && (
               <p className="text-xs text-primary/60 mt-1">
                 Must equal: {total.toFixed(2)} SAR
               </p>
             )}
           </div>
         </div>
       </div>

      {/* Bottom Section with Total and Breakdown */}
      <div className="mt-8 pt-6 border-t border-primary/30 flex justify-between items-end">
        {/* Total and View Breakdown */}
        <div className="relative">
          <div className="text-right mb-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(total - (parseFloat(depositAmount.replace(/,/g, '')) || 0))}</span>
            {depositAmount && parseFloat(depositAmount.replace(/,/g, '')) > 0 && (
              <span className="text-sm text-gray-500 ml-2">(Due)</span>
            )}
          </div>
          <div className="relative">
            <CustomButton
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary text-sm underline hover:no-underline p-0 h-auto"
              onMouseEnter={() => setShowBreakdown(true)}
              onMouseLeave={() => setShowBreakdown(false)}
            >
              View Breakdown
            </CustomButton>

            {/* Breakdown Tooltip */}
            {showBreakdown && (
              <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border-2 border-primary/30 rounded-lg p-4 shadow-lg z-10">
                <h4 className="text-lg font-bold text-primary mb-4">Price Breakdown</h4>

                <div className="space-y-3">
                  {/* Base Rent */}
                  <div className="flex justify-between items-center">
                    <span className="text-primary">Base Rent ({rentalDays} days × {formatPrice(parseFloat(dailyRentalRate))})</span>
                    <span className="font-semibold text-primary">{formatPrice(baseRent)}</span>
                  </div>

                  {/* Active Add-ons */}
                  {addOns.filter(addon => addon.enabled).length > 0 && (
                    <>
                      <div className="text-sm font-medium text-primary/80 mt-3 mb-2">Add-ons:</div>
                      {addOns.filter(addon => addon.enabled).map((addon) => (
                        <div key={addon.id} className="flex justify-between items-center pl-4">
                          <span className="text-primary">• {addon.name}</span>
                          <span className="font-semibold text-primary">+{formatPrice(addon.price)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-primary">Subtotal Add-ons</span>
                        <span className="text-primary">+{formatPrice(addOnTotal)}</span>
                      </div>
                    </>
                  )}


                  {/* Divider */}
                  <hr className="border-primary/30" />

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-primary">Total</span>
                    <span className="font-bold text-primary">{formatPrice(total)}</span>
                  </div>

                  {/* Deposit (in red) */}
                  {depositAmount && parseFloat(depositAmount.replace(/,/g, '')) > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-red-600">Deposit</span>
                        <span className="font-semibold text-red-600">-{formatPrice(parseFloat(depositAmount.replace(/,/g, '')) || 0)}</span>
                      </div>

                      {/* Divider */}
                      <hr className="border-primary/30" />

                      {/* Amount Due */}
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-primary">Amount Due</span>
                        <span className="font-bold text-primary">{formatPrice(total - (parseFloat(depositAmount.replace(/,/g, '')) || 0))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}