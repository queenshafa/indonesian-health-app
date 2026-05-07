# Documentation Index - Kesehatan Digital Indonesia

Complete guide to all project documentation and resources.

## Quick Navigation

### For New Developers
1. Start here: **[QUICKSTART.md](../QUICKSTART.md)** - Get running in 10 minutes
2. Then read: **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - Understand the project
3. Finally read: **[README.md](../README.md)** - Full feature overview

### For Deployment
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
2. **[N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)** - Workflow setup details

### For Feature Development
1. Read relevant section in **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)**
2. Check component code in `components/`
3. Check API routes in `app/api/`

---

## Documentation Structure

### Root Level Files

#### README.md
- **What:** Full project overview with all features
- **Who:** Anyone wanting to understand the complete project
- **Read time:** 10 minutes
- **Contains:**
  - Complete feature list with descriptions
  - Tech stack explanation
  - Project structure overview
  - Quick start instructions
  - API documentation
  - Troubleshooting guide

#### QUICKSTART.md
- **What:** Get the project running in 10 minutes
- **Who:** New developers or first-time setup
- **Read time:** 5 minutes
- **Contains:**
  - Installation steps
  - Environment setup
  - Starting dev server
  - Testing the app
  - Credential sets
  - Debugging tips

#### PROJECT_SUMMARY.md
- **What:** Executive project overview & architecture
- **Who:** Project managers, team leads, architects
- **Read time:** 15 minutes
- **Contains:**
  - Executive overview
  - What was built (6 main features)
  - Technical architecture
  - Database schema
  - Security & compliance
  - Performance metrics
  - Testing checklist
  - Roadmap

### Documentation Folder (`/docs`)

#### DEPLOYMENT.md
- **What:** Complete deployment guide from local to production
- **Who:** DevOps engineers, deployment team
- **Read time:** 20 minutes
- **Phases:**
  - Phase 1: Local development setup
  - Phase 2: Prepare external services
  - Phase 3: Deploy to Vercel
  - Phase 4: Production optimization
  - Phase 5: Pre-launch checklist
  - Phase 6: Post-launch monitoring
- **Contains:**
  - Step-by-step setup instructions
  - Environment variable configuration
  - Database initialization
  - Service integration (Supabase, OpenAI, N8N)
  - Deployment procedures
  - Troubleshooting
  - Disaster recovery

#### N8N_WORKFLOWS.md
- **What:** Complete N8N workflow documentation
- **Who:** Backend developers, workflow engineers
- **Read time:** 25 minutes
- **Workflows:**
  1. Real-time Queue Management
  2. BPJS Guide Generator
  3. AI Symptom Analysis
  4. Daily Health Education Scheduler
  5. Find Nearest Facility
- **Contains:**
  - Purpose of each workflow
  - Detailed step-by-step configuration
  - Request/response examples
  - Environment variables
  - Testing instructions
  - Monitoring & logging

#### INDEX.md (This File)
- **What:** Navigation guide for all documentation
- **Who:** Everyone
- **Read time:** 5 minutes
- **Contains:**
  - Documentation index
  - File purposes & read times
  - Quick navigation paths

---

## By Role

### Product Manager
1. **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - Understand what was built
2. **[QUICKSTART.md](../QUICKSTART.md)** - See the product in action
3. **[README.md](../README.md)** - Marketing & feature copy

**Time commitment:** 20 minutes

### Frontend Developer
1. **[QUICKSTART.md](../QUICKSTART.md)** - Get environment running
2. **[README.md](../README.md)** - Component & page structure
3. Check `/components` and `/app` folders for code examples

**Time commitment:** 30 minutes

### Backend Developer
1. **[QUICKSTART.md](../QUICKSTART.md)** - Get environment running
2. **[N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)** - Workflow configuration
3. Check `/app/api` for existing API patterns

**Time commitment:** 45 minutes

### DevOps Engineer
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
2. **[N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)** - Service integration
3. **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - Architecture overview

**Time commitment:** 60 minutes

### Project Lead / Architect
1. **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - Executive overview
2. **[README.md](../README.md)** - Technical details
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Scalability & infrastructure

**Time commitment:** 40 minutes

---

## By Task

### "I want to understand the project"
1. **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** (15 min)
2. **[QUICKSTART.md](../QUICKSTART.md)** (5 min)
3. **[README.md](../README.md)** (10 min)

### "I want to run it locally"
1. **[QUICKSTART.md](../QUICKSTART.md)** (10 min)
2. Follow setup instructions
3. Test in browser

### "I want to deploy to production"
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** Phase 1-3 (30 min)
2. Follow checklist
3. Deploy to Vercel

### "I want to add a new feature"
1. **[README.md](../README.md)** - Project structure (5 min)
2. Check existing component in `/components` (5 min)
3. Check similar API route in `/app/api` (5 min)
4. Start development

### "I want to setup N8N workflows"
1. **[N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)** (25 min)
2. Follow workflow setup for each of 5 workflows
3. Test webhook URLs

### "I want to optimize performance"
1. **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - Performance Metrics section
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Phase 4 Optimization
3. Use Vercel Analytics to identify issues

---

## Key Concepts Explained

### Queue System
- **Doc:** README.md → Smart Queue & Scheduling
- **Code:** `/components/queue/`, `/app/api/queues/`
- **Workflow:** N8N Real-time Queue Management (updates every 30 seconds)

### BPJS Assistant
- **Doc:** README.md → BPJS Assistant
- **Code:** `/components/bpjs/`, `/app/dashboard/bpjs-assistant/`
- **Data:** Hardcoded guides in page component

