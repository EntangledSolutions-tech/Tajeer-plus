# User Data Isolation and Branch Filtering Implementation

## Overview
This document outlines the implementation of user data isolation and branch-based filtering for the Tajeer+ SaaS platform.

## Changes Made

### 1. Database Schema Updates

#### Migration: `20250208000001_add_branch_id_to_customers_and_contracts.sql`
- Added `branch_id` column to `customers` table
- Added `branch_id` column to `contracts` table
- Added foreign key constraints linking to `branches` table
- Created indexes for improved query performance
- Auto-populated `branch_id` for existing records using user's first active branch

### 2. User Authentication & Data Isolation

#### Existing Implementation (Already in place):
- **Vehicles Table**: Has `user_id` column with RLS policies filtering by `auth.uid()`
- **Customers Table**: Has `user_id` column with RLS policies  filtering by `auth.uid()`
- **Contracts Table**: Has `user_id` column with RLS policies filtering by `auth.uid()`

#### RLS Policies:
All tables have Row Level Security (RLS) enabled with policies that:
- Allow users to only view their own data (`user_id = auth.uid()`)
- Allow users to only insert records with their own `user_id`
- Allow users to only update their own records
- Allow users to only delete their own records

### 3. API Routes Updates

#### Vehicles API (`/apps/web/app/api/vehicles/route.ts`)
- **GET**: Filters by `user_id` and optionally by `branch_id` (query param)
- **POST**: Requires `branch_id` and automatically adds `user_id`

#### Customers API (`/apps/web/app/api/customers/route.ts`)
- **GET**: Filters by `user_id` and optionally by `branch_id` (query param)
- **POST**: Requires `branch_id` and automatically adds `user_id`

#### Contracts API (`/apps/web/app/api/contracts/route.ts`)
- **GET**: Filters by `user_id` and optionally by `branch_id` (query param)
- **POST**: Requires `branch_id` and automatically adds `user_id`
- **PUT**: Validates user ownership before updating

#### Add Vehicle API (`/apps/web/app/api/add-vehicle/route.ts`)
- Requires `branch_id` in request body
- Automatically adds `user_id` from authenticated session

### 4. Frontend Components Updates

#### Branch Context Integration
All list components now use the `useBranch()` hook to get the selected branch and automatically filter data:

**VehicleList** (`/apps/web/app/vehicles/VehicleList.tsx`):
- Imports `useBranch` from branch context
- Automatically includes `selectedBranch.id` in API requests when a branch is selected
- Refetches data when selected branch changes

**CustomerList** (`/apps/web/app/customers/CustomerList.tsx`):
- Imports `useBranch` from branch context
- Automatically includes `selectedBranch.id` in API requests when a branch is selected
- Refetches data when selected branch changes

**ContractsList** (`/apps/web/app/contracts/ContractsList.tsx`):
- Imports `useBranch` from branch context
- Automatically includes `selectedBranch.id` in API requests when a branch is selected
- Refetches data when selected branch changes

#### Modal Components
All creation modals now validate that a branch is selected before creating records:

**VehicleModal** (`/apps/web/app/vehicles/VehicleModal/index.tsx`):
- Validates `selectedBranch` exists before submission
- Includes `branch_id` in the API request

**CustomerModal** (`/apps/web/app/customers/CustomerModal/index.tsx`):
- Validates `selectedBranch` exists before submission
- Includes `branch_id` in the API request

**ContractModal** (`/apps/web/app/contracts/ContractModal/index.tsx`):
- Validates `selectedBranch` exists before submission
- Includes `branch_id` in the API request

### 5. Data Flow

#### When Creating Records:
1. User must have a branch selected (from branch selector in navbar)
2. Modal validates that `selectedBranch` exists
3. API receives `branch_id` and `user_id` is added automatically
4. Record is created with both `user_id` and `branch_id`

#### When Viewing Records:
1. API filters by `user_id` (enforced by RLS policies)
2. If a branch is selected, API additionally filters by `branch_id`
3. Only records belonging to the user AND the selected branch are returned

## Security Features

### Row Level Security (RLS)
- All main tables have RLS enabled
- Policies enforce that users can only access their own data
- Database-level security ensures data isolation even if application logic fails

### API-Level Validation
- All POST requests validate `branch_id` is provided
- All requests validate user authentication
- User ownership is verified before updates/deletes
- **Detail endpoints** verify both `user_id` AND `branch_id` match
- Returns HTTP 403 Forbidden for unauthorized access attempts
- Special error message "access denied" for easy frontend detection

### Branch Isolation
- Users can only create records for branches they have access to
- Frontend automatically filters data by selected branch
- Backend enforces branch filtering via query parameters
- **Detail views** require exact match of both user and branch
- **URL manipulation blocked** - direct URL access validated server-side

### Enhanced Detail View Security
The following detail endpoints have enhanced security:
- `GET /api/vehicles/[id]?branch_id=xxx` - Validates user + branch ownership
- `GET /api/customers/[id]?branch_id=xxx` - Validates user + branch ownership
- `GET /api/contracts/[id]?branch_id=xxx` - Validates user + branch ownership (newly created)

