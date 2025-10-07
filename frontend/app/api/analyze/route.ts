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
    
    if (!body.text || !body.channel || !body.region) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Insert placeholder into DB immediately
    const { data: insertedRequest, error: insertError } = await supabase
      .from('requests')
      .insert({
        channel: body.channel,
        region: body.region,
        text_content: body.text,
        status: 'pending',
        // Placeholder values (will be updated soon)
        emotion: null,
        urgency: null,
        topic: null,
        confidence: null,
        is_flagged: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const requestId = insertedRequest.id;

    // Step 2: Process analysis (await to get results)
    const analysisResult = await processAnalysis(requestId, body.text);

    // Step 3: Return results to frontend
    return NextResponse.json({
      success: true,
      request_id: requestId,
      analysis: analysisResult,
      message: 'Analysis complete'
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Processing function that returns results
async function processAnalysis(requestId: string, text: string) {
  try {
    // Call MARBERT backend
    const backendResponse = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const prediction = await backendResponse.json();
    
    // Map results
    const emotion = mapEmotionToSchema(prediction.emotion);
    const urgency = prediction.urgency.toLowerCase();
    const topic = predictTopic(text);
    const shouldFlag = (
      urgency === 'high' ||
      prediction.reasons.includes('crisis_override') ||
      (urgency === 'medium' && ['anger', 'fear', 'sadness'].includes(emotion))
    );

    // Update the database row with actual results
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        emotion: emotion,
        urgency: urgency,
        topic: topic,
        confidence: prediction.confidence,
        is_flagged: shouldFlag
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
    }

    // Return analysis results to frontend
    return {
      emotion: emotion,
      urgency: urgency,
      topic: topic,
      confidence: prediction.confidence,
      is_flagged: shouldFlag
    };

  } catch (error) {
    console.error('Processing error:', error);
    // Return null if processing fails
    return null;
  }
}

function mapEmotionToSchema(emotion: string): string {
  const mapping: Record<string, string> = {
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