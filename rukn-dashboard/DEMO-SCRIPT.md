# 🎬 Demo Script - NCMH Dashboard

**Time**: 3-5 minutes  
**Audience**: Supervisors, stakeholders, judges  

---

## 🎯 Opening (30 sec)

> "Hi! This is the **NCMH Early Warning Dashboard** — a real-time system to monitor mental health helpline activity across Saudi Arabia. It detects spikes in distress, operational issues, and recommends actions **before** problems escalate."

**Point to screen**: Map with colored provinces

---

## 📍 Part 1: The Map (45 sec)

**Action**: Hover over provinces

> "Each province is color-coded by its **Early Warning Index** — a weighted score combining distress levels, negative sentiment, and operational complaints."

**Point to**:
- 🟢 **Green/Ivory** (Tabuk, Hail): "Low risk, calm"
- 🟡 **Gold** (Qassim, Makkah): "Medium, watch closely"
- 🔴 **Deep Gold** (Eastern Province, Riyadh): "High, action needed"

**Action**: Click **Eastern Province** (highest EWI)

---

## 📊 Part 2: Region Details (60 sec)

**Drawer opens on the right**

> "When we click a region, we see **real-time analytics**:"

1. **Volume**: "312 events in the last hour — mostly calls and chats"

2. **Sentiment donut**: "53% negative sentiment — unusually high"

3. **24h emotion trends**: "Distress spiked around noon — likely tied to exam results announcements"

4. **Top topics**: "Exam stress is 26% of conversations, wait times 19%"

5. **Scroll to Recent Alerts**: "Two pending alerts for this region"

**Action**: Click the first alert card

---

## 🚨 Part 3: Alert & Action (90 sec)

**Alert modal opens**

> "Here's the alert detail:"

1. **Summary**: "Distress spike, +2.6 standard deviations above normal, tied to exam stress in chat"

2. **Evidence**:
   - "Z-scores show distress at +2.6σ, negative sentiment at +2.1σ"
   - **Point to Arabic phrases**: "Top phrases: 'exam results', 'anxiety', 'delayed response'"

3. **Recommended Actions**:
   - "Shift +2 agents to chat queue for 3 hours"
   - "Add quick-reply for exam stress resources"

4. **Human approval**:
   > "The system **doesn't auto-triage** — a supervisor reviews the evidence and either approves or rejects."

**Action**: Click **"Approve"**

> "Once approved, the action is logged for audit, and the staffing change is sent to the queue system."

**Alert disappears from pending list**

---

## 🎛️ Part 4: Filters (30 sec)

**Action**: Click header filters

> "We can filter by **time window** (30 minutes to today) and **channel** (calls, chats, surveys) to focus on specific patterns."

**Action**: Toggle between 1h and 3h windows

---

## 🌟 Part 5: Key Benefits (30 sec)

> "Why this matters:"

1. **Early detection**: "Catch distress spikes in minutes, not days"
2. **Actionable insights**: "Clear recommendations, not just data"
3. **Human-in-the-loop**: "No black-box decisions — supervisors stay in control"
4. **Audit trail**: "Every action is logged for quality assurance"

---

## 🚀 Closing (15 sec)

> "This is a **working prototype** built with Next.js, TypeScript, and Leaflet. Ready to connect to our NLP pipeline and live call data. Thank you!"

**Optional**: Show map zoom or click another region

---

## 🎤 Q&A Prep

**Q**: Is the data real?  
**A**: "Currently mocked for demo, but the schema matches our MarBERT sentiment analysis output. Backend integration is next."

**Q**: What about privacy?  
**A**: "All text is PII-masked upstream. The dashboard only shows aggregated metrics and anonymized phrases."

**Q**: Can it handle Arabic?  
**A**: "Yes! The NLP model is MarBERT (Arabic-first), and the UI supports RTL (to be added in next sprint)."

**Q**: How fast is it?  
**A**: "Designed for sub-second updates. With SSE (server-sent events), supervisors see alerts within 10 seconds of detection."

**Q**: What's the EWI formula?  
**A**: "0.4 × Distress + 0.25 × Negative Sentiment + 0.2 × Risk Rate + 0.15 × Operational Complaints. Tuned with historical data."

**Q**: Can we customize thresholds?  
**A**: "Yes! The system is configurable — you can adjust sensitivity per region or time of day."

---

## 🎨 Visual Talking Points

1. **Gold & white design**: "Inspired by elegant infographic maps — not overwhelming, easy to scan"

2. **Charts**: "Donut for sentiment distribution, line for trends, bars for topics"

3. **Arabic phrases**: "Shows actual keywords triggering the alert — supervisors can verify relevance"

4. **Status badges**: "Green = approved, yellow = pending, red = rejected — at a glance"

---

## ⏱️ Timing Breakdown

| Section | Time | Action |
|---------|------|--------|
| Opening | 30s | Intro + map overview |
| Map interaction | 45s | Hover + click province |
| Region drawer | 60s | Walk through charts/topics |
| Alert modal | 90s | Review + approve |
| Filters | 30s | Toggle windows |
| Benefits | 30s | Summarize value |
| Closing | 15s | Thank you |
| **Total** | **5min** | |

---

## 🔥 Pro Tips

- **Rehearse**: Run through 2-3 times to hit 5 min
- **Have backup tab**: In case of refresh issues
- **Zoom map slightly**: Makes provinces easier to click
- **Smile**: Enthusiasm sells the vision!

---

**🎬 Break a leg!**
