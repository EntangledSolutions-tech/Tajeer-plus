'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@kit/supabase/hooks/use-user';
import { createClientComponentClient } from '@kit/supabase/client-component';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const ensureProfile = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();

        // First, check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (existingProfile && !checkError) {
          setProfile(existingProfile);
          setLoading(false);
          return;
        }

        // If profile doesn't exist, create one
        if (checkError && checkError.code === 'PGRST116') {
          // Get default role
          const { data: defaultRole, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'User')
            .single();

          if (roleError) {
            throw new Error('Failed to get default role');
          }

          // Create profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              first_name: 'User',
              last_name: '',
              role_id: defaultRole.id
            })
            .select()
            .single();

          if (createError) {
            throw new Error('Failed to create profile');
          }

          setProfile(newProfile);
        } else {
          throw new Error('Failed to check profile');
        }
      } catch (err) {
        console.error('Profile error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    ensureProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;

    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return false;
      }

      // Refresh profile data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!fetchError && updatedProfile) {
        setProfile(updatedProfile);
      }

      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
