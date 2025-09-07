import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        roles:role_id (
          id,
          name,
          description,
          permissions
        ),
        branches:branch_id (
          id,
          name,
          code
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);

      // If profile doesn't exist, create a default one
      if (profileError.code === 'PGRST116') {
        // Get default role
        const { data: defaultRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'User')
          .single();

        // Create default profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: user.user_metadata?.first_name || 'User',
            last_name: user.user_metadata?.last_name || '',
            role_id: defaultRole?.id
          })
          .select(`
            *,
            roles:role_id (
              id,
              name,
              description,
              permissions
            ),
            branches:branch_id (
              id,
              name,
              code
            )
          `)
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          profile: {
            ...newProfile,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at
          }
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, phone, avatar_url } = body;

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name,
        last_name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select(`
        *,
        roles:role_id (
          id,
          name,
          description,
          permissions
        ),
        branches:branch_id (
          id,
          name,
          code
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedProfile,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
