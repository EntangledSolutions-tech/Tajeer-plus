import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      // If we have a user, ensure they have a profile
      if (data.user) {
        await ensureUserProfile(data.user.id, supabase);
      }

      // Redirect to the next page
      return NextResponse.redirect(`${origin}${next}`);
    }

    // If no code, redirect to home
    return NextResponse.redirect(`${origin}/`);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('An unexpected error occurred')}`);
  }
}

async function ensureUserProfile(userId: string, supabase: any) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // If profile already exists, nothing to do
    if (existingProfile && !checkError) {
      return;
    }

    // If error is not "not found", it's a real error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return;
    }

    // Get default role ID
    const { data: defaultRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'User')
      .single();

    if (roleError) {
      console.error('Error fetching default role:', roleError);
      return;
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
    } else {
      console.log(`Profile created for user: ${userId}`);
    }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
  }
}
