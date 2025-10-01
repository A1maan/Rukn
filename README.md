# Rukn - NCMH Early Warning Dashboard

A real-time, Arabic-first mental health helpline monitoring dashboard for NCMH (National Center for Mental Health). Built for detecting distress spikes, operational issues, and enabling rapid response with human-in-the-loop approval.

## 🚀 Quick Start (30 seconds)

```bash
cd frontend
npm install    # Only first time
npm run dev
```

Open **http://localhost:3000**

---

## 🎯 Features

### ✅ Implemented (Core MVP)

- **🗺️ Interactive Map View**: KSA provinces (real shapes) colored by Early Warning Index (EWI)
- **🚨 Flagged Requests Card**: Shows individual calls/chats needing supervisor review
  - Real Arabic text previews
  - Urgency levels (HIGH/MEDIUM/LOW) with color coding
  - Quick actions: Review, Escalate, Dismiss
  - Filters by selected region
- **📊 Analytics Cards**: Floating overlays that don't block the map
  - Volume counts + EWI badge
  - Sentiment analysis (donut chart)
  - Live operations snapshot
  - Recent alerts ticker
- **⚡ Alert System**:
  - Alert cards with status (pending/approved/rejected)
  - Detailed alert modal with evidence (z-scores, Arabic phrases)
  - Recommended actions (staffing, routing, messaging)
  - Approve/Reject with optional notes
- **🎛️ Filters**:
  - Time window selector (30m, 1h, 3h, Today)
  - Channel filters (Calls, Chats, Surveys)
  - Live pending alert count
- **🎨 Beautiful UI**:
  - Gold & cream color scheme with subtle transparency
  - Smooth animations and hover effects
  - Responsive design (tablet-first)

### 🔜 To Be Implemented

- **🌐 RTL/i18n Support**: Arabic/English toggle with full RTL layout
- **🔄 Live Updates**: Server-Sent Events (SSE) or WebSocket for real-time data
- **📈 Historical Trends**: View past alerts and EWI trends
- **👤 User Management**: Supervisor mode, user authentication
- **🔍 Search & Advanced Filters**: Search by topic, region, or alert type

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/                    # Mock API routes
│   │   ├── alerts/             # GET /api/alerts, approve/reject endpoints
│   │   ├── aggregates/         # GET /api/aggregates?region=...
│   │   ├── flagged-requests/   # GET/PATCH flagged requests
│   │   └── regions/            # GET /api/regions (GeoJSON)
│   ├── globals.css             # Tailwind v4, theme, utilities
│   ├── layout.tsx              # Fonts (Geist + Noto Naskh Arabic)
│   └── page.tsx                # Main composition (mount floating cards)
├── components/
│   ├── AlertModal.tsx          # Alert detail modal with approve/reject
│   ├── AlertsListModal.tsx     # List of alerts
│   ├── AlertsTicker.tsx        # Bottom-right recent alerts
│   ├── FlaggedRequestsButton.tsx # Bottom-center CTA
│   ├── FlaggedRequestsCard.tsx # Grouped list (High/Med/Low)
│   ├── FloatingAlertBadge.tsx  # Top-right pending alerts
│   ├── FloatingFilters.tsx     # Top-left filters (expand)
│   ├── FloatingInstructionCard.tsx # Instructions overlay
│   ├── FloatingSentimentCard.tsx # Right analytics
│   ├── FloatingTitle.tsx       # Top-center title
│   ├── FloatingVolumeCard.tsx  # Left analytics
│   ├── LiveOpsCard.tsx         # Bottom-left live ops snapshot
│   └── MapView.tsx             # Leaflet map with KSA provinces
├── lib/
│   ├── mock-data.ts            # Mock alerts, aggregates, emotion trends
│   └── utils.ts                # EWI colors, formatting helpers
├── public/
│   └── data/
│       └── ksa-provinces.geojson  # Saudi Arabia provinces GeoJSON
├── types/
│   └── index.ts                # TypeScript interfaces (Event, Alert, Aggregate, etc.)
└── package.json
```

---

## 🔌 API Contract (Mock)

All endpoints are currently **mocked** using Next.js API routes. Replace with real backend when ready.

### Core Data Types

```ts
export interface Alert {
  id: string; ts: string; region: string; summary: string;
  evidence: { 
    window: string; 
    z_scores: Record<string, number>; 
    top_phrases: string[]; 
    flagged_count: number 
  };
  recommendations: { 
    type: 'staffing'|'routing'|'messaging'; 
    text: string 
  }[];
  status: 'pending'|'approved'|'rejected'; 
  confidence: number;
}

