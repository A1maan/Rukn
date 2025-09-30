# NCMH Early Warning Dashboard

A real-time, Arabic-first mental health helpline monitoring dashboard for NCMH (National Center for Mental Health). Built for detecting distress spikes, operational issues, and enabling rapid response with human-in-the-loop approval.

## 🎯 Features

### ✅ Implemented (Core MVP)

- **🗺️ Interactive Map View**: KSA provinces (real shapes) colored by Early Warning Index (EWI)
- **🚨 Flagged Requests Card**: Shows individual calls/chats needing supervisor review
  - Real Arabic text previews
  - Urgency levels (HIGH/MEDIUM/LOW) with color coding
  - Quick actions: Review, Escalate, Dismiss
  - Filters by selected region
- **📊 Minimal Analytics**: Small floating cards for context
  - **Top-Left**: Volume counts + EWI badge (256px)
  - **Top-Right**: Sentiment donut (288px)
- **⚡ Floating Header**: Transparent overlay, doesn't occlude map
- **🚨 Alert System**:
  - Alert cards with status (pending/approved/rejected)
  - Detailed alert modal showing:
    - Why the alert fired (z-scores, anomalies)
    - Top Arabic phrases
    - Recommended actions (staffing, routing, messaging)
    - Approve/Reject with optional notes
- **🎛️ Header Filters**:
  - Time window selector (30m, 1h, 3h, Today)
  - Channel filters (Calls, Chats, Surveys)
  - Live pending alert count
- **🎨 Beautiful UI**:
  - Gold & cream color scheme with texture overlays
  - Smooth animations and hover effects
  - Responsive design (tablet-first)

### 🔜 To Be Implemented

- **🌐 RTL/i18n Support**: Arabic/English toggle with full RTL layout
- **🔄 Live Updates**: Server-Sent Events (SSE) or WebSocket for real-time data
- **📈 Historical Trends**: View past alerts and EWI trends
- **👤 User Management**: Supervisor mode, user authentication
- **🔍 Search & Advanced Filters**: Search by topic, region, or alert type

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
   \`\`\`bash
   cd rukn-dashboard
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

\`\`\`
rukn-dashboard/
├── app/
│   ├── api/                    # Mock API routes
│   │   ├── alerts/             # GET /api/alerts, approve/reject endpoints
│   │   ├── aggregates/         # GET /api/aggregates
│   │   └── regions/            # GET /api/regions (GeoJSON)
│   ├── globals.css             # Custom map styling, scrollbars
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Main dashboard page
├── components/
│   ├── AlertModal.tsx          # Alert detail modal with approve/reject
│   ├── Header.tsx              # Top bar with filters and alert count
│   ├── MapView.tsx             # Leaflet map with KSA provinces
│   └── RegionDrawer.tsx        # Sidebar with region analytics
├── lib/
│   ├── mock-data.ts            # Mock alerts, aggregates, emotion trends
│   └── utils.ts                # EWI colors, formatting helpers
├── public/
│   └── data/
│       └── ksa-provinces.geojson  # Saudi Arabia provinces GeoJSON
├── types/
│   └── index.ts                # TypeScript interfaces (Event, Alert, Aggregate, etc.)
└── package.json
\`\`\`

---

## 🔌 API Contract (Mock)

All endpoints are currently **mocked** using Next.js API routes. Replace with real backend when ready.

### GET `/api/regions`
Returns GeoJSON FeatureCollection of KSA provinces with EWI values.

**Response:**
\`\`\`json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name_en": "Riyadh", "name_ar": "الرياض", "ewi": 0.62 },
      "geometry": { ... }
    }
  ]
}
\`\`\`

### GET `/api/aggregates?region=Riyadh&window=last_60m`
Returns aggregate statistics for a region.

**Response:**
\`\`\`json
{
  "window": "last_60m",
  "region": "Riyadh",
  "counts": { "events": 487, "calls": 320, "chats": 145, "surveys": 22 },
  "sentiment_pct": { "pos": 0.22, "neu": 0.35, "neg": 0.43 },
  "emotions_pct": { "distress": 0.32, "anger": 0.21, "sadness": 0.18, "calm": 0.29 },
  "top_topics": [
    { "key": "wait_times", "pct": 0.31 },
    { "key": "appointment_booking", "pct": 0.19 }
  ],
  "ewi": 0.62,
  "anomalies": [{ "metric": "neg_sentiment", "z": 3.1 }]
}
\`\`\`

### GET `/api/alerts?status=pending&window=last_60m`
Returns list of alerts.

**Response:**
\`\`\`json
[
  {
    "id": "alrt_7d3f",
    "ts": "2025-09-30T11:50:00Z",
    "region": "Eastern Province",
    "summary": "Distress spike (+2.6σ) tied to exam_stress in chat",
    "evidence": {
      "window": "last_45m",
      "z_scores": { "distress": 2.6, "neg_sentiment": 2.1 },
      "top_phrases": ["نتائج الاختبارات", "قلق", "تأخير الرد"]
    },
    "recommendations": [
      { "type": "staffing", "text": "Shift +2 agents to chat queue..." }
    ],
    "status": "pending",
    "confidence": 0.81
  }
]
\`\`\`

### POST `/api/alerts/:id/approve`
Approves an alert.

**Body:**
\`\`\`json
{ "note": "Peak overlaps with exam week." }
\`\`\`

**Response:**
\`\`\`json
{
  "ok": true,
  "alert": { ...updated alert... },
  "actionLog": { "id": "act_abc1", "action": "approve", ... }
}
\`\`\`

### POST `/api/alerts/:id/reject`
Rejects an alert. Same contract as approve.

---

## 🎨 Design Notes

### Color Palette

- **Low EWI** (< 35%): Soft ivory/white `#FDFCF7`
- **Medium EWI** (35-60%): Champagne gold `#E6C88A`
- **High EWI** (> 60%): Deep gold/copper `#C9A961`
- **Gold borders**: `#C9A961` with drop shadow
- **Background**: Gradient from `#F5F3EF` to `#E8E6E1` with subtle crosshatch pattern

