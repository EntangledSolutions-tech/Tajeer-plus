import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { User, Car, FileText, DollarSign, ClipboardCheck } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

const SummaryStep: React.FC = () => {
  const formik = useFormikContext<any>();
  const [showAddOnsTooltip, setShowAddOnsTooltip] = useState(false);

  const renderCustomerDetails = () => {
    const {
      customerName,
      customerIdType,
      customerIdNumber,
      customerClassification,
      customerDateOfBirth,
      customerLicenseType,
      customerAddress,
      customerMobile,
      customerStatus,
      customerNationality,
      relatedToCompany,
      companyName
    } = formik.values;

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
          <User className="w-5 h-5" />
          Customer Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {customerName && (
            <div>
              <span className="font-medium text-gray-600">Name:</span>
              <span className="ml-2 text-gray-900">{customerName}</span>
            </div>
          )}
          {customerIdType && (
            <div>
              <span className="font-medium text-gray-600">ID Type:</span>
              <span className="ml-2 text-gray-900">{customerIdType}</span>
            </div>
          )}
          {customerIdNumber && (
            <div>
              <span className="font-medium text-gray-600">ID Number:</span>
              <span className="ml-2 text-gray-900">{customerIdNumber}</span>
            </div>
          )}
          {customerMobile && (
            <div>
              <span className="font-medium text-gray-600">Mobile:</span>
              <span className="ml-2 text-gray-900">{customerMobile}</span>
            </div>
          )}
          {customerNationality && (
            <div>
              <span className="font-medium text-gray-600">Nationality:</span>
              <span className="ml-2 text-gray-900">{customerNationality}</span>
            </div>
          )}
          {customerStatus && (
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <span className="ml-2 text-gray-900">{customerStatus}</span>
            </div>
          )}
          {customerClassification && (
            <div>
              <span className="font-medium text-gray-600">Classification:</span>
              <span className="ml-2 text-gray-900">{customerClassification}</span>
            </div>
          )}
          {customerDateOfBirth && (
            <div>
              <span className="font-medium text-gray-600">Date of Birth:</span>
              <span className="ml-2 text-gray-900">{customerDateOfBirth}</span>
            </div>
          )}
          {customerLicenseType && (
            <div>
              <span className="font-medium text-gray-600">License Type:</span>
              <span className="ml-2 text-gray-900">{customerLicenseType}</span>
            </div>
          )}
          {customerAddress && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-600">Address:</span>
              <span className="ml-2 text-gray-900">{customerAddress}</span>
            </div>
          )}
          {relatedToCompany && companyName && (
            <div>
              <span className="font-medium text-gray-600">Related to Company:</span>
              <span className="ml-2 text-gray-900">{companyName}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVehicleDetails = () => {
    const {
      vehiclePlate,
      vehicleSerialNumber,
      vehicleMake,
      vehicleModel,
      vehicleMakeYear,
      vehicleColor,
      vehiclePlateRegistrationType,
      vehicleMileage
    } = formik.values;

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
          <Car className="w-5 h-5" />
          Vehicle Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {vehiclePlate && (
            <div>
              <span className="font-medium text-gray-600">Plate Number:</span>
              <span className="ml-2 text-gray-900">{vehiclePlate}</span>
            </div>
          )}
          {vehicleSerialNumber && (
            <div>
              <span className="font-medium text-gray-600">Serial Number:</span>
              <span className="ml-2 text-gray-900">{vehicleSerialNumber}</span>
            </div>
          )}
          {vehicleMake && (
            <div>
              <span className="font-medium text-gray-600">Make:</span>
              <span className="ml-2 text-gray-900">{vehicleMake}</span>
            </div>
          )}
          {vehicleModel && (
            <div>
              <span className="font-medium text-gray-600">Model:</span>
              <span className="ml-2 text-gray-900">{vehicleModel}</span>
            </div>
          )}
          {vehicleMakeYear && (
            <div>
              <span className="font-medium text-gray-600">Year:</span>
              <span className="ml-2 text-gray-900">{vehicleMakeYear}</span>
            </div>
          )}
          {vehicleColor && (
            <div>
              <span className="font-medium text-gray-600">Color:</span>
              <span className="ml-2 text-gray-900">{vehicleColor}</span>
            </div>
          )}
          {vehiclePlateRegistrationType && (
            <div>
              <span className="font-medium text-gray-600">Registration Type:</span>
              <span className="ml-2 text-gray-900">{vehiclePlateRegistrationType}</span>
            </div>
          )}
          {vehicleMileage && (
            <div>
              <span className="font-medium text-gray-600">Mileage:</span>
              <span className="ml-2 text-gray-900">{vehicleMileage} km</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContractDetails = () => {
    const { startDate, endDate, durationType, durationInDays, totalFees } = formik.values;

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Contract Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {startDate && (
            <div>
              <span className="font-medium text-gray-600">Start Date:</span>
              <span className="ml-2 text-gray-900">{startDate}</span>
            </div>
          )}
          {endDate && (
            <div>
              <span className="font-medium text-gray-600">End Date:</span>
              <span className="ml-2 text-gray-900">{endDate}</span>
            </div>
          )}
          {durationType === 'duration' && durationInDays && (
            <div>
              <span className="font-medium text-gray-600">Duration:</span>
              <span className="ml-2 text-gray-900">{durationInDays} days</span>
            </div>
          )}
          {durationType === 'fees' && totalFees && (
            <div>
              <span className="font-medium text-gray-600">Total Fees:</span>
              <span className="ml-2 text-gray-900">{totalFees} SAR</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPricingTerms = () => {
    const { dailyRentalRate, hourlyDelayRate, currentKm, rentalDays, permittedDailyKm, excessKmRate, paymentMethod, totalAmount, depositAmount, addOns } = formik.values;

    const addOnsArray: AddOn[] = Array.isArray(addOns) ? addOns : [];
    const enabledAddOns = addOnsArray.filter((addon: AddOn) => addon.enabled);
    const depositAmountNum = parseFloat(depositAmount?.replace(/,/g, '') || '0') || 0;
    const amountAfterDeposit = (totalAmount || 0) - depositAmountNum;

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing & Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {dailyRentalRate && (
            <div>
              <span className="font-medium text-gray-600">Daily Rental Rate:</span>
              <span className="ml-2 text-gray-900">{dailyRentalRate} SAR</span>
            </div>
          )}
          {hourlyDelayRate && (
            <div>
              <span className="font-medium text-gray-600">Hourly Delay Rate:</span>
              <span className="ml-2 text-gray-900">{hourlyDelayRate} SAR</span>
            </div>
          )}
          {currentKm && (
            <div>
              <span className="font-medium text-gray-600">Current KM:</span>
              <span className="ml-2 text-gray-900">{currentKm} km</span>
            </div>
          )}
          {rentalDays && (
            <div>
              <span className="font-medium text-gray-600">Rental Days:</span>
              <span className="ml-2 text-gray-900">{rentalDays} days</span>
            </div>
          )}
          {permittedDailyKm && (
            <div>
              <span className="font-medium text-gray-600">Permitted Daily KM:</span>
              <span className="ml-2 text-gray-900">{permittedDailyKm} km</span>
            </div>
          )}
          {excessKmRate && (
            <div>
              <span className="font-medium text-gray-600">Excess KM Rate:</span>
              <span className="ml-2 text-gray-900">{excessKmRate} SAR</span>
            </div>
          )}
          {paymentMethod && (
            <div>
              <span className="font-medium text-gray-600">Payment Method:</span>
              <span className="ml-2 text-gray-900 capitalize">{paymentMethod}</span>
            </div>
          )}
          {totalAmount && (
            <div>
              <span className="font-medium text-gray-600">Total Amount:</span>
              <span className="ml-2 text-gray-900 font-semibold">{totalAmount} SAR</span>
            </div>
          )}
          {enabledAddOns.length > 0 && (
            <div>
              <span className="font-medium text-gray-600">Add-ons:</span>
              <span
                className="ml-2 text-gray-900 underline cursor-help relative"
                onMouseEnter={() => setShowAddOnsTooltip(true)}
                onMouseLeave={() => setShowAddOnsTooltip(false)}
              >
                {enabledAddOns.length} add-on{enabledAddOns.length !== 1 ? 's' : ''}
                {showAddOnsTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border-2 border-primary/30 rounded-lg p-3 shadow-lg z-10">
                    <div className="text-sm font-semibold text-primary mb-2">Selected Add-ons:</div>
                    <div className="space-y-1">
                      {enabledAddOns.map((addon: AddOn) => (
                        <div key={addon.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">• {addon.name}</span>
                          <span className="text-gray-900 font-medium">+{addon.price} SAR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            </div>
          )}
          {depositAmount && (
            <div>
              <span className="font-medium text-gray-600">Deposit Amount:</span>
              <span className="ml-2 text-gray-900">{depositAmount} SAR</span>
            </div>
          )}
          {amountAfterDeposit > 0 && (
            <div>
              <span className="font-medium text-gray-600">Amount Due:</span>
              <span className="ml-2 text-gray-900 font-semibold">{amountAfterDeposit.toFixed(2)} SAR</span>
            </div>
          )}
          {amountAfterDeposit === 0 && depositAmount && (
            <div>
              <span className="font-medium text-gray-600">Amount Due:</span>
              <span className="ml-2 text-gray-900 font-semibold">0.00 SAR</span>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Contract Summary</h2>
      <p className="text-primary/70 mb-8">Review all the details before submitting the contract.</p>

      <div className="space-y-6">
        {renderCustomerDetails()}
        {renderVehicleDetails()}
        {renderContractDetails()}
        {renderPricingTerms()}
      </div>
    </>
  );
};

export default SummaryStep;
