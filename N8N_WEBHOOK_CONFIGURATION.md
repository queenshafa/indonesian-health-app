# N8N Webhook Configuration Guide

Panduan lengkap konfigurasi N8N sesuai dengan WEBHOOK_ARCHITECTURE.txt

## Diagram Flow

```
CLIENT APP
    ↓
POST /api/symptoms/analyze (returns job_id)
    ↓
N8N Receives Job
    ↓
N8N Processes
    ↓
N8N POSTs Result to /api/webhooks/symptom-analysis
    ↓
Client Polls /api/jobs/[job_id]
    ↓
Gets Result
```

## 1. SYMPTOM ANALYSIS WORKFLOW

### Step 1: Initial Webhook (dari App ke N8N)

**N8N Configuration:**
- Trigger Type: Webhook
- Method: POST
- URL: `https://sapuwicak.app.n8n.cloud/webhook/symptom-analysis`

**Expected Input dari App:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "webhook_url": "https://health-app.com/api/webhooks/symptom-analysis",
  "patient_id": "user-123",
  "symptoms": ["fever", "cough"],
  "duration": "3 days",
  "severity": "moderate",
  "age": 28
}
```

### Step 2: Processing dalam N8N

**Nodes yang diperlukan:**

1. **Webhook Trigger** - Terima data dari app
   - Simpan field: job_id, webhook_url
   - Simpan field: patient_id, symptoms, duration, severity, age

2. **Gemini AI Node** - Analisis gejala
   - Input: symptoms, duration, severity, age
   - Prompt: "Analyze these symptoms and provide health guidance"
   - Output: analysis_result (JSON)

3. **Code/Function Node** - Format hasil
   - Input: analysis_result dari Gemini
   - Output: structured response dengan urgency_level, conditions, actions

### Step 3: Callback Webhook (dari N8N ke App)

**Yang N8N kirim balik ke webhook_url:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "patient_id": "user-123",
  "symptoms": ["fever", "cough"],
  "duration": "3 days",
  "severity": "moderate",
  "age": 28,
  "status": "completed",
  "analysis_result": {
    "disclaimer": "NOT a medical diagnosis",
    "urgency_level": "medium",
    "urgency_color": "yellow",
    "possible_conditions": [
      {
        "name": "Common Cold",
        "likelihood": "high",
        "description": "..."
      }
    ],
    "immediate_actions": [
      "Rest",
      "Stay hydrated",
      "Monitor temperature"
    ],
    "when_to_see_doctor": "If symptoms worsen",
    "red_flags": ["Difficulty breathing", "Severe chest pain"],
    "follow_up_questions": ["How long have symptoms lasted?"]
  }
}
```

---

## 2. FACILITY FINDER WORKFLOW

### Step 1: Initial Webhook (dari App ke N8N)

**N8N Configuration:**
- Trigger Type: Webhook
- Method: POST
- URL: `https://sapuwicak.app.n8n.cloud/webhook/facility-finder`

**Expected Input dari App:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "webhook_url": "https://health-app.com/api/webhooks/facility-finder",
  "user_id": "user-123",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "radius_km": 10,
  "facility_type": "clinic"
}
```

### Step 2: Processing dalam N8N

**Nodes yang diperlukan:**

1. **Webhook Trigger** - Terima koordinat dari app
   - Simpan: job_id, webhook_url, latitude, longitude, radius_km

2. **Database Query Node** - Ambil fasilitas dari database
   - Query: SELECT * FROM clinics WHERE (distance calculation)
   - Filter: dalam radius tertentu

3. **Code Node** - Hitung jarak dengan Haversine Formula
   - Input: latitude, longitude dari semua clinics
   - Output: sorted by distance

4. **Format Node** - Prepare response
   - Output: array of facilities dengan nama, alamat, distance, rating

### Step 3: Callback Webhook (dari N8N ke App)

**Yang N8N kirim balik:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "user-123",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "radius_km": 10,
  "status": "completed",
  "facilities": [
    {
      "id": "clinic-001",
      "name": "Clinic A",
      "clinic_type": "clinic",
      "address": "Jl. Jend Sudirman No. 1",
      "city": "Jakarta",
      "phone": "021-1234567",
      "latitude": -6.2100,
      "longitude": 106.8470,
      "rating": 4.5,
      "distance_km": 0.2,
      "specialties": ["General Practice", "Cardiology"],
      "services": ["Consultation", "Lab Test"],
      "operating_hours": "08:00-17:00",
      "average_wait_time_minutes": 15
    },
    {
      "id": "clinic-002",
      "name": "Clinic B",
      "distance_km": 1.5
    }
  ]
}
```

---

## 3. QUEUE PROCESSING WORKFLOW

### Step 1: Initial Webhook (dari App ke N8N)

**N8N Configuration:**
- Trigger Type: Webhook
- Method: POST
- URL: `https://sapuwicak.app.n8n.cloud/webhook/queue-processing`

