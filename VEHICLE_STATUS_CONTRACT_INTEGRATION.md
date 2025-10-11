# Vehicle Status and Contract Integration

## Overview
This document describes the automatic vehicle status management when contracts are created and deleted.

## Feature Implementation

### 1. Vehicle Status Update on Contract Creation
When a contract is created with a vehicle, the vehicle's status is automatically updated to "In Contract" (code 11).

**Implementation Location:** `apps/web/app/api/contracts/route.ts`

**Flow:**
1. Contract is successfully created in the database
2. System queries for vehicle status with code 11 ("In Contract")
3. Vehicle's `status_id` is updated to reference the "In Contract" status
4. Vehicle's `updated_at` timestamp is updated

**Error Handling:**
- If the status update fails, the contract creation still succeeds
- Errors are logged for debugging purposes
- User ownership is validated (vehicle must belong to the same user)

### 2. Vehicle Status Reset on Contract Deletion
When a contract is deleted, the associated vehicle's status is automatically reset to "Available" (code 1).

**Implementation Location:** `apps/web/app/api/contracts/[id]/route.ts`

**Flow:**
1. Contract is retrieved to get the associated vehicle ID
2. Contract is successfully deleted from the database
3. System queries for vehicle status with code 1 ("Available")
4. Vehicle's `status_id` is updated to reference the "Available" status
5. Vehicle's `updated_at` timestamp is updated

**Error Handling:**
- If the status update fails, the contract deletion still succeeds
- Errors are logged for debugging purposes
- User ownership is validated (vehicle must belong to the same user)

## Database Migration

### Migration File: `20251012000000_add_in_contract_vehicle_status.sql`

This migration adds the "In Contract" vehicle status and other intermediate statuses to ensure code 11 is assigned correctly.

**Statuses Added:**
- Code 6: "Sold" - Vehicle has been sold
- Code 7: "Under Inspection" - Vehicle is undergoing inspection
- Code 8: "Awaiting Registration" - Vehicle is awaiting registration
- Code 9: "In Transit" - Vehicle is being transported
- Code 10: "Insurance Pending" - Vehicle insurance is pending
- Code 11: "In Contract" - Vehicle is currently in a rental contract

### Applying the Migration

To apply this migration to your database:

```bash
# If using Supabase CLI
npx supabase db reset

# Or apply the specific migration
npx supabase migration up
```

## Vehicle Status Codes Reference

| Code | Status Name          | Description                               | Color   |
|------|---------------------|-------------------------------------------|---------|
| 1    | Available           | Vehicle is available for rental           | #10B981 |
| 2    | Rented              | Vehicle is currently rented out           | #3B82F6 |
| 3    | Maintenance         | Vehicle is under maintenance              | #F59E0B |
| 4    | Out of Service      | Vehicle is out of service                 | #EF4444 |
| 5    | Reserved            | Vehicle is reserved for future rental     | #8B5CF6 |
| 6    | Sold                | Vehicle has been sold                     | #9CA3AF |
| 7    | Under Inspection    | Vehicle is undergoing inspection          | #F59E0B |
| 8    | Awaiting Registration| Vehicle is awaiting registration         | #FCD34D |
| 9    | In Transit          | Vehicle is being transported              | #60A5FA |
| 10   | Insurance Pending   | Vehicle insurance is pending              | #F97316 |
| 11   | In Contract         | Vehicle is currently in a rental contract | #06B6D4 |

## Technical Details

### Database Tables Involved

1. **contracts** - Stores contract information including `selected_vehicle_id`
2. **vehicles** - Stores vehicle information including `status_id`
3. **vehicle_statuses** - Lookup table for vehicle statuses with auto-incrementing codes

### Key Fields

- `contracts.selected_vehicle_id` - UUID reference to the vehicle
- `vehicles.status_id` - UUID reference to the vehicle status
- `vehicle_statuses.code` - Auto-incrementing integer code for each status
- `vehicle_statuses.name` - Human-readable name of the status

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
1. Migration not applied - status with code 11 doesn't exist
2. User ownership mismatch - vehicle belongs to different user
3. Database permissions - user doesn't have update permissions

**Solutions:**
1. Run the migration: `npx supabase migration up`
2. Check console logs for detailed error messages
3. Verify user_id matches between vehicle and contract

### Migration Conflicts

**Issue:** Migration fails due to existing statuses

**Solution:** The migration uses `ON CONFLICT (name) DO NOTHING` to prevent duplicate status names. If needed, you can manually adjust the migration or remove conflicting statuses.

## Logging

The implementation includes comprehensive logging:

- **Success:** `Vehicle {vehicleId} status updated to "In Contract"`
- **Success:** `Vehicle {vehicleId} status updated to "Available"`
- **Error:** `Error fetching vehicle status with code X`
- **Error:** `Error updating vehicle status`
- **Warning:** `Vehicle status with code X not found`

Check your server logs for these messages to monitor the feature's operation.

