// frontend/app/api/generate-alerts/route.ts
// Automatically generates alerts based on anomalies
// Run this periodically (every 5-10 minutes) or after each new request

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST() {
  try {
    console.log('🔍 Checking for anomalies...');
    
    const alerts = await detectAnomalies();
    
    if (alerts.length > 0) {
      console.log(`🚨 Found ${alerts.length} anomalies, creating alerts...`);
      
      // Insert new alerts
      const { data, error } = await supabase
        .from('alerts')
        .insert(alerts)
        .select();
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        alerts_created: data.length,
        alerts: data
      });
    }
    
    return NextResponse.json({
      success: true,
      alerts_created: 0,
      message: 'No anomalies detected'
    });
    
  } catch (error: any) {
    console.error('Error generating alerts:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function detectAnomalies() {
  const alerts: any[] = [];
  
  // Get current hour stats
  const currentHourStart = new Date();
  currentHourStart.setMinutes(0, 0, 0);
  
  // Get previous hour stats for comparison
  const previousHourStart = new Date(currentHourStart.getTime() - 60 * 60 * 1000);
  
  // Fetch regions
  const { data: regions } = await supabase
    .from('regions')
    .select('code, name_en, name_ar');
  
  if (!regions) return alerts;
  
  for (const region of regions) {
    // Get current hour data
    const { data: currentRequests } = await supabase
      .from('requests')
      .select('emotion, urgency, sentiment, topic')
      .eq('region', region.code)
      .gte('created_at', currentHourStart.toISOString());
    
    // Get previous hour data
    const { data: previousRequests } = await supabase
      .from('requests')
      .select('emotion, urgency, sentiment, topic')
      .eq('region', region.code)
      .gte('created_at', previousHourStart.toISOString())
      .lt('created_at', currentHourStart.toISOString());
    
    if (!currentRequests || currentRequests.length < 5) {
      continue; // Need minimum data
    }
    
    // Calculate metrics
    const currentMetrics = calculateMetrics(currentRequests);
    const previousMetrics = previousRequests ? calculateMetrics(previousRequests) : null;
    
    // Check for anomalies
    const anomaly = detectRegionAnomaly(region, currentMetrics, previousMetrics);
    
    if (anomaly) {
      alerts.push(anomaly);
    }
  }
  
  return alerts;
}

function calculateMetrics(requests: any[]) {
  const total = requests.length;
  
  // Distress emotions (fear, pessimism, sadness)
  const distressCount = requests.filter(r => 
    ['fear', 'pessimism', 'sadness'].includes(r.emotion)
  ).length;
  
  // High urgency
  const highUrgencyCount = requests.filter(r => r.urgency === 'high').length;
  
  // Negative sentiment
  const negativeCount = requests.filter(r => r.sentiment === 'negative').length;
  
  // Crisis topics
  const crisisCount = requests.filter(r => r.topic === 'Crisis').length;
  
  // Calculate percentages
  return {
    total,
    distress_pct: (distressCount / total) * 100,
    high_urgency_pct: (highUrgencyCount / total) * 100,
    negative_pct: (negativeCount / total) * 100,
    crisis_pct: (crisisCount / total) * 100,
    ewi: calculateEWI(distressCount, negativeCount, highUrgencyCount, total)
  };
}

function calculateEWI(distress: number, negative: number, highUrgency: number, total: number) {
  if (total === 0) return 0;
  
  const distressPct = distress / total;
  const negativePct = negative / total;
  const urgencyPct = highUrgency / total;
  
  return (
    distressPct * 0.4 +
    negativePct * 0.25 +
    urgencyPct * 0.2 +
    0.15 * 0.3 // Ops complaints placeholder
  );
}

function detectRegionAnomaly(
  region: any,
  current: ReturnType<typeof calculateMetrics>,
  previous: ReturnType<typeof calculateMetrics> | null
) {
  // Threshold 1: Absolute high EWI (> 0.6)
  if (current.ewi > 0.6) {
    return {
      region: region.code,
      alert_type: 'high_ewi',
      summary: `مستويات التحذير المبكر مرتفعة جداً في ${region.name_ar} (${(current.ewi * 100).toFixed(0)}%)`,
      z_score: calculateZScore(current.ewi, 0.3, 0.15), // mean=0.3, std=0.15
      related_topic: null, // Will be filled by getMostCommonTopic
      time_window: 'last_60m',
      status: 'pending',
      confidence: 0.85,
      metadata: {
        current_ewi: current.ewi,
        distress_pct: current.distress_pct,
        high_urgency_pct: current.high_urgency_pct,
        total_requests: current.total,
        top_phrases: [], // Would come from NLP
        flagged_count: Math.floor(current.total * 0.4),
        recommendations: [
          {
            type: 'staffing',
            text: `زيادة عدد المستشارين في ${region.name_ar} بمقدار 2-3 أشخاص`
          },
          {
            type: 'routing',
            text: 'تحويل الحالات العاجلة مباشرة إلى المتخصصين'
          },
          {
            type: 'messaging',
            text: 'إرسال رسائل دعم نفسي فوري للمنطقة'
          }
        ]
      }
    };
  }
  
  // Threshold 2: Sharp increase compared to previous hour
  if (previous && previous.total >= 5) {
    const ewiIncrease = current.ewi - previous.ewi;
    const percentIncrease = (ewiIncrease / previous.ewi) * 100;
    
    // Alert if EWI increased by > 40% AND is now > 0.45
    if (percentIncrease > 40 && current.ewi > 0.45) {
      return {
        region: region.code,
        alert_type: 'ewi_spike',
        summary: `ارتفاع حاد في مؤشر التحذير المبكر في ${region.name_ar} (+${percentIncrease.toFixed(0)}%)`,
        z_score: calculateZScore(ewiIncrease, 0, 0.1),
        related_topic: null,
        time_window: 'last_60m',
        status: 'pending',
        confidence: 0.78,
        metadata: {
          previous_ewi: previous.ewi,
          current_ewi: current.ewi,
          increase_pct: percentIncrease,
          distress_pct: current.distress_pct,
          total_requests: current.total,
          top_phrases: [],
          flagged_count: Math.floor(current.total * 0.35),
          recommendations: [
            {
              type: 'staffing',
              text: `مراجعة توزيع الموارد البشرية في ${region.name_ar}`
            },
            {
              type: 'monitoring',
              text: 'مراقبة مستمرة للساعات القادمة'
            }
          ]
        }
      };
    }
  }
  
  // Threshold 3: Crisis topic surge
  if (current.crisis_pct > 10) { // More than 10% crisis cases
    return {
      region: region.code,
      alert_type: 'crisis_surge',
      summary: `زيادة ملحوظة في الحالات الحرجة في ${region.name_ar} (${current.crisis_pct.toFixed(0)}%)`,
      z_score: calculateZScore(current.crisis_pct, 3, 2), // Usually ~3% crisis
      related_topic: 'Crisis',
      time_window: 'last_60m',
      status: 'pending',
      confidence: 0.92,
      metadata: {
        crisis_pct: current.crisis_pct,
        high_urgency_pct: current.high_urgency_pct,
        total_requests: current.total,
        top_phrases: [],
        flagged_count: Math.floor(current.total * current.crisis_pct / 100),
        recommendations: [
          {
            type: 'staffing',
            text: `تفعيل فريق الطوارئ النفسية في ${region.name_ar} فوراً`
          },
          {
            type: 'routing',
            text: 'أولوية قصوى لجميع الحالات من هذه المنطقة'
          },
          {
            type: 'escalation',
            text: 'إبلاغ المدير الطبي والمشرف الأول'
          }
        ]
      }
    };
  }
  
  // Threshold 4: Volume spike
  if (previous && current.total > previous.total * 2 && current.total > 10) {
    const volumeIncrease = ((current.total - previous.total) / previous.total) * 100;
    
    return {
      region: region.code,
      alert_type: 'volume_spike',
      summary: `ارتفاع كبير في عدد الطلبات من ${region.name_ar} (+${volumeIncrease.toFixed(0)}%)`,
      z_score: calculateZScore(current.total, previous.total, previous.total * 0.3),
      related_topic: null,
      time_window: 'last_60m',
      status: 'pending',
      confidence: 0.72,
      metadata: {
        previous_volume: previous.total,
        current_volume: current.total,
        increase_pct: volumeIncrease,
        current_ewi: current.ewi,
        top_phrases: [],
        flagged_count: Math.floor(current.total * 0.3),
        recommendations: [
          {
            type: 'staffing',
            text: `إضافة موارد بشرية لتغطية الزيادة في ${region.name_ar}`
          },
          {
            type: 'operations',
            text: 'مراجعة أوقات الانتظار وكفاءة الخدمة'
          }
        ]
      }
    };
  }
  
  return null;
}

function calculateZScore(value: number, mean: number, std: number) {
  if (std === 0) return 0;
  return Number(((value - mean) / std).toFixed(2));
}

async function getMostCommonTopic(regionCode: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data } = await supabase
    .from('requests')
    .select('topic')
    .eq('region', regionCode)
    .gte('created_at', oneHourAgo);
  
  if (!data || data.length === 0) return 'Personal Issues';
  
  // Count topics
  const topicCounts: Record<string, number> = {};
  data.forEach(r => {
    if (r.topic) {
      topicCounts[r.topic] = (topicCounts[r.topic] || 0) + 1;
    }
  });
  
  // Return most common
  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Personal Issues';
}
