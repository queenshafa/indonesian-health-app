# Deployment & Setup Guide - Kesehatan Digital Indonesia

Complete guide untuk setup dan deploy Kesehatan Digital Indonesia ke production.

---

## Phase 1: Local Development Setup

### 1.1 Prerequisites
- Node.js 18+ dan pnpm
- Git
- Text editor (VS Code recommended)
- GitHub account (untuk version control)

### 1.2 Clone & Install
```bash
# Clone repository
git clone https://github.com/your-org/kesehatan-digital.git
cd kesehatan-digital

# Install dependencies
pnpm install

# Setup environment variables
cp .env.local.example .env.local
```

### 1.3 Environment Variables
Create `.env.local` file dengan format berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI
OPENAI_API_KEY=sk-...

# N8N
N8N_WEBHOOK_TOKEN=your-secure-random-token

# Optional: N8N Webhook URLs (if using self-hosted N8N)
N8N_WEBHOOK_SYMPTOM_ANALYSIS=https://n8n.your-domain.com/webhook/symptom-analysis
N8N_WEBHOOK_BPJS_GUIDE=https://n8n.your-domain.com/webhook/bpjs-guide
N8N_WEBHOOK_FACILITY_FINDER=https://n8n.your-domain.com/webhook/find-facility
```

### 1.4 Initialize Database
Database schema sudah otomatis ter-create via Supabase. Untuk seed demo data:

```bash
# Seed demo data (optional, for testing)
pnpm exec ts-node scripts/seed-demo-data.ts
```

### 1.5 Run Local Dev Server
```bash
pnpm dev
```

Visit http://localhost:3000

---

## Phase 2: Prepare External Services

### 2.1 Supabase Setup

**Create Project:**
1. Go to https://supabase.com
2. Sign up atau login
3. Click "New Project"
4. Fill in project details:
   - Project name: "kesehatan-digital"
   - Password: Generate strong password
   - Region: Choose closest to Indonesia (Singapore or Asia)
5. Create project (tunggu ~3 menit)

**Get Credentials:**
- In Project Settings → API:
  - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Database Schema:**
- Schema sudah di-create otomatis saat Supabase project dibuat
- Verify tables ada di Database → Tables menu

### 2.2 OpenAI Setup

**Get API Key:**
1. Go to https://platform.openai.com
2. Sign up atau login
3. Go to API Keys
4. Click "Create new secret key"
5. Copy key → `OPENAI_API_KEY`

**Set Billing:**
- Go to Settings → Billing
- Add payment method
- Set usage limits untuk safety

### 2.3 N8N Cloud Setup

**Create Account:**
1. Go to https://n8n.cloud
2. Sign up dengan email
3. Verify email
4. Create first organization

**Import Workflows:**
Buat 5 workflows sesuai dokumentasi di `docs/N8N_WORKFLOWS.md`:
1. Real-time Queue Management
2. BPJS Guide Generator
3. AI Symptom Analysis
4. Daily Health Education Scheduler
5. Find Nearest Facility

**Get Webhook URLs:**
- Untuk setiap workflow, click "Execute" → "Execute workflow" → copy webhook URL
- Simpan URLs di environment variables

### 2.4 GitHub Setup

**Create Repository:**
1. Go to https://github.com
2. Click "New Repository"
3. Name: "kesehatan-digital"
4. Description: "Healthcare digital platform for Indonesia"
5. Public (recommended) atau Private
6. Click "Create repository"

**Push Code:**
```bash
cd kesehatan-digital
git init
git add .
git commit -m "Initial commit: Healthcare digital platform MVP"
git branch -M main
git remote add origin https://github.com/your-org/kesehatan-digital.git
git push -u origin main
```

---

## Phase 3: Deploy to Vercel

### 3.1 Connect to Vercel

**Option A: GitHub Integration (Recommended)**
1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub (authorize if needed)
4. Find & select "kesehatan-digital" repository
5. Click "Import"

**Option B: Manual Upload**
1. Download project as ZIP
2. Go to Vercel Dashboard
3. Click "New Project"
4. Upload ZIP file manually

### 3.2 Configure Environment Variables
Di Vercel Project Settings → Environment Variables, add semua variables dari `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
N8N_WEBHOOK_TOKEN=...
```

### 3.3 Deploy

**Auto Deploy (jika pakai GitHub):**
- Setiap push ke `main` branch akan auto-deploy

**Manual Deploy:**
1. Click "Deploy" button di Vercel dashboard
2. Wait for build completion (~3 menit)
3. Project live di domain yang disediakan Vercel

### 3.4 Custom Domain (Optional)

**Setup Custom Domain:**
1. Di Vercel Project Settings → Domains
2. Click "Add Domain"
3. Enter domain (e.g., kesehatan-digital.id)
4. Follow DNS instructions untuk connect domain
5. DNS update bisa butuh 24 jam

---

## Phase 4: Production Optimization

### 4.1 Enable Image Optimization
```bash
# Vercel automatically optimizes images
# Just make sure to use <Image> component instead of <img>
```

### 4.2 Setup Analytics (Optional)

**Vercel Analytics:**
```bash
# Already included in next/analytics
# Just enable di Vercel dashboard
```

### 4.3 Setup Monitoring

**Error Tracking:**
- Consider adding Sentry atau similar
- Set up alerts untuk production errors

### 4.4 Performance Monitoring
- Use Vercel's built-in Web Analytics
- Monitor Core Web Vitals
- Set performance budgets

### 4.5 Database Backups
Di Supabase Project Settings → Backups:
- Enable automatic daily backups
- Set retention period (recommend 30 days)

---

## Phase 5: Pre-Launch Checklist

### Backend & Database
- [ ] Supabase schema verified
- [ ] RLS policies enabled & tested
- [ ] Database backups configured
- [ ] OpenAI API key tested
- [ ] N8N workflows deployed & tested

### Frontend
- [ ] All pages load correctly
- [ ] Auth flow works end-to-end
- [ ] Queue booking works
- [ ] Symptom checker works
- [ ] BPJS assistant works
- [ ] Maps integration works
- [ ] Responsive design tested (mobile, tablet, desktop)

### Security
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] RLS policies tested
- [ ] Input validation implemented
- [ ] SQL injection prevention checked
- [ ] XSS protection enabled

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] API response time < 500ms
- [ ] Database queries optimized

### Content & Legal
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Medical disclaimers visible
- [ ] About page created

### Testing
- [ ] Sign up flow tested
- [ ] Login flow tested
- [ ] Doctor booking flow tested
- [ ] Payment flow tested (if applicable)
- [ ] All forms validated
- [ ] Error handling tested

---

## Phase 6: Post-Launch Monitoring

### 6.1 Daily Checks
```bash
# Check server status
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/db-health