### Symptom Checker
- **Doc:** README.md → AI Symptom Checker
- **Code:** `/components/symptom/`, `/app/api/symptoms/analyze/`
- **Integration:** OpenAI GPT-4

### Facility Finder
- **Doc:** README.md → Cari Fasilitas Terdekat
- **Code:** `/components/maps/`, `/app/api/facilities/nearby/`
- **Integration:** Leaflet maps, Geolocation API

### Health Education
- **Doc:** README.md → Health Education Harian
- **Code:** `/components/health-education/`, `/app/api/health-education/`
- **Workflow:** N8N Daily scheduler (7 AM trigger)

---

## API Reference Quick Links

### Queue API
- **POST `/api/queues`** - Create appointment
- **GET `/api/queues`** - List appointments
- **PATCH `/api/queues/:id`** - Update status

### Doctor API
- **GET `/api/doctors`** - List all doctors
- **GET `/api/doctors?specialization=X`** - Filter by specialty

### Symptom Analysis API
- **POST `/api/symptoms/analyze`** - Analyze symptoms with AI

### Facility Finder API
- **POST `/api/facilities/nearby`** - Find nearby facilities

### Health Education API
- **GET `/api/health-education`** - Get education posts
- **POST `/api/health-education`** - Create post (N8N only)

*Full API documentation in README.md*

---

## Database Tables Reference

| Table | Purpose | Rows | Status |
|-------|---------|------|--------|
| `profiles` | User data & preferences | User-managed | ✅ Complete |
| `family_members` | Family member info | User-managed | ✅ Complete |
| `clinics` | Healthcare facilities | Seed data | ✅ Complete |
| `doctors` | Doctor information | Seed data | ✅ Complete |
| `doctor_schedules` | Doctor availability | Seed data | ✅ Complete |
| `queues` | Appointments & queue | User-managed | ✅ Complete |
| `doctor_reviews` | Doctor ratings | User-generated | ✅ Complete |
| `health_educations` | Educational content | N8N-generated | ✅ Complete |
| `health_records` | Health history | User-managed | ✅ Complete |
| `traditional_medicine` | Herbal info | Seed data | ✅ Complete |
| `facilities` | Services (ambulance, etc) | Seed data | ✅ Complete |

*Full schema details in PROJECT_SUMMARY.md*

---

## Environment Variables Checklist

### Required (MVP)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

### Optional (N8N Webhooks)
```
N8N_WEBHOOK_TOKEN
N8N_WEBHOOK_SYMPTOM_ANALYSIS
N8N_WEBHOOK_BPJS_GUIDE
N8N_WEBHOOK_FACILITY_FINDER
```

*Full list in DEPLOYMENT.md Phase 1.3*

---

## Common Questions & Answers

### Q: How do I get started?
**A:** Read [QUICKSTART.md](../QUICKSTART.md) - will have you running in 10 minutes.

### Q: How do I deploy?
**A:** Follow [DEPLOYMENT.md](./DEPLOYMENT.md) Phase 3 - Vercel deployment section.

### Q: How do I setup N8N?
**A:** Read [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md) - complete setup guide for all 5 workflows.

### Q: How do I add a new feature?
**A:** Check [README.md](../README.md) project structure, then look at similar component/API for pattern.

### Q: Where is the code for [feature]?
**A:** Check file structure in [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) or search in code.

### Q: How do I test locally?
**A:** Follow test section in [QUICKSTART.md](../QUICKSTART.md).

### Q: What's the database schema?
**A:** See [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) → Database Schema section.

### Q: How does the AI work?
**A:** Check [README.md](../README.md) → AI Symptom Checker section, or code in `/app/api/symptoms/analyze/route.ts`.

### Q: How are updates pushed in real-time?
**A:** Via Supabase real-time subscriptions. See N8N queue workflow in [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md).

---

## File Size & Read Times

| Document | File Size | Read Time | Scope |
|----------|-----------|-----------|-------|
| QUICKSTART.md | 8 KB | 5 min | Setup & testing |
| README.md | 25 KB | 10 min | Full overview |
| PROJECT_SUMMARY.md | 35 KB | 15 min | Architecture & strategy |
| DEPLOYMENT.md | 28 KB | 20 min | Deployment guide |
| N8N_WORKFLOWS.md | 32 KB | 25 min | Workflow details |
| INDEX.md | 12 KB | 5 min | Documentation guide |

**Total documentation:** ~140 KB, ~80 minutes of reading

---

## Version Info

- **Project Version:** 1.0.0 (MVP)
- **Last Updated:** 2026-05-07
- **Status:** Ready for deployment
- **Next Phase:** Phase 2 (Telemedicine + E-prescription)

---

## Contact & Support

**For questions about:**
- Features: Check README.md
- Deployment: Check DEPLOYMENT.md
- Development: Check code comments & examples
- N8N setup: Check N8N_WORKFLOWS.md

**Contact:**
- Email: support@kesehatan-digital.id
- GitHub: Create issue with `[docs]` tag
- Docs: Check this INDEX.md first

---

## Glossary

- **MVP:** Minimum Viable Product - current release with 6 core features
- **RLS:** Row Level Security - database-level access control
- **N8N:** Workflow automation platform - handles background jobs
- **Supabase:** PostgreSQL database + auth provider
- **OpenAI:** AI API for symptom analysis & content generation
- **Vercel:** Hosting & deployment platform

---

**Documentation Status: Complete ✅**

All critical documentation is ready. Project is ready for development & deployment.