export interface Aggregate {
  window: string; region: string;
  counts: { events: number; calls: number; chats: number; surveys: number };
  sentiment_pct: { pos: number; neu: number; neg: number };
  emotions_pct: { distress: number; anger: number; sadness: number; calm: number };
  top_topics: { key: string; pct: number }[];
  ewi: number; 
  anomalies: { metric: string; z: number }[];
}

export interface FlaggedRequest {
  id: string; ts: string; 
  channel: 'call'|'chat'|'survey'; 
  region: string;
  text_preview: string; 
  urgency: 'HIGH'|'MEDIUM'|'LOW'; 
  confidence: number;
  category: string; 
  emotion: 'distress'|'anger'|'sadness'|'calm'; 
  status: 'pending'|'reviewed'|'escalated'|'dismissed';
}
```

### Endpoints to Implement

- `GET /regions` - Returns GeoJSON with EWI values
- `GET /aggregates?region=Riyadh&window=last_60m` - Region statistics
- `GET /alerts?status=pending` - List alerts
- `POST /alerts/:id/approve` & `POST /alerts/:id/reject` - Action on alerts
- `GET /flagged-requests?region=Riyadh` - Individual requests needing review
- `PATCH /flagged-requests?id=req_123` - Update request status

---

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

**Formula** (computed upstream, displayed here):
```
EWI = 0.4 × Distress + 0.25 × NegSent + 0.2 × RiskRate + 0.15 × OpsComplaints
```

**Thresholds:**
- 🟢 **Low** (< 0.35): Green badge
- 🟡 **Medium** (0.35–0.6): Amber badge
- 🔴 **High** (> 0.6): Red badge

---

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet + react-leaflet
- **Icons**: Lucide React
- **State**: React hooks (no external state library)

---

## 🚀 Development Guide

### Add Features Quickly

- **New floating card** → Create component and mount in `app/page.tsx` (see `LiveOpsCard`, `AlertsTicker`)
- **New stat in Volume card** → Extend `Aggregate` type in `types/index.ts`, add mock in `lib/mock-data.ts`, render in `FloatingVolumeCard.tsx`
- **New action on flagged request** → Edit `FlaggedRequestsCard.tsx` buttons; PATCH `/api/flagged-requests`
- **New alert recommendation** → Extend `Alert.recommendations` in types, render in `AlertModal.tsx`
- **Live updates** → Add `/api/stream` and an `EventSource` in `app/page.tsx`

### Debug Tips

- **Region click throws error** → Add that region to `mockAggregates` in `lib/mock-data.ts`
- **Map looks odd** → Verify GeoJSON in `public/data/ksa-provinces.geojson`
- **Styles missing** → Tailwind v4 uses `@import "tailwindcss"` in `app/globals.css` (no config file needed)
- **Arabic font not applied** → Ensure `layout.tsx` imports `Noto_Naskh_Arabic` and `globals.css` has `.font-ar`

### Productivity Helpers

- Use `Intl.NumberFormat`/`Intl.DateTimeFormat` (already wrapped in `lib/utils.ts`)
- Keyboard shortcuts (optional): `F` (Filters), `R` (Requests), `A` (Alerts)

---

## 📝 Next Steps

1. **Backend Integration**: Connect to real NLP pipeline and database
2. **Authentication**: Add user login and role-based access (NextAuth)
3. **RTL Support**: Implement i18next for Arabic/English toggle
4. **Live Updates**: Add SSE or WebSocket for real-time alerts
5. **Testing**: Add unit tests for components and API routes
6. **Deployment**: Deploy to Vercel or AWS with environment variables

### Ship Checklist

- [ ] Replace mock APIs with real endpoints
- [ ] Add authentication
- [ ] Add SSE/WebSocket for live data
- [ ] Confirm Arabic numerals/dates and RTL correctness
- [ ] Keep GeoJSON simplified (< 500KB)

---

## 🎬 Demo

See [DEMO-SCRIPT.md](frontend/DEMO-SCRIPT.md) for a complete presentation guide.

---

## 📄 License

MIT (adjust as needed for your organization)

---

## 👥 Team

Built for **startAD AI for Good Sandbox** & **NCMH** by Rukn.

---