# N8N Workflows untuk Healthcare App Indonesia

## Overview
Dokumentasi lengkap untuk 5 core N8N workflows yang menggerakkan sistem healthcare app.

---

## 1. REAL-TIME QUEUE MANAGEMENT WORKFLOW

### Purpose
Mengelola antrian real-time, mengirim notifikasi, dan update status dokter setiap 30 detik.

### Trigger
- **Type**: Interval
- **Frequency**: Every 30 seconds

### Steps

#### Step 1: Poll Queue Status
```
HTTP Request
- Method: GET
- URL: {{BASE_URL}}/api/queues
- Headers: Authorization: Bearer {{SUPABASE_SERVICE_ROLE}}
```

#### Step 2: Filter Active Queues
```
Filter (JavaScript)
$input.all().filter(item => item.status === 'waiting')
```

#### Step 3: Calculate Wait Times
```
Code (JavaScript)
items.map(item => ({
  ...item,
  estimated_wait_time_minutes: (item.queue_number - 1) * 30,
  notification_needed: (item.queue_number - item.current_patient_number) <= 5
}))
```

#### Step 4: Send Notifications
```
Webhook
- Send HTTP POST to: {{BASE_URL}}/api/notifications
- Payload: notification data for users whose turn is coming (5+ positions away)
```

#### Step 5: Update Doctor Status
```
Supabase
- Update doctors table
- Set availability_status based on current queue count
- Rule: 
  - available (0 patients)
  - busy (1-5 patients)
  - on_break (schedule break time)
  - on_surgery (if marked in schedule)
```

#### Step 6: Log Metrics
```
Supabase
- Insert to analytics table (optional)
- Store: timestamp, queue_count, avg_wait_time, peak_hours
```

### Data Flow
```
Supabase (queues table) 
  → Poll every 30s 
  → Calculate wait times 
  → Send notifications 
  → Update doctor status 
  → Log metrics
```

---

## 2. BPJS GUIDE GENERATOR WORKFLOW

### Purpose
Generate step-by-step BPJS guidance berdasarkan user's specialty/need selection.

### Trigger
- **Type**: HTTP Webhook
- **Endpoint**: `POST /webhook/bpjs-guide`

### Request Payload
```json
{
  "user_id": "uuid",
  "specialty": "kulit|gigi|umum|ortho|...",
  "action": "rujukan|pindah_faskes|daftar_online|informasi",
  "location_city": "Jakarta"
}
```

### Steps

#### Step 1: Validate Input
```
Code (JavaScript)
const validSpecialties = ['kulit', 'gigi', 'jantung', 'mata', 'umum', 'ortho', 'anak'];
const validActions = ['rujukan', 'pindah_faskes', 'daftar_online', 'informasi'];

if (!validSpecialties.includes($input.json.specialty)) {
  throw new Error('Invalid specialty');
}
```

#### Step 2: Query GPT-4 untuk Generate Steps
```
OpenAI
- Model: gpt-4-turbo
- Prompt: Generate BPJS {{action}} guide untuk {{specialty}}
- Include: langkah-langkah, dokumen dibutuhkan, estimasi waktu, biaya
```

#### Step 3: Get Nearby Facilities
```
Supabase Query
- GET clinics WHERE specialties contains {{specialty}} AND city = {{location_city}}
- ORDER BY rating DESC
- LIMIT 5
```

#### Step 4: Merge Data
```
Code (JavaScript)
{
  specialty: $input.json.specialty,
  action: $input.json.action,
  steps: {{openai_response}},
  nearby_facilities: {{supabase_clinics}},
  generated_at: new Date(),
  valid_for_days: 30
}
```

#### Step 5: Save to User History
```
Supabase
- INSERT to bpjs_queries table
- user_id, specialty, action, response, created_at
```

#### Step 6: Return Response
```
HTTP Response
- JSON dengan semua guidance data
```

### Example Response
```json
{
  "specialty": "kulit",
  "action": "rujukan",
  "steps": [
    {
      "number": 1,
      "title": "Kunjungi Faskes Primer (Klinik)",
      "description": "...",
      "documents": ["KTP", "BPJS Card"],
      "estimated_time": "1 hari"
    },
    ...
  ],
  "nearby_facilities": [
    {
      "name": "Klinik Skin Jakarta",
      "address": "...",
      "bpjs_partner": true,
      "rating": 4.8
    }
  ]
}
```

---

## 3. AI SYMPTOM ANALYSIS WORKFLOW

### Purpose
Real-time processing symptom analysis dengan OpenAI dan store results.

### Trigger
- **Type**: HTTP Webhook
- **Endpoint**: `POST /webhook/symptom-analysis`

