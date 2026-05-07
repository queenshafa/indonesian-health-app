# 🏥 Kesehatan Digital Indonesia

Platform kesehatan digital yang dirancang khusus untuk Indonesia, membuat akses kesehatan lebih mudah, lebih cepat, dan untuk semua orang - dari usia <18 hingga 55+.

## ✨ Fitur Utama (MVP Phase 1)

### 1. **Smart Queue & Jadwal Real-Time** 📋
- **Jadwal Dokter Real-Time**: Lihat ketersediaan dokter secara live
- **Status Dokter**: Sedang praktek, terlambat, libur, atau sedang operasi
- **Estimasi Waktu Tunggu**: Hitung otomatis berdasarkan jumlah pasien antri
- **Nomor Antrian Live**: Notifikasi otomatis "5 nomor lagi giliran Anda"
- **Booking Appointment**: Pesan slot konsultasi di hari yang diinginkan

### 2. **BPJS Assistant** 💊
- **Flow Guide Interaktif**: Panduan step-by-step untuk:
  - Cara mengajukan rujukan
  - Cara pindah faskes/tempat berobat
  - Cara daftar online
  - Dokumen yang diperlukan
  - Estimasi waktu & biaya
- **Smart Recommendation**: Input "Saya ingin spesialis kulit" → dapatkan langkah lengkap + lokasi + syarat

### 3. **AI Symptom Checker** 🔍
- **Input Gejala**: Masukkan gejala yang dialami (demam, batuk, mual, dll)
- **AI Analysis**: Bantu identifikasi kemungkinan kondisi umum
- **Tingkat Urgensi**: Low (green) → Medium (yellow) → High (orange) → Emergency (red)
- **Rekomendasi Tindakan**: Istirahat, kapan harus ke dokter, obat awal yang aman
- **Medical Disclaimer**: Selalu ingatkan "Bukan diagnosis final - lihat dokter untuk pasti"

### 4. **Cari Fasilitas Terdekat** 📍
- **One-Button Access**: Tap untuk cari:
  - Klinik terdekat
  - IGD/ER
  - Apotek buka
  - Ambulans
- **Interactive Maps**: Lihat lokasi dengan radius jarak
- **Info Lengkap**: Alamat, phone, jam operasional, biaya awal estimasi

### 5. **Health Education Harian** 📚
- **Daily Tips**: Konten baru setiap hari jam 7 pagi
- **Topik Relevan**: Pola tidur, makan sehat, olahraga, mental health, pertolongan pertama
- **Format Ringan**: Teks pendek, visual friendly, mudah dipahami semua usia
- **Notifikasi**: Push notification untuk user aktif

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework, App Router
- **TailwindCSS v4** - Styling
- **shadcn/ui** - Component library
- **Leaflet + react-leaflet** - Interactive maps

### Backend
- **Supabase PostgreSQL** - Database dengan RLS
- **Next.js API Routes** - Server functions
- **OpenAI GPT-4** - AI untuk symptom checker & health education

### Automation & Workflows
- **N8N Cloud** - Workflow orchestration
- **Supabase MCP** - Database operations
- **OpenAI API** - AI integrations

### Infrastructure
- **Vercel** - Hosting & deployment
- **Supabase** - Auth & Database
- **Environment Variables** - Secure config management

## 📦 Project Structure

