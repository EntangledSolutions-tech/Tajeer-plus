# Contract Foreign Key Refactoring Summary

## Overview
Refactored the contract system to use proper foreign keys and database joins instead of storing duplicate customer and vehicle data.

## Database Changes

### Migration Files Created

1. **`20250211000000_convert_contract_foreign_keys.sql`**
   - Converted `selected_customer_id` from `VARCHAR(100)` to `UUID`
   - Converted `selected_vehicle_id` from `VARCHAR(100)` to `UUID`
   - Added foreign key constraints:
     - `selected_customer_id` → `customers(id)` with `ON DELETE SET NULL`
     - `selected_vehicle_id` → `vehicles(id)` with `ON DELETE RESTRICT`
   - Cleaned up invalid references before conversion

2. **`20250211000001_remove_redundant_contract_columns.sql`**
   - Marked redundant columns as deprecated with comments
   - Prepared for future cleanup (columns can be removed when ready)

### Schema Changes

**Before:**
```sql
selected_customer_id VARCHAR(100)
selected_vehicle_id VARCHAR(100)
customer_name VARCHAR(255)
customer_id_type VARCHAR(50)
-- ... many more duplicate customer fields
vehicle_plate VARCHAR(50)
vehicle_serial_number VARCHAR(100)
-- ... many more duplicate vehicle fields
```

**After:**
```sql
selected_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL
selected_vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL
-- Redundant fields marked as deprecated, will be removed later
```

## API Changes

### Contract Creation (`POST /api/contracts`)

**Before:**
```typescript
{
  selected_customer_id: "uuid",
  customer_name: "John Doe",
  customer_id_type: "National ID",
  customer_id_number: "1234567890",
  // ... all customer fields duplicated
  selected_vehicle_id: "uuid",
  vehicle_plate: "ABC123",
  vehicle_serial_number: "SN12345",
  // ... all vehicle fields duplicated
}
```

**After:**
```typescript
{
  selected_customer_id: "uuid",  // Foreign key only
  selected_vehicle_id: "uuid",   // Foreign key only
  // Contract-specific data only
  daily_rental_rate: 100,
  rental_days: 30,
  // ...
}
```

### Contract Retrieval (`GET /api/contracts/:id`)

**Response Structure:**
```typescript
{
  success: true,
  data: {
    contract: {
      id: "uuid",
      contract_number: "ABC12345",
      start_date: "2025-01-01",
      end_date: "2025-01-31",

      // Joined customer data (flattened)
      customer: {
        id: "uuid",
        name: "John Doe",
        id_type: "National ID",
        id_number: "1234567890",
        classification: "Individual",  // Flattened from nested object
        license_type: "Private",        // Flattened from nested object
        nationality: "Saudi",           // Flattened from nested object
        status: "Active",               // Flattened from nested object
        // ... other customer fields
      },

      // Joined vehicle data (flattened)
      vehicle: {
        id: "uuid",
        serial_number: "SN12345",
        plate_number: "ABC123",
        make: "Toyota",                 // Flattened from nested object
        model: "Camry",                 // Flattened from nested object
        color: "White",                 // Flattened from nested object
        status: "In Contract",          // Flattened from nested object
        make_year: "2023",
        mileage: 15000,
        // ... other vehicle fields
      },

      // Backward compatibility fields
      customer_name: "John Doe",
      vehicle_plate: "ABC123",
      vehicle_serial_number: "SN12345"
    }
  }
}
```

### SQL Join Query

The API now performs comprehensive joins:

```sql
SELECT
  contracts.*,
  -- Contract status
  contract_statuses.id, contract_statuses.name, contract_statuses.color,

  -- Customer data with nested relationships
  customers.id, customers.name, customers.id_type, customers.id_number,
  customer_classifications.name as classification,
  customer_license_types.name as license_type,
  customer_nationalities.name as nationality,
  customer_statuses.name as status,

  -- Vehicle data with nested relationships
  vehicles.id, vehicles.serial_number, vehicles.plate_number,
  vehicle_makes.name as make,
  vehicle_models.name as model,
  vehicle_colors.name as color,
  vehicle_statuses.name as status

FROM contracts
LEFT JOIN customers ON contracts.selected_customer_id = customers.id
LEFT JOIN customer_classifications ON customers.classification_id = customer_classifications.id
LEFT JOIN customer_license_types ON customers.license_type_id = customer_license_types.id
LEFT JOIN customer_nationalities ON customers.nationality_id = customer_nationalities.id
LEFT JOIN customer_statuses ON customers.status_id = customer_statuses.id
LEFT JOIN vehicles ON contracts.selected_vehicle_id = vehicles.id
LEFT JOIN vehicle_makes ON vehicles.make_id = vehicle_makes.id
LEFT JOIN vehicle_models ON vehicles.model_id = vehicle_models.id
LEFT JOIN vehicle_colors ON vehicles.color_id = vehicle_colors.id
LEFT JOIN vehicle_statuses ON vehicles.status_id = vehicle_statuses.id
WHERE contracts.id = $1 AND contracts.user_id = $2
```

