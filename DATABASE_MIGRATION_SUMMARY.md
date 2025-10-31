# Database Migration: Replace created_by with user_id

## Overview
This migration standardizes user ownership tracking across all tables by replacing `created_by` columns with `user_id` columns and implementing proper Row Level Security (RLS) policies.

## What This Migration Does

### 1. **Replaces created_by with user_id in all tables:**

#### User-Specific Tables (Primary Data):
- **contracts** - Replaces `created_by` with `user_id`, makes it NOT NULL
- **customers** - Adds `user_id` column (didn't have created_by)
- **insurance_policies** - Adds `user_id` column (if table exists)
- **simple_insurance_options** - Adds `user_id` column (if table exists)

#### Configuration Tables (Shared Data):
- **vehicle_makes** - Replaces `created_by` with `user_id` (nullable)
- **vehicle_models** - Replaces `created_by` with `user_id` (nullable)
- **vehicle_colors** - Replaces `created_by` with `user_id` (nullable)
- **vehicle_statuses** - Replaces `created_by` with `user_id` (nullable)
- **vehicle_owners** - Replaces `created_by` with `user_id` (nullable)
- **vehicle_actual_users** - Replaces `created_by` with `user_id` (nullable)
- **vehicle_features** - Replaces `created_by` with `user_id` (nullable)
- **customer_nationalities** - Replaces `created_by` with `user_id` (nullable)
- **customer_professions** - Replaces `created_by` with `user_id` (nullable)
- **customer_classifications** - Replaces `created_by` with `user_id` (nullable)
- **customer_license_types** - Replaces `created_by` with `user_id` (nullable)
- **customer_statuses** - Replaces `created_by` with `user_id` (nullable)
- **contract_statuses** - Replaces `created_by` with `user_id` (nullable)
- **roles** - Replaces `created_by` with `user_id` (nullable)
- **profiles** - Replaces `created_by` with `user_id` (nullable)

### 2. **Data Migration:**
- Migrates existing data: `user_id = created_by` for all existing records
- Drops old `created_by` and `updated_by` columns
- Adds performance indexes on all `user_id` columns

### 3. **Row Level Security (RLS):**
Enables RLS on user-specific tables with policies that ensure:
- Users can only SELECT their own records
- Users can only INSERT records with their own user_id
- Users can only UPDATE their own records
- Users can only DELETE their own records

#### Tables with RLS enabled:
- `contracts`
- `customers`
- `insurance_policies` (if exists)
- `simple_insurance_options` (if exists)

### 4. **Performance Optimizations:**
- Adds indexes on all `user_id` columns for faster queries
- Maintains existing indexes on other important columns

## How It Works

### Before Migration:
```sql
-- Old structure
CREATE TABLE contracts (
    id UUID PRIMARY KEY,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    -- ... other columns
);
```

### After Migration:
```sql
-- New structure
CREATE TABLE contracts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- ... other columns
);

-- RLS Policies
CREATE POLICY "contracts_read" ON contracts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
```

## Security Benefits

1. **Database-Level Security**: RLS policies prevent unauthorized access at the database level
2. **Consistent User Tracking**: All tables now use `user_id` for ownership
3. **Automatic Data Isolation**: Users can only access their own data
4. **Cascade Deletion**: When a user is deleted, their data is automatically cleaned up
5. **Performance**: Indexes ensure fast queries even with user filtering

## API Impact

The existing API code will continue to work because:
- The `addUserIdToData()` helper function adds `user_id` to new records
- The `getUserData()` helper function filters by `user_id`
- The `updateUserRecord()` and `deleteUserRecord()` functions validate ownership

## Migration Safety

This migration is safe because:
- **Non-destructive**: Migrates existing data before dropping columns
- **Backward compatible**: API code already handles `user_id` filtering
- **Rollback possible**: Can be reverted if needed
- **Tested approach**: Uses standard PostgreSQL patterns

## Running the Migration

To apply this migration:

```bash
# Run the migration
supabase db push

# Or if using SQL directly
psql -f supabase/migrations/20250130000000_replace_created_by_with_user_id.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check that user_id columns exist
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'user_id'
AND table_schema = 'public';

-- Check that created_by columns are gone
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'created_by'
AND table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('contracts', 'customers', 'insurance_policies', 'simple_insurance_options');
```

## Next Steps

1. **Run the migration** in your development environment
2. **Test the APIs** to ensure they work correctly
3. **Verify data isolation** by testing with different users
4. **Deploy to production** when ready
5. **Monitor performance** to ensure indexes are working

This migration provides a solid foundation for user-based data isolation at both the application and database levels.