```
kesehatan-digital/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   ├── auth/
│   │   ├── login/page.tsx           # Login page
│   │   ├── sign-up/page.tsx         # Sign up page
│   │   ├── callback/route.ts        # OAuth callback
│   │   └── sign-up-success/page.tsx # Success page
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── symptom-checker/page.tsx # Symptom checker
│   │   ├── bpjs-assistant/page.tsx  # BPJS guide
│   │   ├── facilities/page.tsx      # Facility finder
│   │   └── layout.tsx               # Dashboard layout
│   └── api/
│       ├── queues/route.ts          # Queue management API
│       ├── doctors/route.ts         # Doctor list API
│       ├── symptoms/analyze/route.ts # AI symptom analysis
│       ├── facilities/nearby/route.ts # Find nearby facilities
│       └── health-education/route.ts # Health education API
├── components/
│   ├── dashboard/
│   │   ├── navbar.tsx              # Navigation bar
│   │   └── quick-actions.tsx       # Quick action buttons
│   ├── queue/
│   │   ├── queue-status.tsx        # Queue status display
│   │   ├── doctor-search.tsx       # Doctor search
│   │   └── doctor-booking-modal.tsx # Booking modal
│   ├── health-education/
│   │   └── feed.tsx                # Education feed
│   └── maps/
│       └── facility-map.tsx        # Interactive map
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client setup
│   │   ├── server.ts               # Server setup
│   │   └── proxy.ts                # Proxy setup
│   └── utils/
│       └── geolocation.ts          # Geo utilities
├── docs/
│   └── N8N_WORKFLOWS.md            # N8N workflow documentation
├── scripts/
│   └── seed-demo-data.ts           # Demo data seeding
└── middleware.ts                    # Auth middleware
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & pnpm
- Supabase account (for database)
- OpenAI API key (for AI features)
- N8N Cloud account (for workflows)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd kesehatan-digital
pnpm install
```

### 2. Setup Environment Variables
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-api-key

# N8N
N8N_WEBHOOK_TOKEN=your-secure-token
N8N_WEBHOOK_SYMPTOM_ANALYSIS=https://your-n8n-instance.com/webhook/symptom-analysis
N8N_WEBHOOK_BPJS_GUIDE=https://your-n8n-instance.com/webhook/bpjs-guide
N8N_WEBHOOK_FACILITY_FINDER=https://your-n8n-instance.com/webhook/find-facility
```

### 3. Setup Database Schema
Database schema sudah otomatis di-create via Supabase Migration.

### 4. Seed Demo Data (Optional)
```bash
pnpm exec ts-node scripts/seed-demo-data.ts
```

### 5. Run Dev Server
```bash
pnpm dev
```

Visit http://localhost:3000

## 📱 Features by User Type

### Pasien Baru (User)
✅ Buat akun dengan email
✅ Lengkapi profil kesehatan
✅ Cari dan book dokter
✅ Cek gejala dengan AI
✅ Baca edukasi kesehatan harian

### Pasien Existing
✅ Lihat queue status real-time
✅ Dapat notifikasi "giliran segera"
✅ Lihat riwayat kesehatan
✅ Kelola keluarga (keluarga members)
✅ Rate dokter berdasarkan empati

### Admin (Future)
✅ Kelola data dokter & jadwal
✅ Update status queue
✅ Generate health education content
✅ Monitor system metrics

## 🔒 Security & Privacy

- **Row Level Security (RLS)** di Supabase untuk isolasi data user
- **Encrypted passwords** dengan bcrypt
- **JWT tokens** untuk auth
- **HTTPS only** - tidak ada data terkirim plain text
- **GDPR compliant** - user bisa delete data mereka

## 📊 Database Schema

11 core tables:
1. **profiles** - User data dengan BPJS info
2. **family_members** - Anggota keluarga
3. **clinics** - Klinik & rumah sakit
4. **doctors** - Data dokter
5. **doctor_schedules** - Jadwal praktek
6. **queues** - Antrian & appointment
7. **doctor_reviews** - Rating dokter (empati-focused)
8. **health_educations** - Konten edukasi
9. **health_records** - Riwayat kesehatan user
10. **traditional_medicine** - Info obat tradisional
11. **facilities** - Fasilitas (ambulans, apotek, dll)

Semua table punya RLS policies untuk user privacy.

## 🤖 N8N Workflows

5 core workflows:
1. **Real-time Queue Management** - Polling antrian setiap 30 detik
2. **BPJS Guide Generator** - Generate panduan BPJS dengan AI
3. **AI Symptom Analysis** - Analisis gejala pakai OpenAI
4. **Daily Health Education** - Generate & send konten edukasi 7 AM
5. **Find Nearest Facility** - Geolocation-based facility finder

Lihat `docs/N8N_WORKFLOWS.md` untuk detail lengkap setup.

## 🌍 Optimizations untuk Indonesia Users

### Low Bandwidth Friendly
- Minimal images, optimized assets
- Lazy loading components
- Caching strategies
- Progressive enhancement

### Mobile-First
- Responsive design for all screen sizes
- Touch-friendly buttons & interactions
- Fast load times
- Works with slow networks

### Accessibility for All Ages
- Large text sizes
- High contrast colors
- Simple navigation
- Clear language (bukan medical jargon)
- Support untuk screen readers

### Offline Support (Future)
- Service workers untuk cache
- Work offline, sync when online
- Critical features available offline

## 📚 API Documentation

### Queue Management
```bash
GET /api/queues - Get current queues
POST /api/queues - Create new queue entry
```

### Doctor List
```bash
GET /api/doctors - Get all doctors
GET /api/doctors?specialization=kulit - Filter by specialty
```

### Symptom Analysis
```bash
POST /api/symptoms/analyze
Body: {
  "symptoms": ["demam", "batuk"],
  "severity": "moderate",
  "age": 28
}
```

### Facilities
```bash
POST /api/facilities/nearby
Body: {
  "latitude": -6.2088,
  "longitude": 106.8456,
  "facility_type": "clinic",
  "radius_km": 5
}
```

### Health Education
```bash
GET /api/health-education - Get latest posts
POST /api/health-education - Create new (N8N only)
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up & login flow
- [ ] Doctor booking & queue
- [ ] Symptom checker
- [ ] BPJS assistant
- [ ] Facility finder with maps
- [ ] Health education feed
- [ ] Family members management
- [ ] Doctor reviews

