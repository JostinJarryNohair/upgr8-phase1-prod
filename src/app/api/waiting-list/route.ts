import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['coach', 'player', 'scout', 'parent'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEntry, error: checkError } = await supabase
      .from('waiting_list')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing email:', checkError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingEntry) {
      return NextResponse.json(
        { message: 'You are already on the waiting list!' },
        { status: 200 }
      );
    }

    // Insert new waiting list entry
    const { data, error } = await supabase
      .from('waiting_list')
      .insert([
        {
          email,
          role,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting waiting list entry:', error);
      return NextResponse.json(
        { error: 'Failed to join waiting list' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Successfully joined the waiting list!',
        data: { email: data.email, role: data.role }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get waiting list statistics (without exposing emails)
    const { data, error } = await supabase
      .from('waiting_list')
      .select('role, created_at');

    if (error) {
      console.error('Error fetching waiting list stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: data.length,
      coaches: data.filter(entry => entry.role === 'coach').length,
      players: data.filter(entry => entry.role === 'player').length,
      scouts: data.filter(entry => entry.role === 'scout').length,
      parents: data.filter(entry => entry.role === 'parent').length,
      recent: data.filter(entry => {
        const created = new Date(entry.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length
    };

    return NextResponse.json({ stats }, { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}