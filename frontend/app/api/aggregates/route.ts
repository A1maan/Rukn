// frontend/app/api/aggregates/route.ts
import { NextResponse } from 'next/server';
import { supabase, emotionToCategory } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const window = searchParams.get('window') || 'today';
    const channelsParam = searchParams.get('channels');
    const channels = channelsParam ? channelsParam.split(',') : ['call', 'chat', 'survey'];

    // Calculate time range
    let startTime: string;
    
    if (window === 'today') {
      // For "today", start from midnight (12:00 AM) of current day
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      startTime = todayStart.toISOString();
    } else {
      // For other windows, calculate from current time minus window duration
      const windowMinutes = {
        'last_30m': 30,
        'last_60m': 60,
        'last_3h': 180,
        'last_6h': 360,
        'last_12h': 720,
        'last_24h': 1440,
      }[window] || 1440;
      
      startTime = new Date(Date.now() - windowMinutes * 60000).toISOString();
    }

    // If no region specified, return aggregates for all regions
    if (!region) {
      let query = supabase
        .from('requests')
        .select('*')
        .gte('created_at', startTime);
      
      // Filter by channels
      if (channels.length > 0 && channels.length < 3) {
        query = query.in('channel', channels);
      }

      const { data: requests, error } = await query;

      if (error) throw error;

      // Group requests by region
      const regionGroups: Record<string, any[]> = {};
      requests?.forEach(req => {
        if (!regionGroups[req.region]) {
          regionGroups[req.region] = [];
        }
        regionGroups[req.region].push(req);
      });

      // Calculate aggregates for each region
      const regionAggregates = Object.entries(regionGroups).map(([regionCode, regionRequests]) => {
        return calculateAggregate(regionCode, regionRequests, window);
      });

      return NextResponse.json(regionAggregates);
    }

    // Build query for specific region
    let query = supabase
      .from('requests')
      .select('*')
      .gte('created_at', startTime);

    if (region !== 'all') {
      query = query.eq('region', region);
    }

    // Filter by channels
    if (channels.length > 0 && channels.length < 3) {
      query = query.in('channel', channels);
    }

    const { data: requests, error } = await query;
    if (error) throw error;

    const aggregate = calculateAggregate(region, requests || [], window);
    return NextResponse.json(aggregate);
  } catch (error: any) {
    console.error('Error fetching aggregates:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function calculateAggregate(region: string, requests: any[], window: string) {
  // Aggregate counts
  const counts = {
    events: requests?.length || 0,
    calls: requests?.filter(r => r.channel === 'call').length || 0,
    chats: requests?.filter(r => r.channel === 'chat').length || 0,
    surveys: requests?.filter(r => r.channel === 'survey').length || 0
  };

  // Sentiment percentages (using generated column)
  const sentimentCounts = {
    positive: requests?.filter(r => r.sentiment === 'positive').length || 0,
    neutral: requests?.filter(r => r.sentiment === 'neutral').length || 0,
    negative: requests?.filter(r => r.sentiment === 'negative').length || 0
  };
  const totalSentiment = Math.max(1, sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative);
  const sentiment_pct = {
    pos: (sentimentCounts.positive / totalSentiment) * 100,
    neu: (sentimentCounts.neutral / totalSentiment) * 100,
    neg: (sentimentCounts.negative / totalSentiment) * 100
  };

  // Map 11 emotions to 4 categories for frontend
  const emotionCategories = {
    distress: 0, // fear, pessimism
    anger: 0,    // anger, disgust
    sadness: 0,  // sadness
    calm: 0      // happiness, optimism, anticipation, surprise, neutral, confusion
  };

  requests?.forEach(req => {
    if (!req.emotion) {
      emotionCategories.calm++;
      return;
    }
    const category = emotionToCategory(req.emotion);
    emotionCategories[category]++;
  });

  const totalEmotions = Math.max(1, Object.values(emotionCategories).reduce((a, b) => a + b, 0));
  const emotions_pct = {
    distress: (emotionCategories.distress / totalEmotions) * 100,
    anger: (emotionCategories.anger / totalEmotions) * 100,
    sadness: (emotionCategories.sadness / totalEmotions) * 100,
    calm: (emotionCategories.calm / totalEmotions) * 100
  };

  // Top topics (from topic field)
  const topicCounts = requests?.reduce((acc: Record<string, number>, r) => {
    if (r.topic) {
      acc[r.topic] = (acc[r.topic] || 0) + 1;
    }
    return acc;
  }, {}) || {};
  
  const top_topics = Object.entries(topicCounts)
    .map(([key, count]) => ({
      key,
      pct: (count / Math.max(1, counts.events)) * 100
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  // Calculate EWI (Early Warning Index)
  const highUrgencyCount = requests?.filter(r => r.urgency === 'high').length || 0;
  const riskRate = (highUrgencyCount / Math.max(1, counts.events)) * 100;
  
  const ewi = (
    emotions_pct.distress * 0.4 +
    sentiment_pct.neg * 0.25 +
    riskRate * 0.2 +
    0.15 * 30 // Placeholder: 30% ops complaints baseline
  ) / 100;

  // Detect anomalies (simplified - you'll want proper statistical methods)
  const anomalies = [];
  
  // Check if metrics are above typical thresholds
  if (emotions_pct.distress > 40) {
    const zScore = ((emotions_pct.distress - 20) / 10); // Simple z-score approximation
    anomalies.push({ metric: 'distress', z: Number(zScore.toFixed(1)) });
  }
  
  if (sentiment_pct.neg > 50) {
    const zScore = ((sentiment_pct.neg - 30) / 10);
    anomalies.push({ metric: 'negative_sentiment', z: Number(zScore.toFixed(1)) });
  }
  
  if (riskRate > 30) {
    const zScore = ((riskRate - 15) / 8);
    anomalies.push({ metric: 'high_urgency_rate', z: Number(zScore.toFixed(1)) });
  }

  return {
    window,
    region,
    counts,
    sentiment_pct,
    emotions_pct,
    top_topics,
    ewi,
    anomalies
  };
}