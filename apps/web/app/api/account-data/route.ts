import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../lib/database.types';
import { ensureUserProfile } from '../../../lib/auth/profile-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        roles (
          name
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);

      // Try to create a profile for the user
      const profileCreated = await ensureUserProfile(user.id);

      if (profileCreated) {
        // Retry fetching the profile
        const { data: newProfile, error: retryError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            roles (
              name
            )
          `)
          .eq('id', user.id)
          .single();

        if (!retryError && newProfile) {
          const accountData = {
            id: newProfile.id,
            name: `${newProfile.first_name || ''} ${newProfile.last_name || ''}`.trim() || 'User',
            picture_url: newProfile.avatar_url,
          };

          return NextResponse.json({
            success: true,
            data: accountData,
          });
        }
      }

      // If we still can't get/create a profile, return default data
      const defaultAccountData = {
        id: user.id,
        name: 'User',
        picture_url: null,
      };

      return NextResponse.json({
        success: true,
        data: defaultAccountData,
      });
    }

    // Transform the data to match the expected format
    const accountData = {
      id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
      picture_url: profile.avatar_url,
    };

    return NextResponse.json({
      success: true,
      data: accountData,
    });
  } catch (error: any) {
    console.error('Error in GET /api/account-data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
