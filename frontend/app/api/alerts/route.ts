// frontend/app/api/alerts/route.ts
// GET /api/alerts - List all alerts (with optional filters)

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected
    const region = searchParams.get('region');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by region if provided
    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    const { data: alerts, error } = await query;
    if (error) throw error;

    // Transform to frontend format
    const transformedAlerts = alerts?.map(alert => {
      // Parse metadata JSONB field
      const metadata = alert.metadata || {};
      
      return {
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
        recommendations: metadata.recommendations || [
          {
            type: 'staffing',
            text: `Review staffing levels in ${alert.region}`
          }
        ],
        status: alert.status || 'pending',
        confidence: alert.confidence || metadata.confidence || 0.8,
        reviewed_by: alert.reviewed_by || null,
        reviewed_at: alert.reviewed_at || null,
        review_notes: alert.review_notes || null
      };
    }) || [];

    return NextResponse.json(transformedAlerts);
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}