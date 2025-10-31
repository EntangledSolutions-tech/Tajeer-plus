import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { User } from '@supabase/supabase-js';

/**
 * Helper function to get authenticated user from request
 * Returns user object or throws error response
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ user: User; supabase: any }> {
  const supabase = getSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return { user, supabase };
}

/**
 * Helper function to ensure user can only access their own data
 * Adds user_id filter to Supabase query
 */
export function addUserFilter(query: any, userId: string) {
  return query.eq('user_id', userId);
}

/**
 * Helper function to add user_id to data when creating records
 */
export function addUserIdToData(data: any, userId: string) {
  return {
    ...data,
    user_id: userId
  };
}

/**
 * Helper function to validate user ownership of a record
 * Checks if the record belongs to the authenticated user
 */
export async function validateUserOwnership(
  supabase: any,
  tableName: string,
  recordId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Helper function to get user-specific data with proper filtering
 * Automatically adds user_id filter to queries
 */
export async function getUserData(
  supabase: any,
  tableName: string,
  userId: string,
  select: string = '*',
  additionalFilters: any = {}
) {
  let query = supabase
    .from(tableName)
    .select(select, { count: 'exact' })
    .eq('user_id', userId);

  // Apply additional filters
  Object.entries(additionalFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query = query.eq(key, value);
    }
  });

  return query;
}

/**
 * Helper function to create user-specific records
 * Automatically adds user_id to the data
 */
export async function createUserRecord(
  supabase: any,
  tableName: string,
  data: any,
  userId: string
) {
  const dataWithUserId = addUserIdToData(data, userId);

  return supabase
    .from(tableName)
    .insert(dataWithUserId)
    .select();
}

/**
 * Helper function to update user-specific records
 * Ensures user can only update their own records
 */
export async function updateUserRecord(
  supabase: any,
  tableName: string,
  recordId: string,
  data: any,
  userId: string
) {
  // First validate ownership
  const isOwner = await validateUserOwnership(supabase, tableName, recordId, userId);

  if (!isOwner) {
    throw new NextResponse(
      JSON.stringify({ error: 'Access denied - you can only update your own records' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return supabase
    .from(tableName)
    .update(data)
    .eq('id', recordId)
    .eq('user_id', userId)
    .select();
}

/**
 * Helper function to delete user-specific records
 * Ensures user can only delete their own records
 */
export async function deleteUserRecord(
  supabase: any,
  tableName: string,
  recordId: string,
  userId: string
) {
  // First validate ownership
  const isOwner = await validateUserOwnership(supabase, tableName, recordId, userId);

  if (!isOwner) {
    throw new NextResponse(
      JSON.stringify({ error: 'Access denied - you can only delete your own records' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return supabase
    .from(tableName)
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId);
}

/**
 * Configuration tables that should NOT be filtered by user
 * These are shared across all users
 */
export const SHARED_CONFIGURATION_TABLES = [
  'vehicle_makes',
  'vehicle_models',
  'vehicle_colors',
  'vehicle_statuses',
  'vehicle_owners',
  'vehicle_actual_users',
  'contract_statuses',
  'customer_statuses',
  'insurance_options',
  'branches' // Branches might be shared depending on business logic
];

/**
 * User-specific tables that SHOULD be filtered by user
 */
export const USER_SPECIFIC_TABLES = [
  'vehicles',
  'customers',
  'contracts',
  'insurance_policies',
  'simple_insurance_options',
  'vehicle_transfers',
  'vehicle_maintenance',
  'contract_documents',
  'vehicle_accidents',
  'branches'
];

/**
 * Helper function to determine if a table should be filtered by user
 */
export function shouldFilterByUser(tableName: string): boolean {
  return USER_SPECIFIC_TABLES.includes(tableName);
}

/**
 * Helper function to get pagination parameters from request
 */
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';

  return {
    page,
    limit,
    search,
    offset: (page - 1) * limit
  };
}

/**
 * Helper function to build pagination response
 */
export function buildPaginationResponse(data: any[], count: number, page: number, limit: number) {
  const totalPages = Math.ceil(count / limit);

  return {
    success: true,
    data: data || [],
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}