Frontend pages detect 403 errors and:
1. Show toast notification with clear error message
2. Automatically redirect to `/home` page
3. Prevent displaying unauthorized data

## Branch Context

The application uses a `BranchContext` (`/apps/web/contexts/branch-context.tsx`) that:
- Stores the selected branch in localStorage
- Provides `selectedBranch` and `setSelectedBranch` to all components
- Clears selected branch on logout/login to prevent data leakage
- Persists across page refreshes

## Testing Requirements

Before deploying to production, test the following scenarios:

1. **User Isolation**:
   - Create records as User A
   - Login as User B
   - Verify User B cannot see User A's records

2. **Branch Filtering**:
   - Create records for Branch A (while Branch A is selected)
   - Switch to Branch B
   - Verify only Branch B records are visible
   - Switch back to Branch A
   - Verify Branch A records are visible again

3. **Creation Validation**:
   - Try to create a vehicle/customer/contract without selecting a branch
   - Verify error message is shown
   - Select a branch and retry
   - Verify creation succeeds with correct `branch_id`

4. **RLS Enforcement**:
   - Attempt direct API calls with another user's `user_id`
   - Verify RLS policies prevent unauthorized access

5. **URL Manipulation Protection** (NEW):
   - As User A, create a vehicle in Branch 1
   - Note the vehicle ID from the URL
   - Switch to Branch 2
   - Try to access the vehicle by typing the URL directly
   - **Expected**: Toast error message + redirect to /home
   - Login as User B
   - Try to access User A's vehicle by typing the URL
   - **Expected**: Toast error message + redirect to /home

6. **Same tests for Customers and Contracts**:
   - Repeat URL manipulation test for customer details
   - Repeat URL manipulation test for contract details

## Migration Steps

To apply these changes to your database:

1. The migration file `20250208000001_add_branch_id_to_customers_and_contracts.sql` will be automatically applied when you run:
   ```bash
   npx supabase db reset --local
   ```

2. For production, push the migration:
   ```bash
   npx supabase db push
   ```

## Additional Improvements

### HTTP Service Enhanced
Updated `/apps/web/lib/http-service.ts` to include HTTP status codes in responses:
- Added optional `status` property to `HttpResponse` interface
- All HTTP methods (GET, POST, PUT, DELETE) now return status codes
- Enables frontend to detect 403 Forbidden responses
- Allows for proper error handling and user feedback

### Files Modified

**API Routes**:
- `/apps/web/app/api/vehicles/route.ts` - List endpoint with branch filtering
- `/apps/web/app/api/vehicles/[id]/route.ts` - Detail endpoint with user + branch validation
- `/apps/web/app/api/customers/route.ts` - List endpoint with branch filtering
- `/apps/web/app/api/customers/[id]/route.ts` - Detail endpoint with user + branch validation
- `/apps/web/app/api/contracts/route.ts` - List endpoint with branch filtering
- `/apps/web/app/api/contracts/[id]/route.ts` - **NEWLY CREATED** Detail endpoint with user + branch validation
- `/apps/web/app/api/add-vehicle/route.ts` - Updated to require branch_id

**Frontend List Pages**:
- `/apps/web/app/vehicles/VehicleList.tsx` - Auto-filters by selected branch
- `/apps/web/app/customers/CustomerList.tsx` - Auto-filters by selected branch
- `/apps/web/app/contracts/ContractsList.tsx` - Auto-filters by selected branch

**Frontend Detail Pages**:
- `/apps/web/app/vehicles/VehicleDetails/layout.tsx` - Validates access, redirects on 403
- `/apps/web/app/customers/CustomerDetails/layout.tsx` - Validates access, redirects on 403
- `/apps/web/app/contracts/[id]/page.tsx` - Validates access, redirects on 403

**Modal Components**:
- `/apps/web/app/vehicles/VehicleModal/index.tsx` - Requires branch selection
- `/apps/web/app/customers/CustomerModal/index.tsx` - Requires branch selection
- `/apps/web/app/contracts/ContractModal/index.tsx` - Requires branch selection

**Core Services**:
- `/apps/web/lib/http-service.ts` - Enhanced with status codes

**Database**:
- `/supabase/migrations/20250208000001_add_branch_id_to_customers_and_contracts.sql` - Adds branch_id columns
- `/supabase/migrations/20250130000001_fix_profiles_rls_policies.sql` - Fixed migration conflicts

## Notes

- The `branch_id` column is nullable to support gradual migration
- Existing records are auto-linked to the user's first active branch
- The old `branch` text field in vehicles table is kept for backward compatibility
- All new records must have a `branch_id` set
- Sample vehicle seed data removed (`20250131000006_add_sample_vehicles.sql` deleted)
- Migration conflicts fixed (duplicate `20250130000001` files consolidated)

