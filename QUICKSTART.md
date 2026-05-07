# Quick Start Guide - Kesehatan Digital Indonesia

Get up and running in 10 minutes.

## 1. Clone & Install (2 minutes)

```bash
git clone https://github.com/your-org/kesehatan-digital.git
cd kesehatan-digital
pnpm install
```

## 2. Setup Environment Variables (3 minutes)

Create `.env.local` file:

```env
# REQUIRED - Get from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# REQUIRED - Get from OpenAI Platform
OPENAI_API_KEY=sk-your-api-key-here

# OPTIONAL - For N8N webhooks
N8N_WEBHOOK_TOKEN=your-secure-random-token
```

## 3. Start Dev Server (1 minute)

```bash
pnpm dev
```

Visit **http://localhost:3000**

## 4. Test the App (4 minutes)

### Landing Page
- Visit homepage
- See 6 main features
- Click "Daftar Gratis Sekarang"

### Sign Up
- Enter email: demo@example.com
- Enter password: DemoPass123!
- Click "Daftar"
- Confirm email (check mailbox)

### Dashboard
- See Quick Actions
- Try each main feature:
  - Queue booking
  - Doctor search
  - Symptom checker
  - BPJS assistant
  - Health education
  - Facility finder

### Symptom Checker Demo
1. Click "Cek Gejala"
2. Select symptoms (e.g., demam, batuk)
3. Set severity & duration
4. Click "Analisis Gejala Saya"
5. See AI analysis with urgency level

### BPJS Assistant Demo
1. Click "Bantuan BPJS"
2. Select action (e.g., "Cara Pindah Fasilitas")
3. See step-by-step guide
4. Expand each step for details

### Facility Finder Demo
1. Click "Cari Fasilitas"
2. Allow geolocation access
3. See interactive map
4. Filter by facility type
5. Click facility for details

## Key Credential Sets

### Demo Account (Pre-configured)
```
Email: demo@example.com
Password: DemoPass123!
```

### Admin Account (Create manually)
```
Email: admin@kesehatan-digital.id
Password: AdminPass123!
```

## Project URLs

| Service | URL |
|---------|-----|
| Dev Server | http://localhost:3000 |
| Supabase Dashboard | https://supabase.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| N8N Cloud | https://n8n.cloud |
| OpenAI Dashboard | https://platform.openai.com |

## File Structure Cheat Sheet

```
app/
  ├── page.tsx                    ← Landing page
  ├── dashboard/page.tsx          ← Main dashboard
  ├── dashboard/symptom-checker/  ← Symptom feature
  ├── dashboard/bpjs-assistant/   ← BPJS feature
  ├── dashboard/facilities/       ← Maps feature
  ├── api/symptoms/analyze/       ← AI API
  └── api/facilities/nearby/      ← Maps API

components/
  ├── queue/                      ← Queue components
  ├── symptom/                    ← Symptom UI
  ├── bpjs/                       ← BPJS UI
  ├── maps/                       ← Maps UI
  └── health-education/           ← Education UI

docs/
  ├── N8N_WORKFLOWS.md           ← Workflow setup
  ├── DEPLOYMENT.md              ← Deploy guide
  └── PROJECT_SUMMARY.md         ← Overview
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production build
pnpm start

# Format code
pnpm format

# Type check
pnpm type-check

# Seed demo data (optional)
pnpm exec ts-node scripts/seed-demo-data.ts
```

## Feature Walkthrough

### 1. Queue & Booking (5 min)
- Dashboard → see available doctors
- Click doctor → see schedule
- Book appointment → get queue number
- See live queue updates

### 2. Symptom Checker (3 min)
- Dashboard → "Cek Gejala"
- Select symptoms from list
- Set severity & duration
- Get AI analysis + urgency level

### 3. BPJS Assistant (5 min)
- Dashboard → "Bantuan BPJS"
- Choose action (rujukan/pindah/daftar)
- See step-by-step guide
- Expand steps for details

