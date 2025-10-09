import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '../../../../lib/database.types';
import { getAuthenticatedUser, updateUserRecord, deleteUserRecord } from '../../../../lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: contractId } = await params;

    // Get branch_id from query params for validation
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');

    // Fetch contract details
    let query = supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', user.id); // Filter by user

    // Also filter by branch_id if provided
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: contract, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found or access denied', code: 'UNAUTHORIZED_ACCESS' },
          { status: 403 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: contractId } = await params;
    const body = await request.json();

    // Update contract with user ownership validation
    const { data: updatedContract, error } = await updateUserRecord(
      supabase,
      'contracts',
      contractId,
      body,
      user.id
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }

    return NextResponse.json({ success: true, contract: updatedContract });

  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    const { id: contractId } = await params;

    // Delete contract with user ownership validation
    const { error } = await deleteUserRecord(
      supabase,
      'contracts',
      contractId,
      user.id
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