### Request Payload
```json
{
  "user_id": "uuid",
  "symptoms": ["demam", "batuk", "sakit_kepala"],
  "duration": "3 hari",
  "severity": "moderate",
  "age": 28
}
```

### Steps

#### Step 1: Validate Symptoms
```
Code (JavaScript)
const validSymptoms = [
  'demam', 'batuk', 'pilek', 'sakit_kepala', 'mual', 'muntah',
  'diare', 'sakit_perut', 'sesak_napas', 'nyeri_dada', ...
];

const filtered = $input.json.symptoms.filter(s => validSymptoms.includes(s));
if (filtered.length === 0) throw new Error('No valid symptoms');
```

#### Step 2: Call OpenAI GPT-4
```
OpenAI
- Model: gpt-4-turbo
- Temperature: 0.7
- Max tokens: 1000
- Include medical disclaimer in system prompt
```

#### Step 3: Parse Response
```
Code (JavaScript)
// Extract JSON from OpenAI response
const parsed = JSON.parse(response);
return {
  conditions: parsed.possible_conditions,
  urgency: parsed.urgency_level,
  actions: parsed.immediate_actions,
  red_flags: parsed.red_flags
}
```

#### Step 4: Determine Urgency
```
Code (JavaScript)
const urgencyMap = {
  'low': { color: 'green', action: 'monitor_at_home' },
  'medium': { color: 'yellow', action: 'see_doctor_soon' },
  'high': { color: 'orange', action: 'see_doctor_today' },
  'emergency': { color: 'red', action: 'go_to_er' }
};
```

#### Step 5: Save to Health Records
```
Supabase
- INSERT to health_records
- record_type: 'symptom_log'
- symptoms: JSON array
- ai_suggestion: analysis result
- urgency_level: determined level
```

#### Step 6: Send Notification if High/Emergency
```
Conditional
- IF urgency_level >= 'high':
  - Send email to user
  - Send SMS notification
  - List nearby ERs/hospitals
```

---

## 4. DAILY HEALTH EDUCATION SCHEDULER WORKFLOW

### Purpose
Generate dan schedule health education content setiap hari jam 7 pagi.

### Trigger
- **Type**: Cron
- **Schedule**: `0 7 * * *` (Every day at 7 AM UTC+7 = 0 AM UTC)

### Steps

#### Step 1: Select Random Category
```
Code (JavaScript)
const categories = [
  'sleep', 'nutrition', 'exercise', 
  'mental_health', 'first_aid', 'hygiene'
];
const category = categories[Math.floor(Math.random() * categories.length)];
```

#### Step 2: Generate Content with GPT-4
```
OpenAI
- Model: gpt-4-turbo
- Prompt: Generate daily health tip untuk {{category}}, simple untuk Indonesia
- Format: JSON dengan title, content, tips
```

#### Step 3: Get Statistics
```
Supabase Query
- Count: how many health_education posts published today
- If < 2 posts, proceed; else skip
```

#### Step 4: Create Health Education Post
```
Supabase
- INSERT to health_educations table
- title: from GPT response
- content: from GPT response
- category: selected category
- difficulty_level: 'easy'
- duration_minutes: 3-5
- is_published: true
- scheduled_at: NOW()
```

#### Step 5: Send Notification to Users
```
HTTP Request (Webhook)
- POST /api/notifications
- Type: health_education
- Content: new education post
- Send to: all users dengan notification_preferences.push = true
```

#### Step 6: Log Success
```
Supabase
- INSERT to workflow_logs
- workflow: 'daily_health_education'
- status: 'success'
- timestamp: NOW()
```

### Example Generated Content
```json
{
  "category": "sleep",
  "title": "Tidur Berkualitas untuk Kesehatan Optimal",
  "content": "Tidur 7-8 jam setiap malam membantu...",
  "key_points": [
    "Tidur jam 10-11 malam (sesuai jam biologis)",
    "Hindari gadget 30 menit sebelum tidur",
    "Kamar gelap dan sejuk",
    "Rutin jadwal tidur, bahkan weekend"
  ]
}
```

---

## 5. FIND NEAREST FACILITY WORKFLOW

### Purpose
Geolocation-based facility finder dengan distance calculation.

### Trigger
- **Type**: HTTP Webhook
- **Endpoint**: `POST /webhook/find-facility`

### Request Payload
```json
{
  "user_id": "uuid",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "facility_type": "clinic|emergency|pharmacy|ambulance",
  "radius_km": 5,
  "open_now": true
}
```

### Steps

