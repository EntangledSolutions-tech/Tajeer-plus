# Database Schema Documentation

## Overview
This document describes the normalized database schema for the Tajeer-Plus vehicle rental system. The schema uses proper foreign key relationships to maintain data consistency and avoid duplication.

## Database Structure

### Core Tables

#### 1. Vehicles Table (`public.vehicles`)
The main vehicles table that stores all vehicle information using foreign keys to reference configuration data.

**Key Fields:**
- `id` - Primary key (UUID)
- `user_id` - References auth.users (for user ownership)
- `plate_number` - Unique vehicle plate number
- `serial_number` - Vehicle serial/chassis number
- `make_id` - Foreign key to vehicle_makes
- `model_id` - Foreign key to vehicle_models
- `color_id` - Foreign key to vehicle_colors
- `status_id` - Foreign key to vehicle_statuses
- `owner_id` - Foreign key to vehicle_owners
- `actual_user_id` - Foreign key to vehicle_actual_users

**Business Fields:**
- Pricing information (daily, monthly, hourly rates)
- Vehicle specifications (mileage, year, class)
- Expiration dates (license, insurance, inspection)
- Purchase and depreciation information

#### 2. Vehicle Configuration Tables

##### `public.vehicle_makes`
- Stores vehicle manufacturers (Toyota, Honda, Ford, etc.)
- Each make has a unique ID and name

##### `public.vehicle_models`
- Stores vehicle models (Camry, Civic, Focus, etc.)
- Links to vehicle_makes via make_id
- Allows for proper make-model relationships

##### `public.vehicle_colors`
- Stores vehicle colors with hex codes
- Enables consistent color naming across the system

##### `public.vehicle_statuses`
- Stores vehicle statuses (Available, Rented, Maintenance, etc.)
- Includes color coding for UI display

##### `public.vehicle_owners`
- Stores information about vehicle owners
- Can be rental companies, individuals, or businesses

##### `public.vehicle_actual_users`
- Stores information about who actually uses the vehicles
- Separate from owners for complex rental scenarios

### Benefits of Normalized Schema

1. **Data Consistency**: No duplicate makes, colors, or statuses
2. **Easy Updates**: Change a make name in one place, updates everywhere
3. **Data Integrity**: Foreign key constraints prevent orphaned records
4. **Scalability**: Easy to add new makes, colors, or statuses
5. **Reporting**: Better aggregation and analysis capabilities
6. **Multi-language Support**: Easy to add translations for makes, colors, etc.

### Migration Order

The migrations are designed to run in this order:
1. `20241219010757_schema.sql` - Base schema
2. `20241220000000_create_vehicles_table.sql` - Main vehicles table
3. `20241220000002_create_storage_bucket.sql` - Storage configuration
4. `20241220000003_documents_storage.sql` - Document storage
5. `20241220000005_maintenance_tables.sql` - Maintenance tracking
6. `20241221000000_create_customers_table.sql` - Customer management
7. `20241222000000_create_contracts_table.sql` - Contract management
8. `20241223000000_create_document_storage_buckets.sql` - Document buckets
9. `20241224000000_create_vehicle_configuration_tables.sql` - Configuration tables
10. `20241225000000_seed_vehicle_configuration_data.sql` - Sample data

### API Usage

The vehicles API now returns joined data:
```typescript
{
  id: "uuid",
  plate_number: "ABC123",
  make: { name: "Toyota" },
  model: { name: "Camry" },
  color: { name: "White", hex_code: "#FFFFFF" },
  status: { name: "Available", color: "#10B981" }
}
```

### Future Considerations

1. **Add model_id to vehicles table** when creating new vehicles
2. **Implement color picker** using the hex codes from vehicle_colors
3. **Add status management** for vehicle lifecycle
4. **Implement owner and user management** for complex rental scenarios
5. **Add vehicle images** with proper storage bucket integration

## Maintenance

- **Never modify existing migrations** - create new ones instead
- **Test migrations locally** before deploying
- **Backup database** before running migrations
- **Use Supabase CLI** for consistent local development

