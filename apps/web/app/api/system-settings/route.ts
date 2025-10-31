import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('system_settings')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query.order('key');

    if (error) {
      console.error('Error fetching system settings:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { settings: settings || [] }
    });
  } catch (error) {
    console.error('Error in GET /api/system-settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Update each setting
    const updatePromises = updates.map(async (update: { key: string; value: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: update.value,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('key', update.key)
        .eq('is_active', true);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        throw error;
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    console.error('Error in PUT /api/system-settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const body = await request.json();
    const { key, value, description, category, is_active = true } = body;

    // Validate required fields
    if (!key || !value || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: key, value, description, category' },
        { status: 400 }
      );
    }

    // Insert new setting
    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        key,
        value,
        description,
        category,
        is_active,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating system setting:', error);

      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: `Setting with key "${key}" already exists` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { setting: data },
      message: 'Setting created successfully'
    });
  } catch (error: any) {
    console.error('Error in POST /api/system-settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

