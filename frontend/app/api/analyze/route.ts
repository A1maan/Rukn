// frontend/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

interface AnalyzeRequest {
  text: string;
  channel: string;
  region: string;
}

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();
    
    // Validate input
    if (!body.text || !body.channel || !body.region) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call your MARBERT backend
    const backendResponse = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.text })
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const prediction = await backendResponse.json();
    
    // Map emotion to Supabase schema (11 emotions)
    const emotion = mapEmotionToSchema(prediction.emotion);
    const urgency = prediction.urgency.toLowerCase();
    const topic = predictTopic(body.text);
    
    // Determine if should flag
    const shouldFlag = (
      urgency === 'high' ||
      prediction.reasons.includes('crisis_override') ||
      (urgency === 'medium' && ['anger', 'fear', 'sadness'].includes(emotion))
    );

    // Insert into Supabase
    const { data, error } = await supabase
      .from('requests')
      .insert({
        channel: body.channel,
        region: body.region,
        text_content: body.text,
        emotion: emotion,
        urgency: urgency,
        topic: topic,
        confidence: prediction.confidence,
        is_flagged: shouldFlag,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      request_id: data.id,
      analysis: {
        emotion: emotion,
        urgency: urgency,
        topic: topic,
        confidence: prediction.confidence,
        is_flagged: shouldFlag,
        raw: prediction
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Map your model's emotions to Supabase 11-emotion schema
function mapEmotionToSchema(emotion: string): string {
  const mapping: Record<string, string> = {
    // Your model output → Supabase schema
    'anger': 'anger',
    'fear': 'fear',
    'sadness': 'sadness',
    'joy': 'happiness',
    'love': 'happiness',
    'surprise': 'surprise',
    'neutral': 'neutral',
    'disgust': 'disgust',
    'anticipation': 'anticipation',
    'optimism': 'optimism',
    'pessimism': 'pessimism',
    'confusion': 'confusion'
  };
  
  return mapping[emotion.toLowerCase()] || 'neutral';
}

// Simple topic classification based on keywords
function predictTopic(text: string): string {
  const textLower = text.toLowerCase();
  
  const topics: Record<string, string[]> = {
    'Sleep Issues': ['نوم', 'أرق', 'منام'],
    'Work Stress': ['عمل', 'وظيفة', 'ضغط'],
    'Financial Stress': ['مال', 'ديون', 'راتب'],
    'Family Issues': ['عائلة', 'أسرة', 'أب', 'أم'],
    'Crisis': ['انتحار', 'إيذاء', 'خطر'],
    'Exam Stress': ['امتحان', 'اختبار', 'دراسة'],
    'Personal Issues': ['شخصي', 'نفسي']
  };
  
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return topic;
    }
  }
  
  return 'Personal Issues';
}