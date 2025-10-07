# Rukn - NCMH Mental Health Feedback Analysis Platform

A real-time, Arabic-first mental health feedback monitoring platform for NCMH (National Center for Mental Health). Built with AI-powered urgency detection, emotion classification, and real-time monitoring with human-in-the-loop approval workflows.

## 🚀 Quick Start

### Frontend (Dashboard)
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000**

### Backend (AI Models)
```bash
cd backend
pip install -r requirements.txt
python -m app/main.py
```
API runs on **http://localhost:8000**

---

## 🎯 Features

### ✅ Implemented

#### 🧠 AI-Powered Analysis Backend
- **MARBERT Models**: Fine-tuned Arabic BERT models for mental health text
  - **Urgency Classification**: High/Medium/Low urgency detection with calibration
  - **Emotion Detection**: 11-category emotion classification (anger, fear, sadness, happiness, etc.)
  - Crisis keyword override for immediate high-urgency flagging
- **FastAPI Service**: REST API with `/analyze` endpoint for real-time inference
- **Local Model Loading**: Pre-trained models stored in `/backend/models/`

#### 🗺️ Real-Time Dashboard
- **Interactive Map View**: Saudi Arabia provinces (real GeoJSON shapes) colored by Early Warning Index (EWI)
- **Live Data Updates**: Supabase real-time subscriptions with debounced updates
- **Connection Monitoring**: Visual indicators and toast notifications for connection status

#### 🚨 Alert & Review System
- **Flagged Requests Management**:
  - Real Arabic text previews with urgency levels (HIGH/MEDIUM/LOW)
  - Color-coded urgency indicators
  - Quick actions: Review, Escalate, Dismiss
  - Region-based filtering
- **Alert System**:
  - Alert cards with status (pending/approved/rejected)
  - Detailed alert modal with evidence (z-scores, top phrases, flagged count)
  - Recommended actions (staffing, routing, messaging)
  - Approve/Reject workflow with optional supervisor notes
  - Alerts ticker showing recent activity

#### 📊 Analytics & Monitoring
- **Floating Analytics Cards**:
  - Volume counts with EWI badge
  - Sentiment analysis (donut chart visualization)
  - Live operations snapshot
  - Recent alerts ticker
- **Advanced Filters**:
  - Time window selector (30m, 1h, 3h, 6h, 12h, 24h, Today)
  - Channel filters (Calls, Chats, Surveys)
  - Real-time pending alert count

#### 👤 User Support Interface
- **Dual-Mode Submission**:
  - Audio recording with real-time feedback submission
  - Text message input with region selection
  - Mode selection interface
- **Region Selection**: Saudi Arabia province picker
- **Real-time Processing**: Integration with backend AI analysis

#### 🎨 Beautiful UI/UX
- Gold & cream color scheme with subtle transparency
- Smooth animations and hover effects
- Responsive design (tablet-first)
- Toast notifications for user feedback
- Modal-based workflows

#### 🔄 Real-Time Infrastructure
- **Supabase Integration**:
  - PostgreSQL database with real-time subscriptions
  - Tables: `requests`, `alerts`, `regions`
  - Generated columns for sentiment mapping
- **Debounced Updates**: Optimized refresh logic to prevent excessive re-renders
- **Connection Recovery**: Automatic reconnection with user notifications

### 🔜 To Be Implemented

- **🌐 RTL/i18n Support**: Full Arabic/English toggle with RTL layout (i18next installed)
- **📈 Historical Trends**: View past alerts and EWI trends over time
- **� Advanced Search**: Search by topic, keywords, or alert type
- **📱 Mobile Optimization**: Enhanced mobile experience
- **🔐 Authentication**: User authentication and role-based access control

---

## 📁 Project Structure