**Expected Input dari App:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440002",
  "webhook_url": "https://health-app.com/api/webhooks/queue-processing",
  "patient_id": "user-123",
  "doctor_id": "doc-456",
  "clinic_id": "clinic-001",
  "appointment_date": "2025-05-15",
  "appointment_time": "14:00",
  "reason_for_visit": "Check up",
  "consultation_type": "general"
}
```

### Step 2: Processing dalam N8N

**Nodes yang diperlukan:**

1. **Webhook Trigger** - Terima appointment data
   - Simpan: job_id, webhook_url, semua appointment details

2. **Database Query Node** - Cari queue number terakhir
   - Query: SELECT MAX(queue_number) FROM queues WHERE doctor_id = ? AND appointment_date = ?

3. **Code Node** - Generate queue number
   - Input: max_queue_number
   - Kalkulasi: queue_number = max_queue_number + 1
   - Kalkulasi: estimated_wait_time = queue_number * 30 menit

4. **Database Insert Node** - Simpan ke database
   - Insert: patient_id, doctor_id, clinic_id, appointment_date, appointment_time, queue_number, reason_for_visit, status = 'waiting'

### Step 3: Callback Webhook (dari N8N ke App)

**Yang N8N kirim balik:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440002",
  "patient_id": "user-123",
  "doctor_id": "doc-456",
  "clinic_id": "clinic-001",
  "appointment_date": "2025-05-15",
  "appointment_time": "14:00",
  "status": "completed",
  "queue_result": {
    "queue_id": "queue-789",
    "queue_number": 5,
    "estimated_wait_time_minutes": 150,
    "reason_for_visit": "Check up",
    "consultation_type": "general",
    "status": "waiting"
  }
}
```

---

## NEXT.JS WEBHOOK RECEIVERS

### Symptom Analysis Receiver

**Endpoint:** `POST /api/webhooks/symptom-analysis`

**Menerima:** Analysis result dari N8N
**Melakukan:**
1. Validate job_id & patient_id
2. Insert ke health_records table
3. Update async_jobs dengan status "completed" + result
4. Return: { success: true }

**File:** `/app/api/webhooks/symptom-analysis/route.ts`

---

### Facility Finder Receiver

**Endpoint:** `POST /api/webhooks/facility-finder`

**Menerima:** List fasilitas dari N8N
**Melakukan:**
1. Validate job_id & user_id
2. Insert facilities ke database (atau save result langsung)
3. Update async_jobs dengan status "completed" + result
4. Return: { success: true }

**File:** `/app/api/webhooks/facility-finder/route.ts`

---

### Queue Processing Receiver

**Endpoint:** `POST /api/webhooks/queue-processing`

**Menerima:** Queue assignment dari N8N
**Melakukan:**
1. Validate job_id & patient_id
2. Queue sudah dibuat di N8N, confirm di health records
3. Update async_jobs dengan status "completed" + queue_result
4. Return: { success: true }

**File:** `/app/api/webhooks/queue-processing/route.ts`

---

## CLIENT POLLING

**Endpoint:** `GET /api/jobs/[job_id]`

**Dikembalikan:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending|processing|completed|failed",
  "result": { ...actual result from N8N },
  "error_message": null,
  "created_at": "2025-05-08T10:30:00Z",
  "completed_at": "2025-05-08T10:30:25Z"
}
```

---

## TESTING

### Test Symptom Analysis Endpoint

```bash
curl -X POST http://localhost:3000/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "duration": "3 days",
    "severity": "moderate",
    "age": 28
  }'
```

Response:
```json
{
  "message": "Symptom analysis queued",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

### Poll untuk Results

```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000
```

---

## ENVIRONMENT VARIABLES CHECKLIST

- [ ] `NEXT_PUBLIC_SUPABASE_URL` ✓ (sudah set)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓ (sudah set)
- [ ] `N8N_WEBHOOK_URL` ❌ (HARUS DISET)
  - Format: `https://sapuwicak.app.n8n.cloud/webhook/symptom-analysis` (ATAU URL custom dari N8N)
  
- [ ] `NEXT_PUBLIC_API_URL` (optional)
  - Format: `https://health-app.com` atau `http://localhost:3000`
  - Digunakan untuk callback URL ke N8N

---

## SUMMARY

| Komponen | URL | Method | Fungsi |
|----------|-----|--------|--------|
| App Route | POST /api/symptoms/analyze | POST | Kirim job ke queue |
| N8N Trigger | /webhook/symptom-analysis | POST | Terima job dari app |
| N8N Processing | (internal) | - | Process dengan AI/DB |
| Webhook Receiver | POST /api/webhooks/symptom-analysis | POST | Terima hasil dari N8N |
| Client Polling | GET /api/jobs/[job_id] | GET | Ambil status & hasil |

Semuanya sudah sesuai dengan WEBHOOK_ARCHITECTURE.txt! 

**Yang perlu dikonfigurasi di N8N:**
1. 3 Webhook Trigger (symptom-analysis, facility-finder, queue-processing)
2. Processing nodes (Gemini AI, Database, Code for calculations)
3. Callback mechanism ke /api/webhooks/...

**Yang sudah ada di Next.js:**
1. Routes untuk trigger (/api/symptoms/analyze, dll)
2. Webhook receivers untuk N8N callback
3. Job polling endpoint (/api/jobs/[job_id])
4. Database integration untuk async_jobs tracking
