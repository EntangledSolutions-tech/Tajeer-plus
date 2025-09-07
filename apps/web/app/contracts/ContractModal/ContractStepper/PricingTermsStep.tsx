import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';

interface AddOn {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

export default function PricingTermsStep() {
  const formik = useFormikContext<any>();

  // State for form fields - all defaults to 0
  const [dailyRentalRate, setDailyRentalRate] = useState('0');
  const [hourlyDelayRate, setHourlyDelayRate] = useState('0');
  const [currentKm, setCurrentKm] = useState('0');
  const [rentalDays, setRentalDays] = useState('0');
  const [permittedDailyKm, setPermittedDailyKm] = useState('0');
  const [excessKmRate, setExcessKmRate] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [membershipEnabled, setMembershipEnabled] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Add-ons state - all disabled by default
  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: 'car_delivery', name: 'Car delivery', price: 40.00, enabled: false },
    { id: 'child_seat', name: 'Child seat (per day)', price: 45.00, enabled: false },
    { id: 'internet', name: 'Internet (per day)', price: 35.00, enabled: false },
    { id: 'gps', name: 'GPS navigation system', price: 20.00, enabled: false },
    { id: 'special_aid', name: 'Special aid for challenged people', price: 40.00, enabled: false }
  ]);

  // Calculate totals
  const baseRent = parseFloat(dailyRentalRate) * parseInt(rentalDays || '0');
  const membershipDiscount = membershipEnabled ? 123.00 : 0;
  const addOnTotal = addOns.filter(addon => addon.enabled).reduce((sum, addon) => sum + addon.price, 0);
  const total = baseRent + addOnTotal - membershipDiscount;

  // Update Formik values whenever state changes
  useEffect(() => {
    formik.setFieldValue('dailyRentalRate', dailyRentalRate);
    formik.setFieldValue('hourlyDelayRate', hourlyDelayRate);
    formik.setFieldValue('currentKm', currentKm);
    formik.setFieldValue('rentalDays', rentalDays);
    formik.setFieldValue('permittedDailyKm', permittedDailyKm);
    formik.setFieldValue('excessKmRate', excessKmRate);
    formik.setFieldValue('paymentMethod', paymentMethod);
    formik.setFieldValue('membershipEnabled', membershipEnabled);
    formik.setFieldValue('addOns', addOns);
    formik.setFieldValue('totalAmount', total);
  }, [dailyRentalRate, hourlyDelayRate, currentKm, rentalDays, permittedDailyKm, excessKmRate, paymentMethod, membershipEnabled, addOns, total]);

  const handleAddOnToggle = (addOnId: string) => {
    setAddOns(prev => prev.map(addon =>
      addon.id === addOnId ? { ...addon, enabled: !addon.enabled } : addon
    ));
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
      <p className="text-primary/70 mb-8">
        Set the pricing details and terms for this contract.
      </p>

      {/* Daily rent Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Daily rent</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Daily rental rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/70">SAR</span>
              <input
                type="text"
                value={dailyRentalRate}
                onChange={(e) => setDailyRentalRate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-primary"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Hourly delay rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/70">SAR</span>
              <input
                type="text"
                value={hourlyDelayRate}
                onChange={(e) => setHourlyDelayRate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-primary"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Distance Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Distance</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Current km</label>
            <input
              type="text"
              value={currentKm}
              onChange={(e) => setCurrentKm(formatNumber(e.target.value))}
              className="w-full px-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-primary"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Rental days</label>
            <input
              type="text"
              value={rentalDays}
              onChange={(e) => setRentalDays(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-primary"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Permitted daily km</label>
            <input
              type="text"
              value={permittedDailyKm}
              onChange={(e) => setPermittedDailyKm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-primary"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Excess km rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/70">SAR</span>
              <input
                type="text"
                value={excessKmRate}
                onChange={(e) => setExcessKmRate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-primary"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment method Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Payment method</h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-primary font-medium">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="accent-primary w-4 h-4"
            />
            Cash
          </label>
          <label className="flex items-center gap-2 text-primary font-medium">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="accent-primary w-4 h-4"
            />
            Card
          </label>
        </div>
      </div>

      {/* Membership Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Membership</h3>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={membershipEnabled}
              onChange={(e) => setMembershipEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-primary">
            You have <span className="font-semibold">SAR 123</span> (12,564pts) as loyalty rewards. Redeem it to get a discount on this contract!
          </span>
        </div>
      </div>

      {/* Add-ons Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Add-ons</h3>
        <div className="space-y-4">
          {addOns.map((addon) => (
            <div key={addon.id} className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={addon.enabled}
                  onChange={() => handleAddOnToggle(addon.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-primary">
                {addon.name} - <span className="font-semibold">{formatPrice(addon.price)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section with Total and Breakdown */}
      <div className="mt-8 pt-6 border-t border-primary/30 flex justify-between items-end">
        {/* Total and View Breakdown */}
        <div className="relative">
          <div className="text-right mb-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
          <div className="relative">
            <button
              type="button"
              className="text-primary text-sm underline hover:no-underline"
              onMouseEnter={() => setShowBreakdown(true)}
              onMouseLeave={() => setShowBreakdown(false)}
            >
              View Breakdown
            </button>

            {/* Breakdown Tooltip */}
            {showBreakdown && (
              <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border-2 border-primary/30 rounded-lg p-4 shadow-lg z-10">
                <h4 className="text-lg font-bold text-primary mb-4">Price Breakdown</h4>

                <div className="space-y-3">
                  {/* Rent */}
                  <div className="flex justify-between items-center">
                    <span className="text-primary">Rent</span>
                    <span className="font-semibold text-primary">{formatPrice(baseRent)}</span>
                  </div>

                  {/* Active Add-ons */}
                  {addOns.filter(addon => addon.enabled).map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center">
                      <span className="text-primary">{addon.name}</span>
                      <span className="font-semibold text-primary">{formatPrice(addon.price)}</span>
                    </div>
                  ))}

                  {/* Membership Discount */}
                  {membershipEnabled && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-500">Membership</span>
                      <span className="font-semibold text-red-500">-{formatPrice(membershipDiscount)}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <hr className="border-primary/30" />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">Total</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden inputs for form validation */}
      <input type="hidden" name="dailyRentalRate" value={dailyRentalRate} />
      <input type="hidden" name="hourlyDelayRate" value={hourlyDelayRate} />
      <input type="hidden" name="currentKm" value={currentKm} />
      <input type="hidden" name="rentalDays" value={rentalDays} />
      <input type="hidden" name="permittedDailyKm" value={permittedDailyKm} />
      <input type="hidden" name="excessKmRate" value={excessKmRate} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      <input type="hidden" name="membershipEnabled" value={membershipEnabled.toString()} />
      <input type="hidden" name="totalAmount" value={total.toString()} />
    </>
  );
}