```
rukn/
├── backend/                    # AI Analysis Service
│   ├── app/
│   │   ├── main.py            # FastAPI app with MARBERT models
│   │   ├── config.py          # Configuration settings
│   │   ├── supabase_client.py # Supabase integration
│   │   └── routes/
│   │       └── predict.py     # Prediction endpoints
│   ├── models/
│   │   ├── urgency_model/     # Fine-tuned urgency classifier
│   │   │   ├── best_urgency.pt
│   │   │   ├── inference_meta.json
│   │   │   └── tokenizer files...
│   │   └── emotion_model/     # Fine-tuned emotion classifier
│   │       ├── best_emotion.pt
│   │       ├── emotion_meta.json
│   │       └── tokenizer files...
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Next.js Dashboard
│   ├── app/
│   │   ├── api/               # API routes (proxy to backend/Supabase)
│   │   │   ├── alerts/        # Alert endpoints
│   │   │   ├── aggregates/    # Analytics aggregation
│   │   │   ├── analyze/       # Text analysis proxy
│   │   │   ├── analyze-audio/ # Audio analysis
│   │   │   ├── flagged-requests/ # Request management
│   │   │   ├── generate-alerts/  # Alert generation
│   │   │   ├── regions/       # GeoJSON regions
│   │   │   └── test-supabase/ # Connection testing
│   │   ├── globals.css        # Tailwind v4, theme, utilities
│   │   ├── layout.tsx         # Fonts (Geist + Noto Naskh Arabic)
│   │   ├── page.tsx           # Main dashboard composition
│   │   └── user/
│   │       └── page.tsx       # User support interface
│   │
│   ├── components/
│   │   ├── ReviewModal.tsx    # Request review interface
│   │   ├── dashboard/
│   │   │   ├── AlertModal.tsx          # Alert detail & approval
│   │   │   ├── AlertsListModal.tsx     # All alerts list
│   │   │   ├── AlertsTicker.tsx        # Recent alerts ticker
│   │   │   ├── FlaggedRequestsButton.tsx # CTA button
│   │   │   ├── FlaggedRequestsCard.tsx   # Requests list
│   │   │   ├── FloatingAlertBadge.tsx    # Alert count badge
│   │   │   ├── FloatingFilters.tsx       # Time/channel filters
│   │   │   ├── FloatingInstructionCard.tsx # Help overlay
│   │   │   ├── FloatingSentimentCard.tsx # Analytics
│   │   │   ├── FloatingTitle.tsx         # Header
│   │   │   ├── FloatingVolumeCard.tsx    # Analytics
│   │   │   ├── LiveOpsCard.tsx           # Live ops snapshot
│   │   │   ├── MapView.tsx               # Leaflet map
│   │   │   └── Toast.tsx                 # Notifications
│   │   └── user/
│   │       ├── AudioRecording.tsx   # Audio input
│   │       ├── ModeSelection.tsx    # Input mode picker
│   │       ├── RegionSelector.tsx   # Province selector
│   │       ├── TextMessage.tsx      # Text input
│   │       └── UserPageLayout.tsx   # Layout wrapper
│   │
│   ├── lib/
│   │   ├── mock-data.ts              # Mock data (legacy)
│   │   ├── supabaseClient.ts         # Supabase client & types
│   │   ├── useRealtimeSubscription.ts # Real-time hooks
│   │   └── utils.ts                  # EWI colors, formatters
│   │
│   ├── public/
│   │   └── data/
│   │       └── ksa-provinces.geojson # Saudi Arabia provinces
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   │
│   └── package.json           # Dependencies
│
└── README.md
```

---

## 🔌 Architecture & Data Flow

### System Overview

```
User Input → Backend AI → Supabase DB → Frontend Dashboard
              (MARBERT)    (PostgreSQL)   (Real-time UI)
```

### Backend AI Service

**Tech Stack**: FastAPI + PyTorch + Transformers

**Models**:
- **Base**: UBC-NLP/MARBERT (Arabic BERT)
- **Urgency Classifier**: 3-class (high/medium/low) with temperature calibration
- **Emotion Classifier**: 11-class emotion detection

**API Endpoints**:
- `GET /` - Service info and model metadata
- `GET /health` - Health check
- `POST /analyze` - Analyze Arabic text
  - Input: `{ "text": "Arabic text..." }`
  - Output: `{ "urgency": "high", "confidence": 0.95, "emotion": "fear", "emotion_confidence": 0.87, "reasons": [...] }`

