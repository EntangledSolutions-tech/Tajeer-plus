import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient<Database>();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, return hardcoded insurance companies since there's no specific table
    // In a real scenario, this would come from a database table
    const insuranceCompanies = [
      {
        id: '1',
        name: 'Tawuniya',
        code: 'TAW',
        description: 'The Company for Cooperative Insurance',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'SABB Takaful',
        code: 'SAB',
        description: 'SABB Takaful Company',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Malath Insurance',
        code: 'MAL',
        description: 'Malath Cooperative Insurance Company',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'AXA Cooperative',
        code: 'AXA',
        description: 'AXA Cooperative Insurance Company',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Allianz',
        code: 'ALL',
        description: 'Allianz Saudi Fransi Cooperative Insurance Company',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Al Rajhi Takaful',
        code: 'ART',
        description: 'Al Rajhi Company for Cooperative Insurance',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '7',
        name: 'Bupa Arabia',
        code: 'BUP',
        description: 'Bupa Arabia for Cooperative Insurance',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Wala Insurance',
        code: 'WAL',
        description: 'Wala Cooperative Insurance Company',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json(
      {
        success: true,
        data: {
          companies: insuranceCompanies
        },
        message: 'Insurance companies fetched successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
