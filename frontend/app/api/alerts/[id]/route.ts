// frontend/app/api/alerts/[id]/route.ts
// PATCH /api/alerts/:id - Update alert (approve, reject, or other actions)

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.action) {
      return NextResponse.json(
        { error: 'Action is required. Must be one of: approve, reject' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['approve', 'reject'];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected'
    };

    // Update alert (using dedicated columns, not metadata)
    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: statusMap[body.action],
        reviewed_at: new Date().toISOString(),
        reviewed_by: body.reviewedBy || null,
        review_notes: body.notes || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Handle specific errors
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // TODO: Trigger downstream actions based on approval
    if (body.action === 'approve') {
      // - Send notifications to relevant teams
      // - Update operational dashboards
      // - Create audit log entry
      // - Alert supervisors in affected regions
      // - Trigger recommended actions (staffing, routing, etc.)
      console.log(`Alert ${id} approved. Triggering actions...`);
    }

    return NextResponse.json({ 
      success: true, 
      action: body.action,
      data 
    });
  } catch (error: any) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Optional: GET single alert details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: alert, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Transform to frontend format
    const metadata = alert.metadata || {};
    
    const transformedAlert = {
      id: alert.id,
      ts: alert.created_at,
      region: alert.region,
      summary: alert.summary,
      evidence: {
        window: alert.time_window || 'last_60m',
        z_scores: alert.z_score ? { [alert.alert_type]: alert.z_score } : {},
        top_phrases: metadata.top_phrases || [],
        flagged_count: metadata.flagged_count || 0
      },
      recommendations: metadata.recommendations || [],
      status: alert.status || 'pending',
      confidence: alert.confidence || metadata.confidence || 0.8,
      reviewed_by: alert.reviewed_by || null,
      reviewed_at: alert.reviewed_at || null,
      review_notes: alert.review_notes || null
    };

    return NextResponse.json(transformedAlert);
  } catch (error: any) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}