**Features**:
- Temperature-based calibration for urgency
- Crisis keyword override (suicide, self-harm terms)
- Confidence scores for both predictions

### Database Schema (Supabase/PostgreSQL)

**Tables**:

```sql
-- Regions (Saudi Arabia provinces)
regions (
  code: text PRIMARY KEY,
  name_en: text,
  name_ar: text
)

-- User feedback requests
requests (
  id: uuid PRIMARY KEY,
  created_at: timestamp,
  channel: enum('call', 'chat', 'survey'),
  region: text REFERENCES regions(code),
  text_content: text,
  emotion: enum(11 emotions),
  sentiment: enum('positive', 'neutral', 'negative'), -- generated
  topic: text,
  urgency: enum('high', 'medium', 'low'),
  confidence: numeric(3,2),
  is_flagged: boolean,
  status: enum('pending', 'reviewed', 'escalated', 'dismissed'),
  reviewed_by: text,
  reviewed_at: timestamp,
  review_notes: text
)

-- System-generated alerts
alerts (
  id: uuid PRIMARY KEY,
  created_at: timestamp,
  region: text,
  alert_type: text,
  summary: text,
  z_score: numeric(4,2),
  related_topic: text,
  time_window: text,
  metadata: jsonb
)
```

**Real-time Features**:
- PostgreSQL Change Data Capture (CDC)
- Supabase Realtime subscriptions
- Debounced frontend updates

### Frontend Data Types

```typescript
interface Alert {
  id: string;
  ts: string;
  region: string;
  summary: string;
  evidence: {
    window: string;
    z_scores: Record<string, number>;
    top_phrases: string[];
    flagged_count: number;
  };
  recommendations: {
    type: 'staffing' | 'routing' | 'messaging';
    text: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  confidence: number;
}

interface FlaggedRequest {
  id: string;
  ts: string;
  channel: 'call' | 'chat' | 'survey';
  region: string;
  text_preview: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  category: string;
  emotion: 'distress' | 'anger' | 'sadness' | 'calm';
  status: 'pending' | 'reviewed' | 'escalated' | 'dismissed';
}

interface Aggregate {
  window: string;
  region: string;
  counts: {
    events: number;
    calls: number;
    chats: number;
    surveys: number;
  };
  sentiment_pct: { pos: number; neu: number; neg: number };
  emotions_pct: { distress: number; anger: number; sadness: number; calm: number };
  top_topics: { key: string; pct: number }[];
  ewi: number;
  anomalies: { metric: string; z: number }[];
}
```

### API Routes (Frontend)

All routes in `/app/api/` act as proxies or aggregation layers:

- `GET /api/regions` - GeoJSON with EWI values
- `GET /api/aggregates?region=Riyadh&window=last_60m` - Region statistics
- `GET /api/alerts?status=pending` - List alerts
- `POST /api/alerts/:id/approve` - Approve alert
- `POST /api/alerts/:id/reject` - Reject alert
- `GET /api/flagged-requests?region=Riyadh&status=pending` - List flagged requests
- `PATCH /api/flagged-requests?id=req_123` - Update request status
- `POST /api/analyze` - Proxy to backend AI service
- `POST /api/analyze-audio` - Audio analysis (future)
- `POST /api/generate-alerts` - Trigger alert generation

---

## 🚀 Setup & Configuration

### Prerequisites
- Node.js 20+ & npm
- Python 3.12+
- Supabase account (for database)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment** (if using Supabase integration):
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

5. **Run the service**:
```bash
python -m app.main
# OR
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run development server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Database Setup (Supabase)

1. Create a new Supabase project
2. Run the SQL migrations to create tables:
   - `regions` table with Saudi Arabia provinces
   - `requests` table for user feedback
   - `alerts` table for system-generated alerts
3. Enable Realtime for `requests` and `alerts` tables
4. Copy your project URL and anon key to `.env.local`

### Production Build

**Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
cd frontend
npm run build
npm start
```

## 🎨 Design System

### Color Palette

