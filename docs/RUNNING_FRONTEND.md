# Running the Frontend

This guide explains how to set up and run the Rukn frontend application.

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Supabase Account**: For database access

## Environment Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15.5.4
- React 19
- TypeScript
- Tailwind CSS
- Supabase Client
- Framer Motion
- Other dependencies listed in `package.json`

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
touch .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: Check terminal output for network URL

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Check for code issues:

```bash
npm run lint
```

## Accessing the Application

### Dashboard (Admin/Operator View)
```
http://localhost:3000/
```

Features:
- Real-time sentiment analysis map
- Alert ticker and management
- Flagged requests monitoring
- Live operations statistics
- Regional sentiment aggregates

### User Interface (Public Feedback)
```
http://localhost:3000/user
```

Features:
- Text feedback submission
- Audio recording (Arabic)
- Region selection
- Mode selection (Anonymous/Authenticated)

## Common Issues & Solutions

### Issue: Port 3000 Already in Use

**Solution 1:** Stop the process using port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

**Solution 2:** Use a different port
```bash
PORT=3001 npm run dev
```

### Issue: Module Not Found Errors

**Solution:** Clear cache and reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment Variables Not Loading

**Solutions:**
1. Ensure `.env.local` is in the `frontend` directory (not root)
2. Restart the development server after changing `.env.local`
3. Verify variable names start with `NEXT_PUBLIC_`
4. Check for syntax errors in `.env.local` (no spaces around `=`)

### Issue: Supabase Connection Failed

**Check:**
1. Verify Supabase credentials in `.env.local`
2. Ensure Supabase project is active (not paused)
3. Check network connectivity
4. Verify Row Level Security (RLS) policies allow access

**Debug:**
```bash
# Test Supabase connection
curl -I "YOUR_SUPABASE_URL/rest/v1/"
```

### Issue: TypeScript Errors

**Solution:** Run type checking
```bash
npx tsc --noEmit
```

### Issue: Styling Not Applied

**Solutions:**
1. Check if Tailwind CSS is processing correctly
2. Verify `globals.css` is imported in `layout.tsx`
3. Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## Project Structure

```
frontend/
├── app/                    # Next.js 15 app directory
│   ├── page.tsx           # Dashboard (main page)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── api/               # API routes (server-side)
│   │   ├── analyze/       # Text analysis endpoint
│   │   ├── alerts/        # Alert management
│   │   ├── aggregates/    # Regional data
│   │   └── regions/       # Region data
│   └── user/              # User feedback interface
│       └── page.tsx
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   └── user/              # User page components
├── lib/                   # Utilities
│   ├── supabaseClient.ts  # Supabase client
│   ├── utils.ts           # Helper functions
│   └── mock-data.ts       # Mock data for dev
├── types/                 # TypeScript types
│   └── index.ts
└── public/                # Static assets
    └── data/              # GeoJSON data
```

## Development Tips

### Hot Reload
- Changes to components automatically refresh the browser
- API route changes require manual refresh
- `.env.local` changes require server restart

### Debugging
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Check Console for errors
3. Use React DevTools extension
4. Check Network tab for API calls

### Real-time Features
The application uses Supabase Realtime subscriptions for:
- Live sentiment updates on map
- Alert ticker updates
- Flagged requests notifications

To test real-time:
1. Open dashboard in one browser tab
2. Submit feedback in `/user` page (another tab)
3. Watch dashboard update in real-time

## Performance Optimization

### For Development
- Use `npm run dev` for fast refresh
- Enable React DevTools Profiler
- Monitor Network tab for slow requests

### For Production
- Always run `npm run build` before deploying
- Enable Next.js Image Optimization
- Use dynamic imports for heavy components
- Implement code splitting where needed

## API Routes

The frontend includes server-side API routes that communicate with the backend:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Analyze text feedback |
| `/api/analyze-audio` | POST | Analyze audio feedback |
| `/api/alerts` | GET/POST | Manage alerts |
| `/api/aggregates` | GET | Get regional aggregates |
| `/api/regions` | GET | Get region data |
| `/api/flagged-requests` | GET | Get flagged requests |
| `/api/generate-alerts` | POST | Generate new alerts |

## Testing

### Manual Testing Checklist

**Dashboard:**
- [ ] Map loads with regions
- [ ] Sentiment colors display correctly
- [ ] Alert ticker shows alerts
- [ ] Floating cards update with data
- [ ] Flagged requests button works
- [ ] Alert modals open and close

**User Page:**
- [ ] Region selector populates
- [ ] Text input accepts Arabic text
- [ ] Audio recording works
- [ ] Submission succeeds
- [ ] Success toast appears

### Browser Testing
Test on:
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
1. Check this documentation
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md)
3. Open an issue on GitHub
4. Contact the development team

---
