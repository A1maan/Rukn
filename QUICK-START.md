# ⚡ Quick Start – NCMH Early Warning Dashboard (Frontend)

This is a Next.js 15 + TypeScript + Tailwind app that renders a real‑time, Arabic‑first “Early Warning” dashboard for NCMH. It’s mock‑API backed, action‑first, and ready to extend.

## 1) Run locally

```bash
cd rukn-dashboard
npm install
npm run dev
```

Open http://localhost:3000

## 2) High‑level architecture

- The map is the canvas; every UI element is a floating overlay.
- Two action levels:
  - Individual triage: Flagged requests (Arabic text, review/escalate/dismiss)
  - Pattern response: Alerts with recommendations (approve/reject)
- All data is typed in `types/index.ts`; mock data in `lib/mock-data.ts`; mock routes in `app/api/*`.

## 3) File map (where to edit)

```
app/
  page.tsx                # Main composition (mount floating cards)
  layout.tsx              # Fonts (Geist + Noto Naskh Arabic), global shell
  globals.css             # Tailwind v4, theme, utilities
  api/
    regions/              # GeoJSON
    aggregates/           # /aggregates?region=... -> Aggregate
    alerts/               # /alerts?status=... -> Alert[]
    alerts/[id]/approve/  # POST -> {ok:true}
    alerts/[id]/reject/   # POST -> {ok:true}
    flagged-requests/     # GET/PATCH (status) -> FlaggedRequest[]
components/
  MapView.tsx             # Leaflet map (click province)
  FloatingTitle.tsx       # Top-center title
  FloatingFilters.tsx     # Top-left filters (expand)
  FloatingAlertBadge.tsx  # Top-right pending alerts
  FloatingVolumeCard.tsx  # Left analytics when region selected
  FloatingSentimentCard.tsx# Right analytics when region selected
  FlaggedRequestsButton.tsx# Bottom-center CTA
  FlaggedRequestsCard.tsx # Center floating grouped list (High/Med/Low)
  AlertsListModal.tsx     # List of alerts → AlertModal
  AlertModal.tsx          # Approve/Reject recs
  LiveOpsCard.tsx         # Bottom-left live ops snapshot
  AlertsTicker.tsx        # Bottom-right recent alerts
lib/mock-data.ts          # Mock Alerts, Aggregates, FlaggedRequests
lib/utils.ts              # EWI color, number/date helpers
types/index.ts            # Strong typed interfaces
public/data/ksa-provinces.geojson  # Real KSA ADM1 shapes
```

## 4) Data contracts (swap mock with real backend)

```ts
export interface Alert {
  id: string; ts: string; region: string; summary: string;
  evidence: { window: string; z_scores: Record<string, number>; top_phrases: string[]; flagged_count: number };
  recommendations: { type: 'staffing'|'routing'|'messaging'; text: string }[];
  status: 'pending'|'approved'|'rejected'; confidence: number;
}

export interface Aggregate {
  window: string; region: string;
  counts: { events: number; calls: number; chats: number; surveys: number };
  sentiment_pct: { pos: number; neu: number; neg: number };
  emotions_pct: { distress: number; anger: number; sadness: number; calm: number };
  top_topics: { key: string; pct: number }[];
  ewi: number; anomalies: { metric: string; z: number }[];
}

export interface FlaggedRequest {
  id: string; ts: string; channel: 'call'|'chat'|'survey'; region: string;
  text_preview: string; urgency: 'HIGH'|'MEDIUM'|'LOW'; confidence: number;
  category: string; emotion: 'distress'|'anger'|'sadness'|'calm'; status: 'pending'|'reviewed'|'escalated'|'dismissed';
}
```

Endpoints to implement:

- `GET /regions`
- `GET /aggregates?region=Riyadh&window=last_60m`
- `GET /alerts?status=pending`
- `POST /alerts/:id/approve` & `POST /alerts/:id/reject`
- `GET /flagged-requests?region=Riyadh`
- `PATCH /flagged-requests?id=req_123` (body: `{ status }`)

## 5) Add features quickly (diffable entry points)

- New floating card → create component and mount in `app/page.tsx` (see `LiveOpsCard`, `AlertsTicker`).
- New stat in Volume card → extend `Aggregate` type, add mock in `lib/mock-data.ts`, expose in `/api/aggregates`, render in `FloatingVolumeCard.tsx`.
- New action on flagged request → edit `FlaggedRequestsCard.tsx` buttons; PATCH `/api/flagged-requests` to persist in mock.
- New alert recommendation → extend `Alert.recommendations` in `types` and render in `AlertModal.tsx`.
- Live updates → add `/api/stream` and an `EventSource` in `app/page.tsx` to patch alerts/aggregates.

## 6) Debug fast

- Region click throws `counts is undefined` → add that region to `mockAggregates`.
- Map looks odd/rectangles → wrong/missing GeoJSON in `public/data/ksa-provinces.geojson`; verify `/api/regions`.
- Styles missing → Tailwind v4 uses `@import "tailwindcss"` in `app/globals.css` (no config file needed).
- Arabic font not applied → ensure `layout.tsx` imports `Noto_Naskh_Arabic` and `globals.css` has `.font-ar`.

## 7) Theming & UX rules

- Gold/white theme with subtle transparency (bg-white/85–90) + backdrop blur.
- Small floating cards; map should always be visible.
- Arabic text uses `.font-ar` with `dir="rtl"`.
- Buttons: primary amber, secondary white+amber border, tertiary gray.

## 8) Productivity helpers (optional)

- Keyboard shortcuts: `F` (Filters), `R` (Requests), `A` (Alerts)
- Use `Intl.NumberFormat`/`Intl.DateTimeFormat` (already wrapped in `lib/utils.ts`).

## 9) Ship checklist

- Replace mock APIs with real endpoints
- Add auth (NextAuth) if needed
- Add SSE/WebSocket for live data
- Confirm Arabic numerals/dates and RTL correctness
- Keep GeoJSON simplified (< 500KB)

---

### TL;DR for a new LLM/dev

Run `npm run dev`. Edit `app/page.tsx` to mount/remove floating cards. Types live in `types/index.ts`. Mock data/routes are in `lib/mock-data.ts` and `app/api/*`. Prioritize action flows: Flagged Requests and Alerts. Keep UI light, gold/white, and Arabic-friendly.