#### Step 1: Validate Location
```
Code (JavaScript)
if (Math.abs($input.json.latitude) > 90 || Math.abs($input.json.longitude) > 180) {
  throw new Error('Invalid coordinates');
}
```

#### Step 2: Query Nearby Facilities
```
Supabase (PostGIS Query)
SELECT 
  *,
  ST_Distance(
    geolocation, 
    ST_MakePoint({{lon}}, {{lat}})
  ) / 1000 AS distance_km
FROM clinics
WHERE clinic_type = {{facility_type}}
  AND ST_DWithin(
    geolocation,
    ST_MakePoint({{lon}}, {{lat}}),
    {{radius_km}} * 1000
  )
ORDER BY distance_km ASC
LIMIT 10
```

#### Step 3: Check Operating Hours
```
Code (JavaScript)
const now = new Date();
const day = now.toLocaleDateString('en-US', { weekday: 'long' });
const time = now.toTimeString().slice(0, 5);

const filtered = items.filter(clinic => {
  const hours = clinic.operating_hours[day];
  return hours && time >= hours.open && time <= hours.close;
});
```

#### Step 4: Get Facility Details
```
Supabase
- For each facility, GET:
  - Contact info
  - Services offered
  - Average wait time
  - Emergency capability
```

#### Step 5: Aggregate Response
```
Code (JavaScript)
{
  user_location: { lat, lon },
  facility_type: type,
  results: [
    {
      id, name, address, distance_km,
      phone, open_now, rating,
      services: [...],
      average_wait_time_minutes: 15
    }
  ],
  search_timestamp: NOW()
}
```

#### Step 6: Log Search
```
Supabase
- INSERT to facility_searches
- user_id, facility_type, location, results_count, timestamp
```

---

## Setup Instructions

### 1. Create N8N Cloud Account
- Go to https://n8n.cloud
- Sign up and create new account
- Create new workflow

### 2. Configure Supabase Connection
```
In N8N:
1. Add Supabase node
2. Supabase URL: {{SUPABASE_URL}}
3. API Key: {{SUPABASE_SERVICE_ROLE_KEY}}
4. Test connection
```

### 3. Configure OpenAI Connection
```
In N8N:
1. Add OpenAI node
2. API Key: {{OPENAI_API_KEY}}
3. Test with simple request
```

### 4. Deploy Webhooks
```
For each workflow:
1. Create Webhook trigger
2. Copy webhook URL
3. Add to app environment: N8N_WEBHOOK_URL_{{WORKFLOW_NAME}}
4. Test with curl
```

### 5. Set Webhook Security Token
```
Environment Variables:
N8N_WEBHOOK_TOKEN={{SECURE_RANDOM_TOKEN}}

Add to N8N node headers:
Authorization: Bearer {{N8N_WEBHOOK_TOKEN}}
```

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI
OPENAI_API_KEY=sk-...

# N8N
N8N_WEBHOOK_TOKEN={{SECURE_TOKEN}}
N8N_INSTANCE_URL=https://your-instance.n8n.cloud

# Webhooks
N8N_WEBHOOK_SYMPTOM_ANALYSIS={{webhook_url}}
N8N_WEBHOOK_BPJS_GUIDE={{webhook_url}}
N8N_WEBHOOK_FACILITY_FINDER={{webhook_url}}
```

---

## Testing Workflows

### Test Queue Management
```bash
curl -X GET http://localhost:3000/api/queues \
  -H "Authorization: Bearer {{token}}"
```

### Test BPJS Guide
```bash
curl -X POST http://n8n-instance/webhook/bpjs-guide \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "specialty": "kulit",
    "action": "rujukan"
  }'
```

### Test Symptom Analysis
```bash
curl -X POST http://n8n-instance/webhook/symptom-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["demam", "batuk"],
    "severity": "moderate"
  }'
```

---

## Monitoring & Logs

### N8N Dashboard
- View all workflow executions
- Check success/failure rates
- Monitor execution times

### Supabase Logs
```sql
SELECT * FROM workflow_logs 
ORDER BY timestamp DESC 
LIMIT 50;
```

### Error Handling
- All workflows have error node that logs to Supabase
- Errors trigger Slack notification (optional)
- Retry logic: 3 attempts with 5min intervals

---

## Performance Optimization

- Queue polling: 30-second interval (configurable)
- Health education: 1x daily at 7 AM
- Caching: Facility results cached 1 hour
- Batch processing: Multiple BPJS requests combined

---

## Future Enhancements

- Multi-language support (Sundanese, Javanese)
- Voice input for symptom checker
- Integration with SMS provider for SMS notifications
- Real-time doctor schedule updates
- Patient satisfaction feedback loop
