// Core data types for NCMH Early Warning Dashboard

export type Channel = "call" | "chat" | "survey";
export type Sentiment = "positive" | "neutral" | "negative";
export type Emotion = "distress" | "anger" | "sadness" | "calm";
export type UrgencyLevel = "HIGH" | "MEDIUM" | "LOW";
export type AlertStatus = "pending" | "approved" | "rejected";
export type RequestStatus = "pending" | "reviewed" | "escalated" | "dismissed";

export interface Event {
  id: string;
  ts: string;
  channel: Channel;
  region: string;
  text: string;
  labels: {
    sentiment: Sentiment;
    emotion: Emotion;
    topics: string[];
    risk_flag: boolean;
    conf: number; // 0..1
  };
}

// Flagged request for individual review
export interface FlaggedRequest {
  id: string;
  ts: string;
  channel: Channel;
  region: string;
  text_preview: string; // Arabic text preview
  urgency: UrgencyLevel;
  confidence: number;
  category: string;
  emotion: Emotion;
  status: RequestStatus;
}

export interface Aggregate {
  window: string;
  region: string;
  counts: {
    events: number;
    calls: number;
    chats: number;
    surveys: number;
  };
  sentiment_pct: {
    pos: number;
    neu: number;
    neg: number;
  };
  emotions_pct: {
    distress: number;
    anger: number;
    sadness: number;
    calm: number;
  };
  top_topics: Array<{
    key: string;
    pct: number;
  }>;
  ewi: number; // Early Warning Index 0..1
  anomalies: Array<{
    metric: string;
    z: number;
  }>;
}

export interface Alert {
  id: string;
  ts: string;
  region: string;
  summary: string;
  evidence: {
    window: string;
    z_scores: Record<string, number>;
    top_phrases: string[];
    flagged_count: number; // Number of individual requests that triggered this
  };
  recommendations: Array<{
    type: "staffing" | "routing" | "messaging";
    text: string;
  }>;
  status: AlertStatus;
  confidence: number;
}

export interface ActionLog {
  id: string;
  alert_id: string;
  action: "approve" | "reject";
  by: string;
  ts: string;
  note?: string;
  effects?: {
    staffing_delta?: Record<string, number>;
  };
}

export interface RegionProperties {
  name_en: string;
  name_ar: string;
  ewi: number;
  volume: number;
  sentiment: Sentiment;
}

// For existing analyze feature (migrated from old UI)
export interface AnalysisResult {
  urgency: UrgencyLevel;
  confidence: number;
  category: string;
  detection_method: {
    probability?: number;
    lexicon_signals?: string[];
    model_signals?: string[];
  };
}