## Frontend Changes

### Updated Files

1. **`/api/contracts/route.ts`**
   - Removed duplicate customer/vehicle fields from allowed fields
   - Only stores foreign keys and contract-specific data

2. **`/api/contracts/[id]/route.ts`**
   - Added comprehensive joins for GET and PUT endpoints
   - Flattens nested data for easier frontend consumption
   - Maintains backward compatibility

3. **`/contracts/ContractModal/index.tsx`**
   - Updated contract submission to only send foreign keys
   - Removed all redundant customer and vehicle detail fields

4. **`/contracts/[id]/page.tsx`**
   - Updated Contract interface to include `vehicle` object
   - Updated edit submission to only send foreign keys
   - Maintained backward compatibility

5. **`/contracts/[id]/ContractDetailsComponents/ContractOverview.tsx`**
   - Added `Vehicle` interface
   - Updated all vehicle references to use `contract.vehicle.plate_number` instead of `contract.vehicle_plate`
   - Enhanced vehicle details section with make, model, color, year, mileage
   - Updated PDF generation to include vehicle details from joined data
   - Maintained backward compatibility with fallbacks

### Display Improvements

**Vehicle Details Section - Enhanced:**
- Serial Number
- Plate Number
- **Make** (new - from join)
- **Model** (new - from join)
- **Year** (new - from join)
- **Color** (new - from join)
- **Mileage** (new - from join)
- Current KM
- Permitted Daily KM
- Excess KM Rate

**PDF Generation - Enhanced:**
- Now includes vehicle make, model, year, and color
- Customer data pulled from joined customer object
- Vehicle data pulled from joined vehicle object

## Benefits

### 1. Data Normalization
- Single source of truth for customer and vehicle data
- No data duplication across tables
- Easier data maintenance

### 2. Data Integrity
- Foreign key constraints ensure referential integrity
- Cannot create contracts with non-existent customers or vehicles
- Automatic cascade on customer deletion (SET NULL)
- Prevent vehicle deletion if used in contracts (RESTRICT)

### 3. Automatic Updates
- Changes to customer/vehicle data automatically reflect in all contracts
- No need to update duplicate data in multiple places

### 4. Better Performance
- Proper indexes on foreign keys enable faster joins
- Database query optimization

### 5. Type Safety
- UUID foreign keys instead of varchar strings
- Stronger typing in TypeScript interfaces

### 6. Maintainability
- Cleaner codebase with less redundant data handling
- Clear separation between contract data and related entity data

## Backward Compatibility

To ensure smooth transition, the API includes backward compatibility fields:

```typescript
// API automatically adds these fields
customer_name: contract.customer?.name
vehicle_plate: contract.vehicle?.plate_number
vehicle_serial_number: contract.vehicle?.serial_number
```

This allows existing code to continue working while new code can use the proper joined objects.

## Migration Status

✅ Database migration applied successfully
✅ API endpoints updated
✅ Frontend components updated
✅ TypeScript interfaces updated
✅ Backward compatibility maintained
✅ No linter errors

## Testing Checklist

- [ ] Create new contract with customer and vehicle selection
- [ ] View existing contract details
- [ ] Edit contract (customer/vehicle references)
- [ ] Verify customer data displays correctly
- [ ] Verify vehicle data displays correctly (including new fields)
- [ ] Generate PDF and verify all data is present
- [ ] Test contract hold functionality
- [ ] Test contract close functionality
- [ ] Verify backward compatibility with old contracts

## Future Cleanup (Optional)

When ready, uncomment the DROP statements in migration `20250211000001_remove_redundant_contract_columns.sql` to permanently remove the deprecated columns:

- customer_name
- customer_id_type
- customer_id_number
- customer_classification
- customer_date_of_birth
- customer_license_type
- customer_address
- vehicle_plate
- vehicle_serial_number
- vehicle_plate_registration_type
- vehicle_make_year
- vehicle_model
- vehicle_make
- vehicle_color
- vehicle_mileage
- vehicle_status
- vehicle_daily_rent_rate
- vehicle_hourly_delay_rate
- vehicle_permitted_daily_km
- vehicle_excess_km_rate

**Note:** Only run this cleanup after confirming all features work correctly with the new structure.

## Conclusion

The contract system has been successfully refactored to use proper database normalization with foreign keys and joins. This improves data integrity, maintainability, and performance while maintaining backward compatibility with existing code.


