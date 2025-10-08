import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { createUserProfile } from '../../../../lib/auth/profile-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || 'User',
          last_name: lastName || '',
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // If user was created successfully, create their profile
    if (data.user) {
      const profileCreated = await createUserProfile({
        userId: data.user.id,
        firstName: firstName || 'User',
        lastName: lastName || '',
        email: email
      });

      if (!profileCreated) {
        console.error('Failed to create profile for user:', data.user.id);
        // Don't fail the signup, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: data.user,
      session: data.session
    });

  } catch (error: any) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
