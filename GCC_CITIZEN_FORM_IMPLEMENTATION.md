# GCC Citizen Form Implementation Summary

## Overview
Updated the GCC Citizen customer form to match the requirements shown in the screenshot, with complete field validation and database support.

## Database Changes

### New Migration: `20251026000000_add_gcc_id_number_to_customers.sql`
- Added `gcc_id_number` column (VARCHAR(50)) to store the GCC ID number
- Added index for performance: `idx_customers_gcc_id_number`
- Added documentation comment

### Existing Fields Utilized
The following fields already existed in the database and are now used for GCC Citizens:
- `country` - Country of the GCC citizen
- `id_copy_number` - ID copy number (positive integer)
- `license_number` - License number (digits and /)
- `id_expiry_date` - ID expiry date
- `license_expiry_date` - License expiry date
- `license_type` - Type of license
- `place_of_id_issue` - Place where ID was issued
- `address` - Customer address
- `email` - Email address
- `mobile_number` - Mobile number with country code
- `rental_type` - Type of rental agreement

## Frontend Changes

### 1. CustomerDetailsStep.tsx
Created a new complete field set for GCC Citizens (`gccAllFields`) with all required fields:

**Fields in Order:**
1. ID Type (select with descriptions)
2. Mobile Number (phone with country code)
3. Country (searchable select)
4. National/GCC ID Number (text, alphanumeric)
5. ID Copy Number (number, positive integer)
6. License Number (text, allows digits and /)
7. ID Expiry Date (date, must be ≥ today)
8. License Expiry Date (date, must be ≥ today)
9. License Type (select with Arabic descriptions)
10. Place of ID Issue (searchable select - countries)
11. Address (text, min 10 chars)
12. Email (email format)
13. Rental Type (select with Arabic descriptions)

**Key Changes:**
- GCC form no longer requires Name and Nationality fields
- Uses complete field set (similar to Visitor form)
- Added Arabic descriptions to License Type and Rental Type options
- All fields have proper validation rules

### 2. CustomSelect.tsx
Added support for descriptions in dropdown options:
- Added `description` property to options interface
- Updated rendering to show description below the label
- Consistent styling with SearchableSelect and SearchableDropdown

## Backend Changes

### 1. API Route: `/api/customers/route.ts` (POST)
**Updated GCC field handling:**
- Changed main ID number to use `nationalOrGccIdNumber` (stored in `gcc_id_number`)
- Added all new GCC-specific fields:
  - `gcc_id_number`
  - `country`
  - `id_copy_number`
  - `license_number`
  - `id_expiry_date`
  - `license_expiry_date`
  - `license_type`
  - `place_of_id_issue`
  - `address`
  - `rental_type`
- Supports both camelCase (frontend) and snake_case (database) field names

### 2. API Route: `/api/customers/[id]/route.ts` (PUT)
**Added field mapping for updates:**
- Maps camelCase field names from frontend to snake_case for database
- Handles all GCC-specific fields during update operations
- Maintains backward compatibility

### 3. Validation: `/api/customers/validation.ts`
**Created new validation schemas:**

**gccBaseSchema:**
- Doesn't require name and nationality (unlike base schema)
- Requires: id_type, mobile_number, email, branch_id

**Updated gccSchema with comprehensive validation:**
- `nationalOrGccIdNumber`: Required, 1-50 chars, non-empty after trim
- `country`: Required, 2-100 chars
- `idCopyNumber`: Required, positive integer
- `licenseNumber`: Required, 1-50 chars, only digits and /
- `idExpiryDate`: Required, valid date, must be ≥ today
- `licenseExpiryDate`: Required, valid date, must be ≥ today
- `licenseType`: Required
- `placeOfIdIssue`: Required, 2-100 chars
- `address`: Required, 10-500 chars, non-empty after trim
- `rentalType`: Required

**Updated validation logic:**
- Uses `gccBaseSchema` for GCC Citizens (doesn't require name/nationality)
- Applies specific GCC field validation
- Returns detailed error messages

## Validation Rules

### Field-Specific Rules:
1. **nationalOrGccIdNumber**:
   - Alphanumeric
   - 1-50 characters
   - Format configurable per country

2. **mobileNumber**:
   - Numeric
   - Starts with country code
   - Length per country rules (10-15 digits)

3. **licenseNumber**:
   - Allows digits and /
   - Example: 50/340353

4. **Dates (idExpiryDate, licenseExpiryDate)**:
   - Must be ≥ today
   - Valid date format

5. **idCopyNumber**:
   - Positive integer only

6. **All text inputs**:
   - Non-empty after trim
   - Specific min/max lengths

## User Experience Improvements

1. **Clear ID Type Descriptions**: Each ID type now shows a description explaining who it's for
2. **License Type Descriptions**: Arabic descriptions for each license type option
3. **Rental Type Options**: Comprehensive rental type options with Arabic labels
4. **Consistent Validation**: All fields have clear validation messages
5. **Proper Field Layout**: 2-column grid layout matching the screenshot

## Testing Checklist

- [ ] Create new GCC customer with all required fields
- [ ] Validate that ID Copy Number only accepts positive integers
- [ ] Validate that License Number accepts digits and /
- [ ] Validate that dates must be today or future
- [ ] Validate that all text fields trim whitespace
- [ ] Update existing GCC customer
- [ ] Verify field mappings work correctly
- [ ] Test validation error messages
- [ ] Verify Country and Place of ID Issue dropdowns work
- [ ] Test Rental Type selection

## Migration Instructions

1. Run the database migration:
   ```bash
   # Apply migration to add gcc_id_number field
   supabase db push
   ```

2. Verify the migration:
   ```sql
   -- Check that the column was added
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'customers'
   AND column_name = 'gcc_id_number';
   ```

3. Test the form:
   - Navigate to customer creation
   - Select "GCC Citizen" as ID type
   - Fill in all required fields
   - Submit and verify data is saved correctly

## Notes

- The `rental_type` field is included in the customer form as shown in the screenshot, though it's typically a contract-level field. This allows pre-setting customer preferences.
- GCC customers no longer require Name and Nationality fields, matching the screenshot requirements
- All existing GCC customer data will remain intact; the new `gcc_id_number` field will be NULL for existing records
- The form maintains backward compatibility with existing data structure

