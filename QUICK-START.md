# ⚡ Quick Start - NCMH Dashboard

## 🚀 Run the Dashboard (30 seconds)

\`\`\`bash
cd rukn-dashboard
npm install    # Only first time
npm run dev
\`\`\`

Open **http://localhost:3000**

---

## 🎮 Try It Out

1. **Hover over provinces** → see EWI tooltips
2. **Click "Eastern Province"** (dark gold) → drawer opens
3. **Scroll to "Recent Alerts"** → click first alert
4. **Review Arabic phrases** → click "Approve"
5. **Alert disappears** from pending list ✅

---

## 📁 What's Inside

\`\`\`
rukn-dashboard/
├── components/       ← Map, Drawer, Alert Modal, Header
├── app/api/          ← Mock API routes
├── lib/              ← Mock data + utilities
├── types/            ← TypeScript interfaces
└── public/data/      ← KSA GeoJSON
\`\`\`

---

## 🔧 Key Commands

\`\`\`bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Run production
\`\`\`

---

## 📖 Full Docs

- **README.md** → Overview & features
- **HANDOFF.md** → Complete technical summary
- **DEMO-SCRIPT.md** → 5-min demo walkthrough
- **DEPLOYMENT.md** → Deploy to production
- **CONTRIBUTING.md** → Add RTL, auth, live updates

---

## 🎨 Design

- **White/cream + gold** color scheme ✨
- **EWI color mapping**: green → amber → red
- **Arabic support**: RTL-ready (i18next installed)
- **Responsive**: Works on tablet/desktop

---

## 🔌 Mock Data

- **13 KSA provinces** with realistic EWI
- **3 sample alerts** (2 pending, 1 approved)
- **24h emotion trends**
- **Sentiment + topic breakdowns**

---

## ✅ What Works

✅ Interactive map with hover/click  
✅ Region analytics drawer (charts)  
✅ Alert approve/reject workflow  
✅ Time & channel filters (UI)  
✅ Mock API endpoints  
✅ TypeScript + Tailwind  

---

## 🚧 To Add Next

🔜 RTL/i18n (Arabic/English toggle)  
🔜 Live updates (SSE/WebSocket)  
🔜 Real backend integration  
🔜 User authentication  

See **CONTRIBUTING.md** for guides!

---

## 🐛 Issues?

**Map not loading?**
- Wait 5 seconds (Leaflet initializes)
- Check browser console
- Try refresh

**Port already in use?**
\`\`\`bash
npx kill-port 3000
npm run dev
\`\`\`

---

## 🎉 You're Ready!

Dashboard is production-ready for demo/hackathon.

**Questions?** Check README.md or HANDOFF.md

**Deploy?** See DEPLOYMENT.md (Vercel = 5 min)

---

**Built with ❤️ for NCMH**