# Monitor logs
# Vercel Dashboard → Logs
```

### 6.2 Weekly Reviews
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify all integrations working
- [ ] Monitor API usage
- [ ] Check database size

### 6.3 Monthly Maintenance
- [ ] Security updates
- [ ] Dependency updates
- [ ] Database maintenance
- [ ] Backup verification
- [ ] Performance optimization

---

## Troubleshooting

### Build Failures

**Issue:** `npm ERR! peer dep missing`
```bash
# Solution
pnpm install --force
pnpm build
```

**Issue:** `Module not found` error
```bash
# Solution
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Deployment Issues

**Issue:** Supabase connection timeout
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify anon key is valid
- Check network connectivity

**Issue:** OpenAI API fails
- Verify OPENAI_API_KEY is set
- Check API key is active
- Verify billing is enabled

### Runtime Issues

**Issue:** Session expires immediately
- Check JWT token configuration
- Verify session cookies are set
- Check auth callback URL

**Issue:** Images not loading
- Verify image URLs are accessible
- Check Vercel Image Optimization enabled
- Verify CORS headers

---

## Scaling Guidelines

### Database Scaling (Supabase)
- Monitor database size in Supabase dashboard
- If > 5GB, consider partitioning
- Setup connection pooling for high traffic

### API Scaling
- Enable serverless function caching
- Implement Redis caching (via Upstash)
- Setup CDN for static assets

### Traffic Scaling
- Use Vercel's auto-scaling
- Monitor bandwidth usage
- Setup rate limiting for APIs

---

## Disaster Recovery

### Backup & Restore

**Automatic Backups:**
- Supabase: 30-day automatic backups
- Vercel: Automatic project backups

**Manual Backup:**
```bash
# Export Supabase database
pg_dump postgresql://user:pass@db.supabase.co/postgres > backup.sql

# Backup environment variables
# Save .env.production to secure location
```

**Restore Procedure:**
1. Provision new Supabase project
2. Import backup data
3. Update environment variables
4. Redeploy to Vercel
5. Test all critical flows

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **OpenAI API Docs:** https://platform.openai.com/docs
- **N8N Docs:** https://docs.n8n.io

---

## Deployment Checklist Summary

```
PHASE 1: Local Setup
[ ] Node.js & pnpm installed
[ ] Repository cloned
[ ] Dependencies installed
[ ] .env.local created
[ ] Dev server running

PHASE 2: External Services
[ ] Supabase project created & schema applied
[ ] OpenAI API key obtained
[ ] N8N workflows deployed
[ ] GitHub repo created

PHASE 3: Vercel Deployment
[ ] Project connected to Vercel
[ ] Environment variables configured
[ ] Build successful
[ ] Deploy successful
[ ] URL working

PHASE 4: Optimization
[ ] Image optimization enabled
[ ] Analytics enabled
[ ] Monitoring setup
[ ] Backups configured

PHASE 5: Pre-Launch
[ ] All features tested
[ ] Security verified
[ ] Performance optimized
[ ] Legal documents added

PHASE 6: Launch
[ ] Production deployment
[ ] Monitor logs
[ ] Verify critical flows
[ ] Alert team of launch

PHASE 7: Post-Launch
[ ] Daily monitoring
[ ] Weekly reviews
[ ] Monthly maintenance
```

---

## Support Contact

For deployment issues or questions:
- Email: support@kesehatan-digital.id
- GitHub Issues: https://github.com/your-org/kesehatan-digital/issues
- Docs: https://kesehatan-digital.id/docs