### Typography

- **Headers**: Geist Sans (Next.js default)
- **Numbers**: Tabular numerals for alignment
- **Arabic**: RTL direction with proper spacing (to be implemented)

---

## 🧪 Mock Data

The dashboard currently uses **hardcoded mock data** in `lib/mock-data.ts`:

- **13 provinces** with realistic EWI values
- **3 sample alerts** (2 pending, 1 approved)
- **Emotion trends** for 24h (12 data points)
- **Aggregates** for each province with sentiment, emotions, and topics

To integrate a real backend:
1. Replace `fetch('/api/...')` calls with your backend URLs
2. Ensure response schemas match the TypeScript types in `types/index.ts`
3. Add authentication headers/tokens as needed

---

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React hooks (no external state library yet)

---

## 📊 Early Warning Index (EWI)

**Formula** (computed upstream, displayed here):
\`\`\`
EWI = 0.4 × Distress + 0.25 × NegSent + 0.2 × RiskRate + 0.15 × OpsComplaints
\`\`\`

**Thresholds:**
- 🟢 **Low** (< 0.35): Green badge
- 🟡 **Medium** (0.35–0.6): Amber badge
- 🔴 **High** (> 0.6): Red badge

---

## 🌍 GeoJSON Source

The KSA provinces GeoJSON (`public/data/ksa-provinces.geojson`) is a **simplified mock** for demo purposes. For production:

1. Use **geoBoundaries** ADM1 (recommended) or **Natural Earth**
2. Simplify with `mapshaper` to reduce file size:
   \`\`\`bash
   mapshaper ksa_adm1.geojson -simplify 10% keep-shapes -o ksa_adm1_simplified.geojson
   \`\`\`
3. Replace the file in `public/data/`

---

## 📝 Next Steps

1. **Backend Integration**: Connect to real NLP pipeline and database
2. **Authentication**: Add user login and role-based access
3. **RTL Support**: Implement i18next for Arabic/English toggle
4. **Live Updates**: Add SSE or WebSocket for real-time alerts
5. **Testing**: Add unit tests for components and API routes
6. **Deployment**: Deploy to Vercel or AWS with environment variables

---

## 📄 License

MIT (adjust as needed for your organization)

---

## 👥 Team

Built for **NCMH** hackathon project. For questions or issues, contact the dev team.

---

**🚀 Happy monitoring!**