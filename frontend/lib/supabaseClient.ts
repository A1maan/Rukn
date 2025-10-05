// frontend/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions matching your EXACT Supabase schema
export interface Region {
  code: string;
  name_en: string;
  name_ar: string;
}

export interface Request {
  id: string;
  created_at: string;
  channel: 'call' | 'chat' | 'survey';
  region: string;
  text_content?: string | null;
  emotion?: 'anger' | 'anticipation' | 'confusion' | 'disgust' | 'fear' | 
            'happiness' | 'neutral' | 'optimism' | 'pessimism' | 'sadness' | 'surprise' | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | null; // Generated column
  topic?: string | null;
  urgency?: 'high' | 'medium' | 'low' | null;
  confidence?: number | null; // numeric(3,2)
  is_flagged?: boolean | null;
  status?: 'pending' | 'reviewed' | 'escalated' | 'dismissed' | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
}

export interface Alert {
  id: string;
  created_at: string;
  region: string;
  alert_type: string;
  summary: string;
  z_score?: number | null; // numeric(4,2)
  related_topic?: string | null;
  time_window?: string | null;
  metadata?: any | null; // jsonb
}

// Helper to map your emotions to sentiment categories
export const emotionToSentiment = (emotion: string | null): 'positive' | 'neutral' | 'negative' => {
  if (!emotion) return 'neutral';
  const positive = ['happiness', 'optimism', 'anticipation', 'surprise'];
  const negative = ['anger', 'disgust', 'fear', 'pessimism', 'sadness'];
  if (positive.includes(emotion)) return 'positive';
  if (negative.includes(emotion)) return 'negative';
  return 'neutral';
};

// Map your 11 emotions to the 4 categories in your frontend
export const emotionToCategory = (emotion: string | null): 'distress' | 'anger' | 'sadness' | 'calm' => {
  if (!emotion) return 'calm';
  
  const mapping: Record<string, 'distress' | 'anger' | 'sadness' | 'calm'> = {
    'anger': 'anger',
    'disgust': 'anger',
    'fear': 'distress',
    'pessimism': 'distress',
    'sadness': 'sadness',
    'happiness': 'calm',
    'optimism': 'calm',
    'anticipation': 'calm',
    'surprise': 'calm',
    'neutral': 'calm',
    'confusion': 'calm'
  };
  
  return mapping[emotion] || 'calm';
};

// Convert lowercase urgency to uppercase for frontend
export const normalizeUrgency = (urgency: string | null): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (!urgency) return 'MEDIUM';
  return urgency.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW';
};