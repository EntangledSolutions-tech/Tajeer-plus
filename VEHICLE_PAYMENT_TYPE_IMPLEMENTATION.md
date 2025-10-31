# Vehicle Payment Type Implementation Summary

## Overview
Added payment type functionality to vehicles with support for both Cash Payment and Lease-to-own options.

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/20251028000000_add_payment_type_to_vehicles.sql`

Added the following columns to the `vehicles` table:
- `payment_type` (VARCHAR(50), default: 'cash')
- `installment_value` (DECIMAL(10,2))
- `interest_rate` (DECIMAL(5,2))
- `total_price` (DECIMAL(10,2))
- `number_of_installments` (INTEGER)

**Status:** Migration file created, needs to be applied

### 2. Frontend Changes

#### VehiclePricingStep Component
**File:** `apps/web/app/vehicles/VehicleModal/VehicleStepper/VehiclePricingStep.tsx`

- Added payment type radio button toggle (Cash Payment / Lease-to-own)
- **Cash Payment Option** displays:
  - Car Pricing
  - Acquisition Date
  - Operation Date
  - Depreciation Rate (%)
  - Number of depreciation years
- **Lease-to-own Option** displays:
  - Installment Value
  - Interest Rate (%)
  - Total Price
  - Number of Installments

#### PricingFeeStep Component
**File:** `apps/web/app/vehicles/VehicleModal/VehicleStepper/PricingFeeStep.tsx`

- Removed payment type toggle
- Removed lease-to-own fields
- Simplified to only show rental rate fields:
  - Daily rent fields
  - Monthly rent fields (auto-calculated)
  - Hourly rent fields (auto-calculated)

#### VehicleOverview Component
**File:** `apps/web/app/vehicles/VehicleDetails/VehicleOverview.tsx`

- Added new "Vehicle Pricing & Depreciation" section
- Displays payment type
- Conditionally shows fields based on payment type:
  - **Cash:** Shows car pricing, dates, and depreciation info
  - **Lease-to-own:** Shows installment details
- Added TypeScript interface fields for lease-to-own data

#### Vehicle Modal Validation
**File:** `apps/web/app/vehicles/VehicleModal/index.tsx`

- Updated `vehiclePricingSchema` with conditional validation
- Cash payment fields are required only when `paymentType === 'cash'`
- Lease-to-own fields are required only when `paymentType === 'LeaseToOwn'`
- Initial values already include all new fields

### 3. Backend Changes

#### Add Vehicle API
**File:** `apps/web/app/api/add-vehicle/route.ts`

Added to vehicle insert statement:
```javascript
// Payment type
payment_type: depreciation.paymentType || 'cash',

// Vehicle pricing & depreciation (for cash payment)
car_pricing: Math.min(parseFloat(depreciation.carPricing) || 0, 99999999.99),
acquisition_date: parseDate(depreciation.acquisitionDate),
operation_date: parseDate(depreciation.operationDate),
depreciation_rate: Math.min(parseFloat(depreciation.depreciationRate) || 0, 100),
depreciation_years: parseInt(depreciation.depreciationYears) || 0,

// Lease-to-own fields (only saved if payment_type is LeaseToOwn)
installment_value: depreciation.paymentType === 'LeaseToOwn' ? Math.min(parseFloat(depreciation.installmentValue) || 0, 99999999.99) : null,
interest_rate: depreciation.paymentType === 'LeaseToOwn' ? Math.min(parseFloat(depreciation.interestRate) || 0, 100) : null,
total_price: depreciation.paymentType === 'LeaseToOwn' ? Math.min(parseFloat(depreciation.totalPrice) || 0, 99999999.99) : null,
number_of_installments: depreciation.paymentType === 'LeaseToOwn' ? parseInt(depreciation.numberOfInstallments) || 0 : null,
```

#### Update Vehicle API
**File:** `apps/web/app/api/vehicles/[id]/route.ts`

No changes needed - the PUT endpoint is generic and updates all fields in the body.

## Field Mapping

### Frontend → Backend Mapping
| Frontend Field | Database Column |
|---------------|-----------------|
| paymentType | payment_type |
| installmentValue | installment_value |
| interestRate | interest_rate |
| totalPrice | total_price |
| numberOfInstallments | number_of_installments |
| carPricing | car_pricing |
| acquisitionDate | acquisition_date |
| operationDate | operation_date |
| depreciationRate | depreciation_rate |
| depreciationYears | depreciation_years |

## Next Steps

### Apply the Migration
Run one of the following commands to apply the database migration:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Direct migration
supabase migration up

# Option 3: Manual - Run the SQL from the migration file in your database
```

### Testing Checklist

1. **Create Vehicle with Cash Payment**
   - Select "Cash Payment" in VehiclePricingStep
   - Fill in car pricing, dates, and depreciation fields
   - Complete the form and submit
   - Verify data is saved correctly in database
   - Check VehicleOverview displays cash payment fields

2. **Create Vehicle with Lease-to-own**
   - Select "Lease-to-own" in VehiclePricingStep
   - Fill in installment, interest rate, total price, and installments
   - Complete the form and submit
   - Verify data is saved correctly in database
   - Check VehicleOverview displays lease-to-own fields

3. **Validation Testing**
   - Try submitting with missing required fields for each payment type
   - Verify appropriate error messages appear
   - Switch between payment types and verify validation updates

4. **Update Vehicle**
   - Edit existing vehicle
   - Change payment type and update fields
   - Verify changes are saved correctly

## Files Modified

1. ✅ `supabase/migrations/20251028000000_add_payment_type_to_vehicles.sql` (NEW)
2. ✅ `apps/web/app/vehicles/VehicleModal/VehicleStepper/VehiclePricingStep.tsx`
3. ✅ `apps/web/app/vehicles/VehicleModal/VehicleStepper/PricingFeeStep.tsx`
4. ✅ `apps/web/app/vehicles/VehicleDetails/VehicleOverview.tsx`
5. ✅ `apps/web/app/vehicles/VehicleModal/index.tsx`
6. ✅ `apps/web/app/api/add-vehicle/route.ts`

## Notes

- Default payment type is set to 'cash' for backward compatibility
- Lease-to-own fields are nullable and only populated when payment type is 'LeaseToOwn'
- All currency fields are capped at 99999999.99 for safety
- Interest rate is capped at 100%
- Number of installments is limited to 1-120
- PricingFeeStep now only handles rental rates (daily/monthly/hourly)
- VehiclePricingStep handles payment type and pricing/depreciation/lease fields

