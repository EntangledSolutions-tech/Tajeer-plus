import { getSupabaseServerClient } from '@kit/supabase/server-client';

export interface CreateProfileData {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Ensures a user has a profile record in the database
 * This should be called after successful authentication
 */
export async function ensureUserProfile(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // If profile already exists, nothing to do
    if (existingProfile && !checkError) {
      return true;
    }

    // If error is not "not found", it's a real error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return false;
    }

    // Get default role ID
    const { data: defaultRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'User')
      .single();

    if (roleError) {
      console.error('Error fetching default role:', roleError);
      return false;
    }

    // Create new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: 'User',
        last_name: '',
        role_id: defaultRole.id
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }

    console.log(`Profile created for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
}

/**
 * Creates a profile for a new user with additional data
 */
export async function createUserProfile(data: CreateProfileData): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.userId)
      .single();

    // If profile already exists, update it
    if (existingProfile && !checkError) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName || 'User',
          last_name: data.lastName || '',
        })
        .eq('id', data.userId);

      return !updateError;
    }

    // Get default role ID
    const { data: defaultRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'User')
      .single();

    if (roleError) {
      console.error('Error fetching default role:', roleError);
      return false;
    }

    // Create new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: data.userId,
        first_name: data.firstName || 'User',
        last_name: data.lastName || '',
        role_id: defaultRole.id
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }

    console.log(`Profile created for user: ${data.userId}`);
    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return false;
  }
}

/**
 * Updates an existing user profile
 */
export async function updateUserProfile(userId: string, updates: {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
}
