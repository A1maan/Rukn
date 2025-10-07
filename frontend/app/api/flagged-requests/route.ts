// frontend/app/api/flagged-requests/route.ts
import { NextResponse } from 'next/server';
import { supabase, emotionToCategory, normalizeUrgency } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status') || 'pending';
    const urgency = searchParams.get('urgency'); // Can be 'high', 'medium', 'low', or null

    // Option 1: Use the pre-computed view (RECOMMENDED - includes region names)
    let query = supabase
      .from('flagged_requests_summary')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(50);

    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    if (urgency) {
      // Frontend sends 'HIGH', 'MEDIUM', 'LOW' but DB has 'high', 'medium', 'low'
      query = query.eq('urgency', urgency.toLowerCase());
    }

    const { data: requests, error } = await query;
    
    // Fallback to direct table query if view doesn't exist
    if (error && error.message.includes('does not exist')) {
      console.warn('View not available, falling back to direct query');
      return await getFlaggedRequestsDirectly(region, status, urgency);
    }
    
    if (error) throw error;

    // Transform to frontend format
    const flaggedRequests = requests?.map(req => ({
      id: req.id,
      ts: req.created_at,
      channel: req.channel,
      region: req.region,
      text_preview: req.text_preview || '', // Already generated in view
      urgency: normalizeUrgency(req.urgency), // Convert 'high' → 'HIGH'
      confidence: req.confidence || 0.75,
      category: req.topic || 'general',
      emotion: emotionToCategory(req.emotion), // Map 11 emotions → 4 categories
      status: req.status || 'pending'
    })) || [];

    return NextResponse.json(flaggedRequests);
  } catch (error: any) {
    console.error('Error fetching flagged requests:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Fallback function for direct table query
async function getFlaggedRequestsDirectly(region: string | null, status: string, urgency: string | null = null) {
  let query = supabase
    .from('requests')
    .select('*')
    .eq('is_flagged', true)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50);

  if (region && region !== 'all') {
    query = query.eq('region', region);
  }

  if (urgency) {
    query = query.eq('urgency', urgency.toLowerCase());
  }

  const { data: requests, error } = await query;
  if (error) throw error;

  // Transform to frontend format
  const flaggedRequests = requests?.map(req => ({
    id: req.id,
    ts: req.created_at,
    channel: req.channel,
    region: req.region,
    text_preview: req.text_content?.substring(0, 150) || '', // Generate on-the-fly
    urgency: normalizeUrgency(req.urgency), // Convert 'high' → 'HIGH'
    confidence: req.confidence || 0.75,
    category: req.topic || 'general',
    emotion: emotionToCategory(req.emotion), // Map 11 emotions → 4 categories
    status: req.status || 'pending'
  })) || [];

  return NextResponse.json(flaggedRequests);
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'reviewed', 'escalated', 'dismissed'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('requests')
      .update({
        status: body.status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: body.reviewed_by || null,
        review_notes: body.review_notes || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating flagged request:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}