### Test Accounts (Demo)
```
Email: demo@example.com
Password: DemoPass123!
```

## 🔧 Troubleshooting

### Database Issues
```bash
# Check Supabase connection
pnpm exec ts-node -e "import { createServerClient } from './lib/supabase/server'; createServerClient().then(() => console.log('✅ Connected'))"
```

### Auth Issues
- Ensure env vars are set
- Check email confirmation (if enabled)
- Clear cookies & session storage

### Maps Not Loading
- Check Leaflet CSS import
- Verify geolocation permissions
- Check browser console for errors

## 📖 Documentation

- **[N8N Workflows](docs/N8N_WORKFLOWS.md)** - Complete workflow setup guide
- **[Database Schema](docs/SCHEMA.md)** - Detailed schema documentation
- **[API Routes](docs/API.md)** - API endpoint documentation

## 🚀 Deployment

### Deploy to Vercel
```bash
git push origin main
# Auto-deploys via Vercel
```

### Deploy to Custom Server
```bash
pnpm build
pnpm start
```

Environment variables perlu di-set di hosting platform.

## 🤝 Contributing

Contributions welcome! Silakan:
1. Fork repository
2. Create feature branch
3. Submit pull request

## 📄 License

Lihat LICENSE file untuk details.

## 💬 Support & Contact

- Email: support@kesehatan-digital.id
- Website: www.kesehatan-digital.id
- Issues: GitHub Issues

---

## 🎯 Roadmap

### Phase 1 (MVP - Current)
✅ Core features (queue, BPJS, symptom checker, facilities, health education)

### Phase 2 (Next)
- Telemedicine consultations
- E-prescription
- Integration dengan traditional medicine
- SMS notifications for low-internet users

### Phase 3
- AI-powered health insights
- Integration dengan wearables
- Community forum
- Multi-language support

---

**Built with ❤️ for Indonesia's Health**
