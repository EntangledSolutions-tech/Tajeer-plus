# Vehicle Status and Contract Integration

## Overview
This document describes the automatic vehicle status management when contracts are created and deleted.

## Feature Implementation

### 1. Vehicle Status Update on Contract Creation
When a contract is created with a vehicle, the vehicle's status is automatically updated to "In Contract".

**Implementation Location:** `apps/web/app/api/contracts/route.ts`

**Flow:**
1. Contract is successfully created in the database
2. System queries for vehicle status by name ("In Contract")
3. Vehicle's `status_id` is updated to reference the "In Contract" status
4. Vehicle's `updated_at` timestamp is updated

**Error Handling:**
- If the status update fails, the contract creation still succeeds
- Errors are logged for debugging purposes
- User ownership is validated (vehicle must belong to the same user)

### 2. Vehicle Status Reset on Contract Deletion
When a contract is deleted, the associated vehicle's status is automatically reset to "Available".

**Implementation Location:** `apps/web/app/api/contracts/[id]/route.ts`

**Flow:**
1. Contract is retrieved to get the associated vehicle ID
2. Contract is successfully deleted from the database
3. System queries for vehicle status by name ("Available")
4. Vehicle's `status_id` is updated to reference the "Available" status
5. Vehicle's `updated_at` timestamp is updated

**Error Handling:**
- If the status update fails, the contract deletion still succeeds
- Errors are logged for debugging purposes
- User ownership is validated (vehicle must belong to the same user)

## Database Migration

### Migration File: `20251012000000_add_in_contract_vehicle_status.sql`

This migration adds the "In Contract" vehicle status and other intermediate statuses.

**Statuses Added:**
- "Sold" - Vehicle has been sold
- "Under Inspection" - Vehicle is undergoing inspection
- "Awaiting Registration" - Vehicle is awaiting registration
- "In Transit" - Vehicle is being transported
- "Insurance Pending" - Vehicle insurance is pending
- "In Contract" - Vehicle is currently in a rental contract

**Note:** The actual code assigned to each status depends on existing statuses in your database. The system uses status names (not codes) for reliability.

### Applying the Migration

To apply this migration to your database:

```bash
# If using Supabase CLI
npx supabase db reset

# Or apply the specific migration
npx supabase migration up
```

## Vehicle Status Reference

| Status Name           | Description                               | Color   |
|----------------------|-------------------------------------------|---------|
| Available            | Vehicle is available for rental           | #10B981 |
| Rented               | Vehicle is currently rented out           | #3B82F6 |
| Maintenance          | Vehicle is under maintenance              | #F59E0B |
| Out of Service       | Vehicle is out of service                 | #EF4444 |
| Reserved             | Vehicle is reserved for future rental     | #8B5CF6 |
| Sold                 | Vehicle has been sold                     | #9CA3AF |
| Under Inspection     | Vehicle is undergoing inspection          | #F59E0B |
| Awaiting Registration| Vehicle is awaiting registration          | #FCD34D |
| In Transit           | Vehicle is being transported              | #60A5FA |
| Insurance Pending    | Vehicle insurance is pending              | #F97316 |
| **In Contract**      | **Vehicle is currently in a rental contract** | **#06B6D4** |

**Note:** The system uses status names instead of codes for better reliability and flexibility.

## Technical Details

### Database Tables Involved

1. **contracts** - Stores contract information including `selected_vehicle_id`
2. **vehicles** - Stores vehicle information including `status_id`
3. **vehicle_statuses** - Lookup table for vehicle statuses with auto-incrementing codes

### Key Fields

- `contracts.selected_vehicle_id` - UUID reference to the vehicle
- `vehicles.status_id` - UUID reference to the vehicle status
- `vehicle_statuses.code` - Auto-incrementing integer code for each status (system-managed)
- `vehicle_statuses.name` - Human-readable name of the status (used for queries)

### Security Considerations

- All operations validate user ownership using `user_id`
- Vehicles can only be updated by their owners
- Contracts can only be created/deleted by their owners
- Failed status updates don't prevent contract operations from completing

## Future Enhancements

Consider implementing the following enhancements:

1. **Contract Status-Based Updates**: Update vehicle status based on contract status changes (e.g., when contract is completed, cancelled, or suspended)

2. **Status History Tracking**: Maintain a log of vehicle status changes for audit purposes

3. **Business Rules**: Implement validation to prevent creating contracts with vehicles that are not available

4. **Notification System**: Alert administrators when vehicle status updates fail

5. **Batch Operations**: Handle multiple contracts for the same vehicle (e.g., when contracts overlap)

## Troubleshooting

### Vehicle Status Not Updating

**Issue:** Vehicle status doesn't change when contract is created/deleted

**Possible Causes:**
1. Migration not applied - "In Contract" status doesn't exist
2. User ownership mismatch - vehicle belongs to different user
3. Database permissions - user doesn't have update permissions

**Solutions:**
1. Apply the migration: `npx supabase db push` or `npx supabase migration up`
2. Check console logs for detailed error messages
3. Verify user_id matches between vehicle and contract
4. Verify the "In Contract" status exists in the vehicle_statuses table

### Migration Conflicts

**Issue:** Migration fails due to existing statuses

**Solution:** The migration uses `ON CONFLICT (name) DO NOTHING` to prevent duplicate status names. If needed, you can manually adjust the migration or remove conflicting statuses.

## Logging

The implementation includes comprehensive logging:

- **Success:** `Vehicle {vehicleId} status updated to "In Contract"`
- **Success:** `Vehicle {vehicleId} status updated to "Available"`
- **Error:** `Error fetching "In Contract" vehicle status`
- **Error:** `Error fetching "Available" vehicle status`
- **Error:** `Error updating vehicle status`
- **Warning:** `Vehicle status "In Contract" not found`
- **Warning:** `Vehicle status "Available" not found`

Check your server logs for these messages to monitor the feature's operation.

