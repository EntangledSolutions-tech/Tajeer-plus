# Visitor Form Implementation Summary

## Overview
Updated the Visitor customer form to match the exact field layout and requirements shown in the provided screenshot. The implementation ensures that only the specific fields required for Visitor ID type are displayed.

## Changes Made

### 1. Frontend Form Fields (CustomerDetailsStep.tsx)
**File:** `apps/web/app/customers/CustomerModal/CustomerStepper/CustomerDetailsStep.tsx`

#### Country Field Implementation
Uses the existing `CustomSearchableDropdown` component to display country options with flags and names (without codes). The country data is sourced from the existing `countryCodes.ts` file and formatted as:
- Flag emoji + country name (e.g., "🇸🇦 Saudi Arabia")
- Searchable and filterable dropdown
- Integrated with Formik for form state management

#### Created `visitorAllFields` Array
Created a complete standalone field configuration for Visitor type that includes all required fields in the correct order for a 2-column grid layout:

**Left Column (Odd Positions):**
1. ID Type
2. Border Number
3. Passport Number
4. License Number
5. ID Expiry Date
6. Place of ID Issue
7. Email

**Right Column (Even Positions):**
1. Mobile Number
2. Country (NEW)
3. ID Copy Number (NEW)
4. License Expiry Date
5. License Type (now optional)
6. Address

#### Key Changes:
- Added `Country` field as a searchable dropdown with flags (required)
- Added `ID Copy Number` field (required)
- Removed `Name` field (not shown in screenshot)
- Removed `Nationality` field (not shown in screenshot)
- Removed `Rental Type` field (not shown in screenshot)
- Made `License Type` optional (not marked as required in screenshot)
- Updated field ordering to match screenshot's two-column layout
- Integrated country dropdown using existing `CustomSearchableDropdown` component with countryCodes data

### 2. Backend Validation (validation.ts)
**File:** `apps/web/app/api/customers/validation.ts`

#### Created `visitorBaseSchema`
Added a separate base schema for Visitor type that excludes `name` and `nationality` fields:
- Only validates: ID Type, Mobile Number, Email, Branch ID
- Documents fields remain optional

#### Updated `visitorSchema`
Updated Visitor-specific field validation to include:
- `country` (required, 2-100 characters)
- `id_copy_number` (required, 1-50 characters)
- `place_of_id_issue` (required, 2-100 characters)
- `license_type` (optional)
- Removed `rental_type` validation
- Removed `has_additional_driver` validation

#### Updated `validateCustomerData` Function
Modified to use `visitorBaseSchema` for Visitor type instead of the standard `baseCustomerSchema`.

### 3. API Route Handler (route.ts)
**File:** `apps/web/app/api/customers/route.ts`

#### Updated POST Handler
Modified the Visitor case in the POST handler to:
- Accept `country` field
- Accept `id_copy_number` field
- Accept `place_of_id_issue` field
- Accept optional `license_type` field
- Remove `rental_type` field
- Remove `has_additional_driver` field
- Allow `name` and `nationality_id` to be nullable

### 4. Database Migrations

#### Migration 1: Add Country Field
**File:** `supabase/migrations/20251025000000_add_country_field_to_customers.sql`

Added `country` column to customers table:
```sql
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_customers_country ON public.customers(country) WHERE country IS NOT NULL;
```

#### Migration 2: Make Name and Nationality Nullable
**File:** `supabase/migrations/20251025000001_make_name_and_nationality_nullable.sql`

Made `name` and `nationality_id` nullable since they're not required for Visitor type:
```sql
ALTER TABLE public.customers ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.customers ALTER COLUMN nationality_id DROP NOT NULL;
```

## Field Mapping

### Database Columns Used for Visitor Type:
| Form Field | Database Column | Required | Type |
|------------|----------------|----------|------|
| ID Type | id_type | Yes | VARCHAR(50) |
| Mobile Number | mobile_number | Yes | VARCHAR(20) |
| Border Number | border_number | Yes | VARCHAR(50) |
| Country | country | Yes | VARCHAR(100) |
| Passport Number | passport_number | Yes | VARCHAR(50) |
| ID Copy Number | id_copy_number | Yes | VARCHAR(50) |
| License Number | license_number | Yes | VARCHAR(50) |
| License Expiry Date | license_expiry_date | Yes | DATE |
| ID Expiry Date | id_expiry_date | Yes | DATE |
| License Type | license_type | No | VARCHAR(50) |
| Place of ID Issue | place_of_id_issue | Yes | VARCHAR(100) |
| Address | address | Yes | TEXT |
| Email | email | Yes | VARCHAR(255) |

## Form Layout

The form uses a 2-column grid layout (`grid grid-cols-2`) that automatically distributes fields:
- **Column 1 (Left):** Positions 1, 3, 5, 7, 9, 11, 13
- **Column 2 (Right):** Positions 2, 4, 6, 8, 10, 12

The field order in `visitorAllFields` array ensures proper left-to-right, top-to-bottom placement matching the screenshot.

## Validation Rules

### Common Validation (for all ID types except Visitor):
- Name: 2-100 characters
- Nationality: UUID format
- Mobile Number: 10-15 digits
- Email: Valid email format
- Branch ID: UUID format

### Visitor-Specific Validation:
- Border Number: 1-50 characters
- Passport Number: 1-50 characters
- License Number: 1-50 characters
- Country: 2-100 characters
- ID Copy Number: 1-50 characters
- Place of ID Issue: 2-100 characters
- Address: 10-500 characters
- ID Expiry Date: Valid date
- License Expiry Date: Valid date (must be in future)
- License Type: Optional dropdown

## Breaking Changes

### For Visitor ID Type:
1. `name` field is no longer required or displayed
2. `nationality` field is no longer required or displayed
3. `rental_type` field is no longer available
4. `country` field is now required (NEW)
5. `id_copy_number` field is now required (NEW)

### Database Schema:
1. `name` column is now nullable
2. `nationality_id` column is now nullable
3. `country` column added

## Testing Checklist

- [x] Visitor form displays exactly the fields shown in screenshot
- [x] All required fields are marked with asterisk (*)
- [x] Form layout matches two-column structure from screenshot
- [x] Field labels match requirements
- [x] Form validation works for all Visitor fields
- [x] API successfully processes all Visitor form data
- [x] Database migrations created for schema changes
- [x] No linter errors in modified files

## Migration Instructions

To apply these changes to your database, run the migrations in order:

```bash
# Apply country field migration
supabase migration up 20251025000000_add_country_field_to_customers

# Apply nullable fields migration
supabase migration up 20251025000001_make_name_and_nationality_nullable
```

## Notes

- The `id_copy_number` field already existed in the database (for GCC Citizens) but is now also used for Visitor type
- The `place_of_id_issue` field already existed in the database (for GCC Citizens) but is now also used for Visitor type
- The form automatically resets when ID Type is changed due to the `getFieldsForIdType()` function
- Visitor customers will have NULL values for `name` and `nationality_id` in the database