### 4. Facility Finder (3 min)
- Dashboard → "Cari Fasilitas"
- Allow location access
- See map with nearby clinics
- View distance & opening hours

### 5. Doctor Reviews (2 min)
- After appointment
- Click "Beri Rating"
- Rate empathy, communication, listening
- Read other reviews

### 6. Health Education (1 min)
- Dashboard → see education feed
- Read daily health tips
- Filter by category
- Share tips with family

## Debugging Tips

### Check Supabase Connection
```bash
# In browser console
const { createClient } = await import('@/lib/supabase/client')
const supabase = createClient()
const { data } = await supabase.from('profiles').select('*').limit(1)
console.log(data) // Should show profile data
```

### Check OpenAI Connection
```bash
# Visit http://localhost:3000/api/health-check
# Should return status 200
```

### Check Maps Loading
```bash
# Ensure Leaflet CSS is imported in layout.tsx
// Should see map container on facilities page
```

### Check Real-time Subscriptions
```bash
# In browser console
// Open DevTools → Network tab
// Look for WebSocket connections from Supabase
```

## Environment Setup Checklist

```
SETUP REQUIREMENTS:
[ ] Node.js 18+ installed
[ ] pnpm installed
[ ] Supabase account created
[ ] OpenAI API key obtained
[ ] .env.local created with all keys
[ ] pnpm install completed
[ ] Dev server running
[ ] http://localhost:3000 loads
```

## Frontend Development

### Add New Page
1. Create file in `app/dashboard/new-feature/page.tsx`
2. Use layout from `dashboard/layout.tsx`
3. Import components from `components/`
4. Add to navigation in `components/dashboard/navbar.tsx`

### Add New Component
1. Create file in `components/feature/component-name.tsx`
2. Export as `export function ComponentName() { ... }`
3. Import in page: `import { ComponentName } from '@/components/feature/component-name'`

### Add New API Route
1. Create file in `app/api/feature/route.ts`
2. Export POST, GET, etc. as needed
3. Use `createServerClient()` for Supabase
4. Return `NextResponse.json(data)`

## Backend Development

### Add Database Table
1. Go to Supabase Dashboard
2. Create table with columns
3. Enable RLS
4. Add policies for CRUD
5. Generate TypeScript types: `pnpm exec supabase gen types`

### Add API Endpoint
1. Create route in `app/api/feature/route.ts`
2. Query Supabase with `createServerClient()`
3. Add request validation
4. Return response

### Add N8N Workflow
1. Go to n8n.cloud
2. Create new workflow
3. Add trigger & nodes
4. Copy webhook URL
5. Add to `.env.local`

## Deployment Checklist

Before deploying to production:

```
[ ] All env vars set in Vercel
[ ] Supabase backups enabled
[ ] N8N workflows tested
[ ] OpenAI API limits set
[ ] Database schema verified
[ ] RLS policies tested
[ ] Auth flow tested
[ ] All pages load
[ ] Mobile responsive
[ ] Performance optimized
```

## Getting Help

1. **Read Documentation**
   - Check `/docs` folder
   - Read code comments
   - See README.md

2. **Check Examples**
   - Look at existing components
   - Check similar API routes
   - Review test examples

3. **Debug Locally**
   - Use browser DevTools
   - Check Network tab
   - View Console for errors

4. **Ask for Help**
   - Create GitHub issue
   - Tag with `[help wanted]`
   - Include error message & steps to reproduce

## Next Steps

1. ✅ Understand the codebase structure
2. ✅ Get environment variables working
3. ✅ Test all 6 main features
4. ✅ Read `/docs` for detailed info
5. ✅ Start implementing Phase 2 features

---

**You're ready to develop! Happy coding.** 🚀

Still have questions? Check:
- `/docs/PROJECT_SUMMARY.md` - Full overview
- `/docs/N8N_WORKFLOWS.md` - Workflow details
- `/docs/DEPLOYMENT.md` - Deployment guide
- GitHub Issues - Known problems & solutions
