# Customer ID Type Dynamic Validation Implementation

## Summary
Implemented dynamic validation on both frontend (UI) and backend (API) based on the selected customer ID type. The validation rules differ based on whether the customer is using National ID, GCC Countries Citizens, Visitor, or Resident ID.

---

## Frontend Changes

### 1. UI Validation Schema (`apps/web/app/customers/CustomerModal/index.tsx`)
- ✅ Added Yup validation schema with conditional validation using `.when()`
- ✅ **National ID**: Validates 6 specific fields
  - National ID Number (10 digits)
  - National ID Issue Date
  - National ID Expiry Date
  - Place of Birth
  - Father Name
  - Mother Name

- ✅ **GCC Countries Citizens**: Validates 4 specific fields
  - ID Copy Number
  - License Expiration Date
  - License Type
  - Place of ID Issue

- ✅ **Visitor**: Validates 8 specific fields
  - Border Number
  - Passport Number
  - License Number
  - ID Expiry Date
  - License Expiry Date
  - Address
  - Rental Type
  - Has Additional Driver (optional)

- ✅ **Resident ID**: Only base fields required (no additional fields)

### 2. Dynamic Field Rendering (`apps/web/app/customers/CustomerModal/CustomerStepper/CustomerDetailsStep.tsx`)
- ✅ Created field arrays for each ID type
- ✅ Dynamic field rendering based on selected ID type
- ✅ Fields automatically show/hide when user changes ID type

---

## Backend Changes

### 1. Validation Schema (`apps/web/app/api/customers/validation.ts`)
- ✅ Created Zod validation schemas for each ID type
- ✅ Base schema validates common fields:
  - Name (2-100 characters)
  - ID Type (enum)
  - Nationality (UUID)
  - Mobile Number (10-15 digits)
  - Email (valid email format)
  - Branch ID (UUID)

- ✅ ID type-specific schemas with appropriate validations
- ✅ Dynamic validation function that:
  1. First validates base fields
  2. Then applies ID-type-specific validation
  3. Returns detailed error messages

### 2. API Endpoint (`apps/web/app/api/customers/route.ts`)
- ✅ Integrated dynamic validation into POST endpoint
- ✅ Returns validation errors with detailed field-level messages
- ✅ Dynamically assigns ID-type-specific fields to database based on validated data

---

## Database Changes

### Migration: `20251017000000_add_customer_id_type_fields.sql`
**Status**: ✅ Successfully pushed to remote database

#### Added Columns:

**National ID Fields:**
- `national_id_number` VARCHAR(10)
- `national_id_issue_date` DATE
- `national_id_expiry_date` DATE
- `place_of_birth` VARCHAR(100)
- `father_name` VARCHAR(100)
- `mother_name` VARCHAR(100)

**GCC Countries Citizens Fields:**
- `id_copy_number` VARCHAR(50)
- `license_expiration_date` DATE
- `license_type` VARCHAR(50)
- `place_of_id_issue` VARCHAR(100)

**Visitor Fields:**
- `border_number` VARCHAR(50)
- `passport_number` VARCHAR(50)
- `license_number` VARCHAR(50)
- `id_expiry_date` DATE
- `license_expiry_date` DATE
- `rental_type` VARCHAR(100)
- `has_additional_driver` VARCHAR(10)

**Base Fields Added:**
- `email` VARCHAR(255)

#### Indexes Created:
- `idx_customers_national_id_number` (with WHERE clause for NULL filtering)
- `idx_customers_passport_number` (with WHERE clause for NULL filtering)
- `idx_customers_border_number` (with WHERE clause for NULL filtering)
- `idx_customers_id_copy_number` (with WHERE clause for NULL filtering)
- `idx_customers_email` (with WHERE clause for NULL filtering)

#### Documentation:
- Added column comments for all new fields
- Comments explain which ID type requires each field

---

## How It Works

### User Flow:
1. User selects an ID Type from dropdown
2. Form dynamically shows only relevant fields for that ID type
3. Frontend validates required fields based on ID type
4. On submit, backend validates data again based on ID type
5. If validation passes, customer is saved with only the relevant fields populated

### Validation Rules:
- **National ID**: Must provide all 6 National ID fields + base fields
- **GCC Countries Citizens**: Must provide all 4 GCC fields + base fields
- **Visitor**: Must provide all 8 Visitor fields + base fields
- **Resident ID**: Only base fields required

### Error Handling:
- Frontend: Shows field-level validation errors in real-time
- Backend: Returns structured validation errors with field names and messages
- Both use the same validation rules for consistency

---

## Database Status
✅ Migration successfully applied to remote database
✅ All new columns created
✅ Indexes created for performance
✅ Column comments added for documentation
✅ No data loss - all existing records preserved

---

## Testing Checklist
- [ ] Test National ID customer creation
- [ ] Test GCC Countries Citizens customer creation
- [ ] Test Visitor customer creation
- [ ] Test Resident ID customer creation
- [ ] Test validation errors display correctly
- [ ] Test required fields prevent submission
- [ ] Test optional fields work correctly
- [ ] Test switching between ID types clears previous fields
- [ ] Test API returns proper validation errors
- [ ] Test customer data saves correctly in database

---

## Notes
- All validation is consistent between frontend and backend
- Database schema supports all ID types
- Existing customers are not affected
- RLS policies remain unchanged and functional
- Migration is non-destructive and can be safely rolled back if needed