- **Low EWI** (< 35%): Soft ivory/white `#FDFCF7`
- **Medium EWI** (35-60%): Champagne gold `#E6C88A`
- **High EWI** (> 60%): Deep gold/copper `#C9A961`
- **Gold borders**: `#C9A961` with drop shadow
- **Background**: Gradient from `#F5F3EF` to `#E8E6E1`

### Typography

- **Headers**: Geist Sans (Next.js default)
- **Numbers**: Tabular numerals for alignment
- **Arabic**: Noto Naskh Arabic with RTL direction (`.font-ar`)

### UX Rules

- Gold/white theme with subtle transparency (bg-white/85-90) + backdrop blur
- Small floating cards; map should always be visible
- Arabic text uses `.font-ar` with `dir="rtl"`
- Buttons: primary amber, secondary white+amber border, tertiary gray

---

## 📊 Early Warning Index (EWI)

**Formula** (computed in aggregation layer):
```
EWI = 0.4 × Distress% + 0.25 × Negative_Sentiment% + 0.2 × Risk_Rate + 0.15 × Ops_Complaints%
```

**Thresholds & Colors**:
- 🟢 **Low** (< 0.35): Soft ivory `#FDFCF7` - Green badge
- 🟡 **Medium** (0.35–0.6): Champagne gold `#E6C88A` - Amber badge
- 🔴 **High** (> 0.6): Deep gold/copper `#C9A961` - Red badge

**Map Visualization**:
- Provinces are colored based on their current EWI
- Clicking a province shows detailed analytics
- EWI updates in real-time as new feedback arrives

## 🔐 Environment Variables

### Backend `.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
PORT=8000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # Backend API URL
```

---

## 🔧 Tech Stack

### Backend
- **Framework**: FastAPI 0.115.0
- **Server**: Uvicorn (ASGI)
- **AI/ML**:
  - PyTorch 2.8.0
  - Transformers 4.46.0 (Hugging Face)
  - UBC-NLP/MARBERT (Arabic BERT base)
- **Database Client**: Supabase Python SDK
- **Language**: Python 3.12+

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4 with PostCSS
- **Maps**: Leaflet 1.9.4 + react-leaflet 5.0.0
- **Charts**: Recharts 3.2.1
- **Icons**: Lucide React 0.544.0
- **State**: React 19.1.0 hooks + TanStack React Query 5.90.2
- **Database**: Supabase JS 2.58.0 (real-time subscriptions)
- **i18n**: i18next 25.5.2 + react-i18next 16.0.0 (ready, not implemented)

### Infrastructure
- **Database**: Supabase (PostgreSQL with real-time)
- **Real-time**: PostgreSQL CDC + Supabase Realtime
- **Deployment**: (TBD - Vercel for frontend, Cloud Run/ECS for backend recommended)

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Test the API
curl http://localhost:8000/health

# Test analysis endpoint
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "أشعر بالحزن الشديد"}'
```

### Frontend Testing
- Navigate to `http://localhost:3000` for dashboard
- Navigate to `http://localhost:3000/user` for user support interface
- Test real-time updates by creating requests in Supabase

---

## 📝 Development Notes

### Real-time Updates
The system uses Supabase Realtime with debounced updates to prevent excessive re-renders:
- **1 second debounce** for request updates
- **1 second debounce** for region statistics
- Connection status monitoring with toast notifications

### Emotion Mapping
The backend returns 11 emotions, which are mapped to 4 categories in the frontend:
- **Distress**: fear, pessimism
- **Anger**: anger, disgust
- **Sadness**: sadness
- **Calm**: happiness, optimism, anticipation, surprise, neutral, confusion

### Crisis Detection
Backend includes keyword-based crisis detection that overrides urgency classification:
- Arabic: انتحار، أنتحر، أؤذي نفسي، اذي نفسي، أذى، تهديد، خطر، خطير، ساعدوني، عاجل
- English: kill myself, suicide, self harm

---

## 📄 License

MIT License

---

## 👥 Team

Built for **startAD AI for Good Sandbox** & **NCMH** by Team Rukn.

---